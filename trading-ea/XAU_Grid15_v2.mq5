//+------------------------------------------------------------------+
//| XAU_Grid15_v2                                                    |
//| XAUUSD only - MetaTrader 5                                       |
//|                                                                  |
//| Grille fixe : multiples purs de 15                              |
//| 1 position max - jamais achat + vente en meme temps             |
//| Pas de Take Profit                                              |
//| SL initial = 1 palier - trailing 1 palier derriere             |
//| STOP-AND-REVERSE : au SL touche on ferme et on tente d'ouvrir   |
//|   la position opposee au meme palier                            |
//| MEMOIRE JOURNALIERE (cliquet) :                                 |
//|   - prochain ACHAT seulement >= PlusHautAchat + pas             |
//|   - prochaine VENTE seulement <= PlusBasVente  - pas            |
//|   => achats de plus en plus haut, ventes de plus en plus bas    |
//|   => "zone morte" au milieu : aucun trade                       |
//| RESET chaque jour : on oublie tout                              |
//| Risque = % de l'equity a chaque nouveau trade                   |
//+------------------------------------------------------------------+
#property strict
#property version   "2.0"

#include <Trade/Trade.mqh>
CTrade Trade;

//=========================== INPUTS ===========================
input double StepPrice    = 15.0;     // pas de grille (1 palier)
input double RiskPct      = 10.0;     // risque par trade (% de l'equity)
input double LotMaxCap    = 100.0;    // plafond de securite du lot
input double SlippageFrac = 0.33;     // deviation autorisee (fraction du pas)
input long   MagicNumber  = 150015;   // identifiant des trades de l'EA

//=========================== GLOBALS ==========================
double g_point     = 0.0;
double g_ticksize  = 0.0;
int    g_digits    = 0;

// Detection des franchissements de palier
bool   g_prevReady = false;
double g_prevBid   = 0.0;

// Suivi de la position en cours (de l'EA)
bool   g_hadPosition = false;
ulong  g_posTicket   = 0;
int    g_curDir      = 0;       // +1 achat, -1 vente, 0 aucun
double g_curExtreme  = 0.0;     // palier extreme atteint (haut si achat, bas si vente)
double g_curSL       = 0.0;     // niveau de SL courant (palier)
bool   g_tradeOpened = false;

// Memoire journaliere (cliquet)
double g_plusHautAchat = -DBL_MAX;   // prochain achat seulement >= ceci + pas
double g_plusBasVente  =  DBL_MAX;   // prochaine vente seulement <= ceci - pas

// Tracker du reset quotidien
int    g_lastResetYear = -1;
int    g_lastResetMon  = -1;
int    g_lastResetDay  = -1;

//=========================== UTILS ============================
bool TradingAllowedNow()
{
   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED)) return false;
   if(!AccountInfoInteger(ACCOUNT_TRADE_ALLOWED))    return false;

   long mode = 0;
   if(!SymbolInfoInteger(_Symbol, SYMBOL_TRADE_MODE, mode)) return false;
   if(mode == SYMBOL_TRADE_MODE_DISABLED) return false;

   return true;
}

bool IsXAUUSD()
{
   string s = _Symbol;
   StringToUpper(s);
   return (StringFind(s, "XAUUSD") >= 0);
}

double RoundToTick(double price)
{
   if(g_ticksize > 0.0)
      return NormalizeDouble(MathRound(price / g_ticksize) * g_ticksize, g_digits);
   return NormalizeDouble(price, g_digits);
}

double Tol()
{
   return MathMax(g_ticksize, g_point);
}

// ----- grille -----
double GridFloor(double p){ return RoundToTick(MathFloor(p / StepPrice) * StepPrice); }
double GridCeil (double p){ return RoundToTick(MathCeil (p / StepPrice) * StepPrice); }
long   GridIdx  (double p){ return (long)MathFloor(p / StepPrice); }

double Bid(){ double v=0.0; SymbolInfoDouble(_Symbol, SYMBOL_BID, v); return v; }
double Ask(){ double v=0.0; SymbolInfoDouble(_Symbol, SYMBOL_ASK, v); return v; }

double MinDistFromStops()
{
   int stopsPts  = (int)SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
   int freezePts = (int)SymbolInfoInteger(_Symbol, SYMBOL_TRADE_FREEZE_LEVEL);

   double minDist = 0.0;
   if(stopsPts  > 0) minDist = MathMax(minDist, stopsPts  * g_point);
   if(freezePts > 0) minDist = MathMax(minDist, freezePts * g_point);

   return minDist;
}

void SetDeviationByStep()
{
   double slip = StepPrice * SlippageFrac;
   int dev = 1;
   if(g_point > 0.0)
      dev = (int)MathMax(slip / MathMax(g_point, 1e-9), 1);
   Trade.SetDeviationInPoints(dev);
}

//----- selection de NOTRE position (filtre magic) -----
bool SelectMyPosition()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong t = PositionGetTicket(i);
      if(t == 0) continue;
      if(PositionGetString(POSITION_SYMBOL)   != _Symbol)     continue;
      if(PositionGetInteger(POSITION_MAGIC)   != MagicNumber) continue;
      return true; // selectionnee
   }
   return false;
}

bool HasOpenPosition()
{
   return SelectMyPosition();
}

//=========================== RISK / LOT =======================
double MoneyPerLotBetween(double pA, double pB)
{
   double dist = MathAbs(pA - pB);

   double tsize = 0.0, tvalue = 0.0, point = 0.0;
   SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE,  tsize);
   SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE, tvalue);
   SymbolInfoDouble(_Symbol, SYMBOL_POINT,            point);

   double ticks = 0.0;
   if(tsize > 0.0) ticks = dist / tsize;
   if(ticks <= 0.0 && point > 0.0) ticks = dist / point;
   if(ticks <= 0.0 || tvalue <= 0.0) return 0.0;

   return ticks * tvalue;
}

double LotForRisk(double riskPct, double entry, double sl)
{
   double equity     = AccountInfoDouble(ACCOUNT_EQUITY);
   double riskMoney  = equity * (riskPct / 100.0);
   double perLotAtSL = MoneyPerLotBetween(entry, sl);
   if(perLotAtSL <= 0.0) return 0.0;

   double lots = riskMoney / perLotAtSL;

   double vstep = 0.01, vmin = 0.0, vmax = 100.0;
   SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP, vstep);
   SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN,  vmin);
   SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX,  vmax);
   if(vstep <= 0.0) vstep = 0.01;

   lots = MathFloor(lots / vstep) * vstep;
   lots = MathMax(lots, vmin);
   lots = MathMin(lots, MathMin(vmax, LotMaxCap));

   return lots;
}

double FitLotsToMargin(ENUM_ORDER_TYPE type, double lotsWanted, double priceRef)
{
   double vstep = 0.01, vmin = 0.0, vmax = 100.0;
   SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP, vstep);
   SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN,  vmin);
   SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX,  vmax);
   if(vstep <= 0.0) vstep = 0.01;

   lotsWanted = MathMin(lotsWanted, MathMin(vmax, LotMaxCap));
   lotsWanted = MathFloor(lotsWanted / vstep) * vstep;
   if(lotsWanted < vmin) return 0.0;

   double free = AccountInfoDouble(ACCOUNT_FREEMARGIN);
   double lots = lotsWanted;

   for(int i = 0; i < 500; i++)
   {
      double margin = 0.0;
      if(OrderCalcMargin(type, _Symbol, lots, priceRef, margin))
         if(margin > 0.0 && margin <= free)
            return lots;

      lots -= vstep;
      if(lots < vmin) break;
   }
   return 0.0;
}

//=========================== DAILY RESET ======================
void UpdateResetDateFromNow()
{
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   g_lastResetYear = dt.year;
   g_lastResetMon  = dt.mon;
   g_lastResetDay  = dt.day;
}

bool IsNewDay()
{
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);

   if(g_lastResetYear == -1) return true;
   if(dt.year != g_lastResetYear) return true;
   if(dt.mon  != g_lastResetMon)  return true;
   if(dt.day  != g_lastResetDay)  return true;
   return false;
}

void ResetDailyState()
{
   double bid = Bid();

   // On oublie tout d'hier (memoire journaliere)
   g_plusHautAchat = -DBL_MAX;
   g_plusBasVente  =  DBL_MAX;

   // Reference de franchissement remise sur le prix courant
   g_prevBid   = bid;
   g_prevReady = true;

   UpdateResetDateFromNow();

   PrintFormat("DAILY RESET | %04d-%02d-%02d | bid=%.2f | memoire effacee",
               g_lastResetYear, g_lastResetMon, g_lastResetDay, bid);
}

//=========================== OUVERTURE =========================
// Ouvre un trade dir (+1 achat / -1 vente) avec entree au palier "trigger".
// SL = trigger -/+ pas. Met a jour le suivi de position.
bool OpenTrade(int dir, double trigger)
{
   double minDist = MinDistFromStops();
   double entry, sl;
   ENUM_ORDER_TYPE otype;

   if(dir == +1)
   {
      entry = Ask();
      sl    = RoundToTick(trigger - StepPrice);
      otype = ORDER_TYPE_BUY;
      if((entry - sl) < minDist)
      {
         PrintFormat("ACHAT SKIP SL trop proche entry=%.2f sl=%.2f minDist=%.2f", entry, sl, minDist);
         return false;
      }
   }
   else
   {
      entry = Bid();
      sl    = RoundToTick(trigger + StepPrice);
      otype = ORDER_TYPE_SELL;
      if((sl - entry) < minDist)
      {
         PrintFormat("VENTE SKIP SL trop proche entry=%.2f sl=%.2f minDist=%.2f", entry, sl, minDist);
         return false;
      }
   }

   double lotsWanted = LotForRisk(RiskPct, entry, sl);
   if(lotsWanted <= 0.0)
   {
      PrintFormat("%s SKIP lots<=0 entry=%.2f sl=%.2f", (dir>0?"ACHAT":"VENTE"), entry, sl);
      return false;
   }

   double lots = FitLotsToMargin(otype, lotsWanted, (dir>0?Ask():Bid()));
   if(lots <= 0.0)
   {
      PrintFormat("%s SKIP marge insuffisante wanted=%.3f", (dir>0?"ACHAT":"VENTE"), lotsWanted);
      return false;
   }

   bool ok;
   if(dir == +1) ok = Trade.Buy (lots, _Symbol, 0.0, sl, 0.0, "GRID15_BUY");
   else          ok = Trade.Sell(lots, _Symbol, 0.0, sl, 0.0, "GRID15_SELL");

   if(!ok)
   {
      PrintFormat("%s FAIL trigger=%.2f sl=%.2f lots=%.3f err=%d",
                  (dir>0?"ACHAT":"VENTE"), trigger, sl, lots, _LastError);
      ResetLastError();
      return false;
   }

   // Suivi de la nouvelle position
   g_curDir     = dir;
   g_curSL      = sl;
   g_curExtreme = (dir>0 ? GridFloor(entry) : GridCeil(entry));
   g_tradeOpened = true;
   g_posTicket  = 0;
   if(SelectMyPosition())
      g_posTicket = (ulong)PositionGetInteger(POSITION_TICKET);

   PrintFormat("%s OPEN trigger=%.2f entry=%.2f sl=%.2f lots=%.3f | hautAchat=%.2f basVente=%.2f",
               (dir>0?"ACHAT":"VENTE"), trigger, entry, sl, lots,
               g_plusHautAchat, g_plusBasVente);
   return true;
}

//=========================== ENTREE (FLAT) ====================
// Cherche un franchissement de palier et ouvre si la memoire l'autorise.
void TryOpenFromMovement()
{
   double bid = Bid();

   if(!g_prevReady)
   {
      g_prevBid   = bid;
      g_prevReady = true;
      return;
   }

   long prevIdx = GridIdx(g_prevBid);
   long currIdx = GridIdx(bid);
   long delta   = currIdx - prevIdx;

   if(delta == 0){ g_prevBid = bid; return; }

   if(delta >= 1)   // ----- mouvement haussier -> ACHAT -----
   {
      double firstCrossed = RoundToTick((prevIdx + 1) * StepPrice);
      double floorAllowed = (g_plusHautAchat <= -DBL_MAX*0.5)
                            ? firstCrossed
                            : RoundToTick(g_plusHautAchat + StepPrice);
      double entryLevel   = MathMax(firstCrossed, floorAllowed);
      double highestCross = RoundToTick(currIdx * StepPrice);

      if(entryLevel <= highestCross + Tol())
         OpenTrade(+1, entryLevel);
      else
         PrintFormat("ACHAT zone morte: paliers %.2f..%.2f tous < seuil %.2f",
                     firstCrossed, highestCross, floorAllowed);
   }
   else             // ----- mouvement baissier -> VENTE -----
   {
      double firstCrossed = RoundToTick(prevIdx * StepPrice);
      double ceilAllowed  = (g_plusBasVente >= DBL_MAX*0.5)
                            ? firstCrossed
                            : RoundToTick(g_plusBasVente - StepPrice);
      double entryLevel   = MathMin(firstCrossed, ceilAllowed);
      double lowestCross  = RoundToTick((currIdx + 1) * StepPrice);

      if(entryLevel >= lowestCross - Tol())
         OpenTrade(-1, entryLevel);
      else
         PrintFormat("VENTE zone morte: paliers %.2f..%.2f tous > seuil %.2f",
                     firstCrossed, lowestCross, ceilAllowed);
   }

   g_prevBid = bid;
}

//=========================== TRAILING =========================
void ManageOpenPositionTrailing()
{
   if(!SelectMyPosition()) return;

   long   posType   = PositionGetInteger(POSITION_TYPE);
   ulong  ticket    = (ulong)PositionGetInteger(POSITION_TICKET);
   double currentSL = PositionGetDouble(POSITION_SL);
   double minDist   = MinDistFromStops();
   double bid = Bid(), ask = Ask();

   if(posType == POSITION_TYPE_BUY)
   {
      // extreme = plus haut palier atteint
      double newH = GridFloor(bid);
      if(newH > g_curExtreme) g_curExtreme = newH;

      double targetSL = RoundToTick(g_curExtreme - StepPrice);
      double maxSL    = RoundToTick(bid - minDist);
      if(targetSL > maxSL) targetSL = maxSL;

      if(targetSL >= bid) return;
      if(targetSL <= currentSL + Tol()) return;   // ne recule jamais

      if(Trade.PositionModify(ticket, targetSL, 0.0))
      {
         g_curSL = targetSL;
         PrintFormat("TRAIL ACHAT bid=%.2f newSL=%.2f (haut=%.2f)", bid, targetSL, g_curExtreme);
      }
      else { PrintFormat("TRAIL ACHAT FAIL newSL=%.2f err=%d", targetSL, _LastError); ResetLastError(); }
   }
   else if(posType == POSITION_TYPE_SELL)
   {
      double newL = GridCeil(ask);
      if(newL < g_curExtreme) g_curExtreme = newL;

      double targetSL = RoundToTick(g_curExtreme + StepPrice);
      double minSL    = RoundToTick(ask + minDist);
      if(targetSL < minSL) targetSL = minSL;

      if(targetSL <= ask) return;
      if(currentSL > 0.0 && targetSL >= currentSL - Tol()) return;  // ne recule jamais

      if(Trade.PositionModify(ticket, targetSL, 0.0))
      {
         g_curSL = targetSL;
         PrintFormat("TRAIL VENTE ask=%.2f newSL=%.2f (bas=%.2f)", ask, targetSL, g_curExtreme);
      }
      else { PrintFormat("TRAIL VENTE FAIL newSL=%.2f err=%d", targetSL, _LastError); ResetLastError(); }
   }
}

//=========================== CLOTURE + REVERSE ================
void ProcessClosedTradeAndReverse()
{
   if(!g_tradeOpened) return;

   int    closedDir   = g_curDir;
   double extreme     = g_curExtreme;
   double reverseLvl  = g_curSL;       // le SL touche = palier de retournement

   // 1) Enregistrement de l'extreme en memoire journaliere
   if(closedDir == +1)
      g_plusHautAchat = MathMax(g_plusHautAchat, extreme);
   else if(closedDir == -1)
      g_plusBasVente  = MathMin(g_plusBasVente, extreme);

   PrintFormat("CLOSE %s | extreme=%.2f | hautAchat=%.2f basVente=%.2f | retour palier=%.2f",
               (closedDir>0?"ACHAT":"VENTE"), extreme,
               g_plusHautAchat, g_plusBasVente, reverseLvl);

   // 2) Remise a zero du suivi de position
   g_tradeOpened = false;
   g_curDir      = 0;
   g_posTicket   = 0;

   // 3) Tentative de retournement au meme palier (si la memoire l'autorise)
   if(closedDir == +1)
   {
      // on tente une VENTE
      if(reverseLvl <= g_plusBasVente - StepPrice + Tol())
      {
         if(OpenTrade(-1, reverseLvl))
            PrintFormat("REVERSE -> VENTE au palier %.2f", reverseLvl);
      }
      else
         PrintFormat("REVERSE bloque: vente %.2f > seuil %.2f -> FLAT",
                     reverseLvl, RoundToTick(g_plusBasVente - StepPrice));
   }
   else if(closedDir == -1)
   {
      // on tente un ACHAT
      if(reverseLvl >= g_plusHautAchat + StepPrice - Tol())
      {
         if(OpenTrade(+1, reverseLvl))
            PrintFormat("REVERSE -> ACHAT au palier %.2f", reverseLvl);
      }
      else
         PrintFormat("REVERSE bloque: achat %.2f < seuil %.2f -> FLAT",
                     reverseLvl, RoundToTick(g_plusHautAchat + StepPrice));
   }

   // 4) Reference de franchissement remise sur le prix courant
   g_prevBid   = Bid();
   g_prevReady = true;
}

//=========================== INIT / DEINIT ====================
int OnInit()
{
   if(!IsXAUUSD())
   {
      Print("ERREUR : EA reserve a XAUUSD.");
      return(INIT_FAILED);
   }
   if(StepPrice <= 0.0)
   {
      Print("ERREUR : StepPrice doit etre > 0.");
      return(INIT_FAILED);
   }

   SymbolInfoDouble(_Symbol, SYMBOL_POINT,           g_point);
   SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE, g_ticksize);
   g_digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);

   Trade.SetExpertMagicNumber((ulong)MagicNumber);
   SetDeviationByStep();

   g_prevBid   = Bid();
   g_prevReady = true;

   g_plusHautAchat = -DBL_MAX;
   g_plusBasVente  =  DBL_MAX;

   // Adoption d'une position existante (en cas de redemarrage)
   g_tradeOpened = false;
   g_curDir      = 0;
   g_posTicket   = 0;
   if(SelectMyPosition())
   {
      long t = PositionGetInteger(POSITION_TYPE);
      g_curDir      = (t == POSITION_TYPE_BUY ? +1 : -1);
      g_curSL       = PositionGetDouble(POSITION_SL);
      g_curExtreme  = (g_curDir>0 ? GridFloor(Bid()) : GridCeil(Ask()));
      g_tradeOpened = true;
      g_posTicket   = (ulong)PositionGetInteger(POSITION_TICKET);
   }
   g_hadPosition = HasOpenPosition();

   UpdateResetDateFromNow();

   PrintFormat("XAU_Grid15_v2 | %s | pas=%.2f | risque=%.1f%% | magic=%d",
               _Symbol, StepPrice, RiskPct, (int)MagicNumber);
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason) {}

//=========================== ONTICK ===========================
void OnTick()
{
   if(!TradingAllowedNow()) return;

   if(IsNewDay())
      ResetDailyState();

   bool hasPos = HasOpenPosition();

   // Detection d'une cloture -> enregistrement memoire + retournement
   if(g_hadPosition && !hasPos)
   {
      ProcessClosedTradeAndReverse();
      g_hadPosition = HasOpenPosition();
      return;
   }

   if(hasPos)
   {
      ManageOpenPositionTrailing();
      g_hadPosition = true;
      return;
   }

   // Flat : on cherche une entree
   TryOpenFromMovement();
   g_hadPosition = HasOpenPosition();
}
//+------------------------------------------------------------------+
