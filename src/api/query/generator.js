/**
 * WikiGenerator handles "generator" actions to pipe lists of pages into properties.
 */
export class WikiGenerator {
  constructor( session ) { this.session = session; }

  /**
   * Executes a generator query using generic parameters.
   * @param {Object} params - Parameters for the generator query.
   * @returns {Promise} The resulting page data or null.
   */
  async get( params ) {
    try {
      const res = await this.session._post( {
        action: 'query',
        prop: 'revisions',
        rvprop: 'content',
        rvslots: 'main',
        gcmlimit: 10,
        ...params
      } );
      return res.query.pages;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Generator failure: ' + e.message );
      return null;
    }
  }
}
