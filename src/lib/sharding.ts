import satori from 'satori';
import { getPretendardFont } from './og-helper';

export async function generateOgImage(cacheKey: string, env: any) {
  const fontData = await getPretendardFont();
  
  // 간단한 통계 데이터 예시 (실제 구현 시 DB에서 가져온 데이터 연결)
  const isUser = cacheKey.startsWith('user-');
  const title = isUser ? "나의 분리수거 성적표" : "전국 분리수거 실시간 통계";

  return await satori(
    <div style={{
      display: 'flex', flexDirection: 'column', width: '1200px', height: '630px',
      backgroundColor: '#0052FF', color: 'white', padding: '60px', fontFamily: 'Pretendard'
    }}>
      <div style={{ fontSize: '40px', marginBottom: '20px', opacity: 0.8 }}>CloudPress Report</div>
      <div style={{ fontSize: '72px', fontWeight: 'bold', marginBottom: '40px' }}>{title}</div>
      <div style={{ display: 'flex', flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '30px', padding: '40px', alignItems: 'center', justifyContent: 'center', fontSize: '100px' }}>
        {isUser ? "A+" : "87.5%"}
      </div>
      <div style={{ marginTop: '40px', fontSize: '24px' }}>cloudpress.com에서 당신의 등급을 확인하세요.</div>
    </div>,
    {
      width: 1200, height: 630,
      fonts: [{ name: 'Pretendard', data: fontData, weight: 700 }]
    }
  );
}
