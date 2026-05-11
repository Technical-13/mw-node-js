/**
 * WikiMeta handles "meta" queries for site-wide or user-specific information.
 */
export class WikiMeta {
  constructor( session ) { this.session = session; }

  /**
   * Executes a meta query using generic parameters.
   * @param {Object} params - Parameters for the meta query.
   * @returns {Promise} The resulting meta data or null.
   */
  async get( params ) {
    try {
      const res = await this.session._post( {
        action: 'query',
        ...params
      } );
      return res.query;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Meta failure: ' + e.message );
      return null;
    }
  }
}
