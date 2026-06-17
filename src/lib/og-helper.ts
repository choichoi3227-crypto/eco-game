let fontCache: ArrayBuffer | null = null;

export async function getPretendardFont() {
  if (fontCache) return fontCache;
  const fontUrl = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/packages/pretendard/dist/web/static/woff/Pretendard-Bold.woff';
  const response = await fetch(fontUrl);
  fontCache = await response.arrayBuffer();
  return fontCache;
}
