import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          background:
            'linear-gradient(135deg, #0f141a 0%, #111821 45%, #182230 100%)',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 70,
            width: 260,
            height: 260,
            borderRadius: 999,
            background: 'rgba(102, 192, 244, 0.16)',
            filter: 'blur(40px)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            right: 90,
            bottom: 50,
            width: 320,
            height: 320,
            borderRadius: 999,
            background: 'rgba(42, 71, 94, 0.30)',
            filter: 'blur(45px)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px 70px',
            width: '100%',
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                background: '#66c0f4',
                display: 'flex',
                borderRadius: 8,
              }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  color: '#66c0f4',
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                }}
              >
                tracker
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                }}
              >
                GameScraper
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 820 }}>
            <div
              style={{
                fontSize: 78,
                lineHeight: 1.05,
                fontWeight: 900,
                marginBottom: 24,
              }}
            >
              Suis les mises à jour
              <span style={{ color: '#66c0f4' }}> de jeux</span>
            </div>

            <div
              style={{
                fontSize: 30,
                lineHeight: 1.4,
                color: '#c7d5e0',
                maxWidth: 900,
              }}
            >
              Pages dédiées, suivi local, navigation claire et accès rapide aux dernières updates.
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 18,
            }}
          >
            <div
              style={{
                background: '#66c0f4',
                color: '#0b141b',
                padding: '14px 24px',
                fontSize: 24,
                fontWeight: 800,
                borderRadius: 8,
              }}
            >
              /updates
            </div>

            <div
              style={{
                background: '#223041',
                color: 'white',
                padding: '14px 24px',
                fontSize: 24,
                borderRadius: 8,
              }}
            >
              /games
            </div>

            <div
              style={{
                background: '#223041',
                color: 'white',
                padding: '14px 24px',
                fontSize: 24,
                borderRadius: 8,
              }}
            >
              /watchlist
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}