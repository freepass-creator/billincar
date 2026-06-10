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
        <svg width="100" height="100" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1.05a2.5 2.5 0 0 1-4.9 0H9.95a2.5 2.5 0 0 1-4.9 0H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h1zm2.3 0h9.4l-1-3H8.3l-1 3z" />
          <circle cx="7.5" cy="16" r="1.5" />
          <circle cx="16.5" cy="16" r="1.5" />
        </svg>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: -1,
            marginTop: 10,
          }}
        >
          빌린카
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: 4,
            marginTop: 2,
          }}
        >
          MANAGER
        </div>
      </div>
    ),
    { ...size },
  );
}
