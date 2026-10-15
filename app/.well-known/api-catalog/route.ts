// API catalog (RFC 9727), advertised by the homepage Link header in next.config.js.
export function GET() {
  return Response.json(
    {
      linkset: [
        {
          anchor: `${process.env.NEXT_PUBLIC_API_URL}/api/`,
          'service-doc': [{ href: 'https://docs.researchhub.com/', type: 'text/html' }],
        },
      ],
    },
    {
      headers: {
        'Content-Type':
          'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      },
    }
  );
}
