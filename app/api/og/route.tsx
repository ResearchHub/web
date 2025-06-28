import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const description = searchParams.get('description');
  const author = searchParams.get('author');
  const type = searchParams.get('type') || 'article';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          padding: '60px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            opacity: 0.1,
          }}
        />

        {/* Logo and brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <img
            src="https://researchhub.com/logo_blue.png"
            alt="ResearchHub"
            width={480}
            height={120}
            style={{
              display: 'block',
              background: '#fff',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Content type badge */}
        {type && (
          <div
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '30px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {type}
          </div>
        )}

        {/* Title */}
        {title && (
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#1f2937',
              margin: '0 0 20px 0',
              lineHeight: 1.2,
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>
        )}

        {/* Description */}
        {description && (
          <p
            style={{
              fontSize: '24px',
              textAlign: 'center',
              color: '#6b7280',
              margin: '0 0 30px 0',
              lineHeight: 1.4,
              maxWidth: '800px',
            }}
          >
            {description}
          </p>
        )}

        {/* Author */}
        {author && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '18px',
              color: '#9ca3af',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#e5e7eb',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280',
              }}
            >
              {author.charAt(0).toUpperCase()}
            </div>
            <span>By {author}</span>
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
