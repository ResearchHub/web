import { SITE_CONFIG } from '@/lib/metadata';

// API catalog (RFC 9727): a standard, well-known URL where agents discover the
// site's APIs without scraping docs. Advertised by the homepage Link header in
// next.config.js.
export function GET() {
  return Response.json(
    {
      linkset: [
        // The Django backend publishes no OpenAPI spec or API docs, so it is
        // listed as a bare `item` link (RFC 9727 Appendix A.2) rather than an
        // entry with `service-desc` and `service-doc`.
        {
          anchor: `${SITE_CONFIG.url}/.well-known/api-catalog`,
          item: [{ href: `${process.env.NEXT_PUBLIC_API_URL}/api/` }],
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
