/**
 * List Class
 * Handles 'list' actions for retrieving groups of pages or data.
 */
export class List {
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
      console.error( '[Wiki] List failure: ' + e.message );
      return null;
    }
  }
}
