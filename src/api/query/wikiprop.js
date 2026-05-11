/**
 * Executes a prop query to retrieve data attached to specific pages.
 * @param {Object} session - The active WikiSession.
 * @param {string} type - The prop type.
 * @param {Object} params - Additional parameters.
 * @returns {Promise} The resulting page data or null.
 */
export async function WikiProp( session, type, params ) {
  try {
    const res = await session._post( {
      action: 'query',
      prop: type,
      rvprop: 'content',
      rvslots: 'main',
      ...params
    } );
    return res.query.pages;
  }
  catch ( e ) {
    this.session.logger.error( 'WikiSession.query.prop( ' + type + ', ... ) failure: ' + e.message );
    return null;
  }
}
