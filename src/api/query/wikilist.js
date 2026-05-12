/**
 * Executes a list query to retrieve sequences of data.
 * @param { Object } session - The active WikiSession.
 * @param { string } type - The list type (e.g., 'categorymembers').
 * @param { Object } params - Additional parameters for the query.
 * @returns { Promise<Object|null> } The resulting list data or null.
 * @example
 * const members = await WikiList( session, 'categorymembers', { cmtitle: 'Category:Bots' } );
 */
export async function WikiList( session, type, params ) {
  try {
    const res = await session._post( { action: 'query', list: type, ...params } );
    return res?.query || null;
  }
  catch ( e ) { session.logger.error( 'WikiSession.query.list( ' + type + ', ... ) failure: ' + e.message ); }
  return null;
}
