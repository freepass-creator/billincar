import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1B2A4A',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: -1,
          fontFamily: 'system-ui, sans-serif',
          borderRadius: 6,
        }}
      >
        렌
      </div>
    ),
    { ...size },
  );
}
