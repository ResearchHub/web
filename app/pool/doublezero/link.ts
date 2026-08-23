/**
 * The one link the page argues about, worked out from first principles so the
 * diagram, the readouts and the copy can never drift apart.
 *
 * Madrid <-> Wellington is the illustration: the best-known pair of antipodal
 * cities, 178.6 degrees apart. That is very close to the worst case the surface
 * can hand you, so the chord is essentially a diameter and passes within 80 km
 * of the Earth's centre — through the inner core. Nothing here beats the speed
 * of light; the chord simply covers less ground than the surface does.
 */

interface Site {
  name: string;
  lat: number;
  lon: number;
}

export const TX_SITE: Site = { name: 'Madrid', lat: 40.4168, lon: -3.7038 };
export const RX_SITE: Site = { name: 'Wellington', lat: -41.2866, lon: 174.7756 };

/** Earth's mean radius. */
export const EARTH_RADIUS_KM = 6371;

export const C_KM_S = 299792.458;

/** Group index of single-mode fiber at 1550 nm: light in glass is ~32% slower. */
export const FIBER_INDEX = 1.47;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Angle the two endpoints subtend at the Earth's centre, by the haversine
 * formula. Everything below falls out of this one number.
 */
export const CENTRAL_ANGLE = (() => {
  const dLat = toRad(RX_SITE.lat - TX_SITE.lat);
  const dLon = toRad(RX_SITE.lon - TX_SITE.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(TX_SITE.lat)) * Math.cos(toRad(RX_SITE.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(a)));
})();

export const CENTRAL_ANGLE_DEG = (CENTRAL_ANGLE * 180) / Math.PI;

/** Great-circle surface distance: the shortest route a cable could ever take. */
export const SURFACE_KM = EARTH_RADIUS_KM * CENTRAL_ANGLE;

/** Straight-line distance between the endpoints, through the planet. */
export const CHORD_KM = 2 * EARTH_RADIUS_KM * Math.sin(CENTRAL_ANGLE / 2);

/** How far below the surface that chord dips at its midpoint. */
export const CHORD_DEPTH_KM = EARTH_RADIUS_KM * (1 - Math.cos(CENTRAL_ANGLE / 2));

/** Closest the chord comes to the Earth's centre. Under 80 km, so: inner core. */
export const CHORD_CENTRE_MISS_KM = EARTH_RADIUS_KM * Math.cos(CENTRAL_ANGLE / 2);

/**
 * A neutrino crosses the chord at c. It has mass, so strictly it is a hair
 * slower — but at the TeV energies this RFP contemplates the deficit is
 * 1 - v/c ~ 1e-26, which over this baseline is ~1e-28 s. Rounded away roughly
 * twenty-five decimal places before the first digit we display.
 */
export const CHORD_MS = (CHORD_KM / C_KM_S) * 1000;

/** Fiber pays twice — the longer path and the slower medium. */
export const SURFACE_MS = ((SURFACE_KM * FIBER_INDEX) / C_KM_S) * 1000;

export const SAVED_MS = SURFACE_MS - CHORD_MS;

/**
 * Shell boundaries by depth, as fractions of the radius, for the cross-section.
 * Upper/lower mantle at 660 km, the core-mantle boundary at 2,890 km, and the
 * inner core at 5,150 km — all of which this chord goes through, twice.
 */
export const SHELL_DEPTHS_KM = [660, 2890, 5150];
export const SHELL_RADII = SHELL_DEPTHS_KM.map((depth) => 1 - depth / EARTH_RADIUS_KM);

/**
 * Where along the chord (0-1) the beam crosses each shell boundary.
 *
 * Distance from the centre at parameter `u` is a hyperbola in `u`, so each
 * shell is met twice — once going in, once coming out — symmetrically about the
 * midpoint. Returned in the order the beam meets them.
 */
export const SHELL_CROSSINGS: { at: number; shell: number }[] = SHELL_RADII.flatMap(
  (frac, shell) => {
    const half = Math.cos(CENTRAL_ANGLE / 2);
    const span = frac * frac - half * half;
    if (span <= 0) return [];
    const offset = Math.sqrt(span) / Math.sin(CENTRAL_ANGLE / 2);
    return [
      { at: 0.5 - offset / 2, shell },
      { at: 0.5 + offset / 2, shell },
    ];
  }
).sort((a, b) => a.at - b.at);

export function formatKm(km: number): string {
  return `${Math.round(km).toLocaleString('en-US')} km`;
}

export function formatMs(ms: number): string {
  return ms.toFixed(1);
}
