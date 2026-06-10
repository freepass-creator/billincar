import { ImageResponse } from 'next/og';

export const alt = '빌린카 — 렌터카매니저 ERP';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1B2A4A 0%, #0b1220 100%)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          padding: '72px 88px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* 우상단 영문 슬로건 */}
        <div
          style={{
            position: 'absolute',
            top: 72,
            right: 88,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 18,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: 4,
          }}
        >
          <span style={{ display: 'flex', width: 36, height: 2, background: 'rgba(255,255,255,0.6)' }} />
          RENTCAR OPERATION ERP
        </div>

        {/* 메인 영역 — 가운데 하단 정렬 */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', gap: 14 }}>
          {/* 영문 eyebrow */}
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              fontWeight: 800,
              color: '#94a3b8',
              letterSpacing: 8,
              textTransform: 'uppercase',
            }}
          >
            BILLINCAR · RENTCAR MANAGER
          </div>

          {/* 큰 한글 제품명 — 빌린카 */}
          <div
            style={{
              display: 'flex',
              fontSize: 144,
              fontWeight: 900,
              letterSpacing: -3,
              lineHeight: 1.05,
            }}
          >
            빌린카
          </div>

          {/* 보조 — 렌터카매니저 ERP */}
          <div
            style={{
              display: 'flex',
              fontSize: 36,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: -1,
              marginTop: 4,
            }}
          >
            렌터카매니저 ERP
          </div>

          {/* 강조 막대 */}
          <div style={{ display: 'flex', width: 96, height: 6, background: '#fff', marginTop: 6, marginBottom: 16 }} />

          {/* 설명 */}
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.45,
              maxWidth: 980,
            }}
          >
            차량 · 계약 · 수납 · 미수 · 과태료를 한 곳에서.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
