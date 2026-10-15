// API catalog (RFC 9727): a standard, well-known URL where agents discover the
// site's APIs without scraping docs. Advertised by the homepage Link header in
// next.config.js.
export function GET() {
  return Response.json(
    {
      linkset: [
        {
          // The API this entry describes: the Django backend.
          anchor: `${process.env.NEXT_PUBLIC_API_URL}/api/`,
          // Human-readable documentation for it. The backend publishes no
          // OpenAPI spec, so there is no `service-desc` entry.
          'service-doc': [{ href: 'https://docs.researchhub.com/', type: 'text/html' }],
        },
      ],
    },
    {
      // RFC 9727 requires the linkset media type; Response.json would
      // otherwise send application/json.
      headers: {
        'Content-Type':
          'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      },
    }
  );
}
