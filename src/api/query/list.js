/**
 * WikiList handles "list" queries to retrieve sequences of data from the wiki.
 */
export class WikiList {
  constructor( session ) { this.session = session; }

  /**
   * Executes a list query using generic parameters.
   * 
   * @param { Object } params - Parameters for list query.
   * @returns { Promise<Object|null> }
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
      this.session.logger.error( '[Wiki] List failure: ' + e.message );
      return null;
    }
  }
}
