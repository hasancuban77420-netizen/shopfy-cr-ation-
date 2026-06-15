from PIL import Image, ImageFilter
from collections import deque
import sys

def detour(src, dst, tol=28):
    im = Image.open(src).convert('RGBA')
    w,h = im.size; px = im.load()
    visited = bytearray(w*h); dq = deque()
    def white(p): return p[0]>255-tol and p[1]>255-tol and p[2]>255-tol
    for x in range(w):
        for y in (0,h-1):
            i=y*w+x
            if not visited[i] and white(px[x,y]): visited[i]=1; dq.append((x,y))
    for y in range(h):
        for x in (0,w-1):
            i=y*w+x
            if not visited[i] and white(px[x,y]): visited[i]=1; dq.append((x,y))
    while dq:
        x,y=dq.popleft()
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx,ny=x+dx,y+dy
            if 0<=nx<w and 0<=ny<h:
                i=ny*w+nx
                if not visited[i] and white(px[nx,ny]): visited[i]=1; dq.append((nx,ny))
    alpha=Image.new('L',(w,h),0); ap=alpha.load()
    for y in range(h):
        for x in range(w): ap[x,y]=0 if visited[y*w+x] else 255
    alpha=alpha.filter(ImageFilter.GaussianBlur(0.5))
    im.putalpha(alpha)
    bbox=im.getbbox()
    if bbox:
        m=14; bbox=(max(0,bbox[0]-m),max(0,bbox[1]-m),min(w,bbox[2]+m),min(h,bbox[3]+m)); im=im.crop(bbox)
    im.save(dst,'WEBP',quality=90,method=6); print(dst, im.size)

if __name__=='__main__':
    tol = int(sys.argv[3]) if len(sys.argv)>3 else 28
    detour(sys.argv[1], sys.argv[2], tol)
