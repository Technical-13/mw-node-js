/**
 * Executes a meta query for site-wide or user-specific information.
 * @param { Object } session - The active WikiSession.
 * @param { string } type - The meta type (e.g., 'siteinfo').
 * @param { Object } params - Additional parameters for the query.
 * @returns { Promise<Object|null> } The resulting meta data or null.
 * @example
 * const info = await WikiMeta( session, 'siteinfo', { siprop: 'general' } );
 */
export async function WikiMeta( session, type, params ) {
  try {
    const res = await session._post( { action: 'query', meta: type, ...params } );
    return res?.query || null;
  }
  catch ( e ) { session.logger.error( 'WikiSession.query.meta( ' + type + ', ... ) failure: ' + e.message ); }
  return null;
}
