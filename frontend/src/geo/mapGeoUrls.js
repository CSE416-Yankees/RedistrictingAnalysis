/**
 * Map geometry URLs for static GeoJSON and the Spring API (`/api/{state}/map?level=...`).
 *
 * Default is static-first because the current demo backend is not dependable.
 * Set `VITE_MAP_GEO_SOURCE=api` when the server-backed map endpoint is ready.
 * In production, set `VITE_API_BASE_URL` at build time to your deployed API origin.
 */
export function mapGeoEndpoints(stateAbbr, publicBase = import.meta.env.BASE_URL || '/') {
  const st = encodeURIComponent(String(stateAbbr).trim().toUpperCase());
  const apiRoot = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
  const apiPrefix = apiRoot ? `${apiRoot}/api/${st}/map` : `/api/${st}/map`;
  const source = String(import.meta.env.VITE_MAP_GEO_SOURCE || 'static').toLowerCase();
  const apiFirst = source === 'api' || source === 'server';

  const trailing = publicBase.endsWith('/') ? publicBase : `${publicBase}/`;
  const api = {
    district: `${apiPrefix}?level=DISTRICT`,
    precinct: `${apiPrefix}?level=PRECINCT`,
  };
  const staticFiles = {
    district: `${trailing}data/${st}.json`,
    precinct: `${trailing}data/${st}-precincts.json`,
  };

  return {
    districtPrimary: apiFirst ? api.district : staticFiles.district,
    precinctPrimary: apiFirst ? api.precinct : staticFiles.precinct,
    districtFallback: apiFirst ? staticFiles.district : null,
    precinctFallback: apiFirst ? staticFiles.precinct : null,
  };
}
