/**
 * Executes a list query to retrieve sequences of data.
 * @param {Object} session - The active WikiSession.
 * @param {string} type - The list type (e.g., 'categorymembers').
 * @param {Object} params - Additional parameters for the query.
 * @returns {Promise} The resulting list data or null.
 */
export async function WikiList( session, type, params ) {
  try {
    const res = await session._post( {
      action: 'query',
      list: type,
      ...params
    } );
    return res.query;
  }
  catch ( e ) {
    session.logger.error( '[Wiki] List failure: ' + e.message );
    return null;
  }
}
