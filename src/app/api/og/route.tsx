import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
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
        backgroundImage: 'linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          STE-SCPB
        </h1>
        <p
          style={{
            fontSize: '36px',
            color: '#d4af37',
            marginBottom: '10px',
            textAlign: 'center',
          }}
        >
          Export Cacao & Café Cameroun
        </p>
        <p
          style={{
            fontSize: '28px',
            color: '#ffffff',
            opacity: 0.9,
            textAlign: 'center',
          }}
        >
          Fournisseur Certifié B2B
        </p>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
