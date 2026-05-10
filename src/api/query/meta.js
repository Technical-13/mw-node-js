/**
 * Meta Class
 * Handles 'meta' actions for site-wide or user-specific data.
 */
export class Meta {
  constructor( session ) { this.session = session; }

  /**
   * Executes a meta query using generic parameters.
   * 
   * @param { Object } params - Parameters for meta query.
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
      console.error( '[Wiki] Meta failure: ' + e.message );
      return null;
    }
  }
}
