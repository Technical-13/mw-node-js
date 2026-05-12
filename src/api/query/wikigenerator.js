/**
 * Executes a generator query to pipe results into properties.
 * @param { Object } session - The active WikiSession.
 * @param { string } type - The generator type (e.g., 'categorymembers').
 * @param { Object } params - Additional parameters for the query.
 * @returns { Promise<Object[]|null> } The resulting page data or null.
 * @example
 * const pages = await WikiGenerator( session, 'allpages', { gaplimit: 5 } );
 */
export async function WikiGenerator( session, type, params ) {
  try {
    const res = await session._post( {
      action: 'query',
      generator: type,
      prop: 'revisions',
      rvprop: 'content',
      rvslots: 'main',
      ...params
    } );
    return res && res.query ? res.query.pages : null;
  }
  catch ( e ) { session.logger.error( 'WikiSession.query.generator( ' + type + ', ... ) failure: ' + e.message ); }
  return null;
}
