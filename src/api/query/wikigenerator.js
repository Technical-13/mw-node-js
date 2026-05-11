/**
 * Executes a generator query to pipe results into properties.
 * @param {Object} session - The active WikiSession.
 * @param {string} type - The generator type (e.g., 'categorymembers').
 * @param {Object} params - Additional parameters for the query.
 * @returns {Promise} The resulting page data or null.
 */
export async function WikiGenerator( session, type, params ) {
  try {
    const res = await session._post( {
      action: 'query',
      generator: type,
      prop: 'revisions',
      rvprop: 'content',
      rvslots: 'main',
      gcmlimit: 10,
      ...params
    } );
    return res.query.pages;
  }
  catch ( e ) {
    session.logger.error( '[Wiki] Generator failure: ' + e.message );
    return null;
  }
}
