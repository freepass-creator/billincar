import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1B2A4A',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          borderRadius: 40,
          gap: 2,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: -3,
            lineHeight: 1,
          }}
        >
          렌터카
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: 6,
            marginTop: 6,
          }}
        >
          MANAGER
        </div>
      </div>
    ),
    { ...size },
  );
}
