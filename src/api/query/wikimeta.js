/**
 * Executes a meta query for site-wide or user-specific information.
 * @param {Object} session - The active WikiSession.
 * @param {string} type - The meta type (e.g., 'siteinfo').
 * @param {Object} params - Additional parameters for the query.
 * @returns {Promise} The resulting meta data or null.
 */
export async function WikiMeta( session, type, params ) {
  try {
    const res = await session._post( {
      action: 'query',
      meta: type,
      ...params
    } );
    return res.query;
  }
  catch ( e ) {
    session.logger.error( '[Wiki] Meta failure: ' + e.message );
    return null;
  }
}
