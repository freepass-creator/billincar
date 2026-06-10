import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/** 자동차 측면 SVG (24x24 → 32x32 컨테이너) — JPK 네이비 배경 + 흰색 차량 실루엣 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1B2A4A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 7,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1.05a2.5 2.5 0 0 1-4.9 0H9.95a2.5 2.5 0 0 1-4.9 0H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h1zm2.3 0h9.4l-1-3H8.3l-1 3z" />
          <circle cx="7.5" cy="16" r="1.5" />
          <circle cx="16.5" cy="16" r="1.5" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
