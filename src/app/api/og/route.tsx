import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'STE-SCPB';
  const subtitle = searchParams.get('subtitle') || 'Export Cacao & Café Cameroun';

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a472a',
        backgroundImage: 'linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #1a472a 100%)',
        position: 'relative',
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          zIndex: 1,
        }}
      >
        {/* Logo placeholder - white box */}
        <div
          style={{
            width: '140px',
            height: '140px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#1a472a',
            }}
          >
            SCPB
          </div>
        </div>

        <h1
          style={{
            fontSize: '80px',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '20px',
            textAlign: 'center',
            letterSpacing: '-2px',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: '40px',
            color: '#d4af37',
            marginBottom: '15px',
            textAlign: 'center',
            fontWeight: '600',
          }}
        >
          {subtitle}
        </p>
        <p
          style={{
            fontSize: '28px',
            color: '#ffffff',
            opacity: 0.85,
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          Exportateur camerounais de cacao premium, café vert et produits agricoles certifiés
        </p>

        {/* Badges */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '40px',
          }}
        >
          <div
            style={{
              padding: '12px 30px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '30px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '22px',
              color: '#ffffff',
              fontWeight: '600',
            }}
          >
            🌍 Export International
          </div>
          <div
            style={{
              padding: '12px 30px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '30px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '22px',
              color: '#ffffff',
              fontWeight: '600',
            }}
          >
            ✓ Certifié Bio & Fairtrade
          </div>
          <div
            style={{
              padding: '12px 30px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '30px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '22px',
              color: '#ffffff',
              fontWeight: '600',
            }}
          >
            📦 Devis 24h
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
