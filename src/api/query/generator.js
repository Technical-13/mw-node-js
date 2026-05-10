/**
 * Generator Class
 * Handles 'generator' actions to pipe lists into properties.
 */
export class Generator {
  constructor( session ) { this.session = session; }

  /**
   * Executes a generator query using generic parameters.
   * 
   * @param { Object } params - Parameters for generator query.
   * @returns { Promise<Array|null> }
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
      console.error( '[Wiki] Generator failure: ' + e.message );
      return null;
    }
  }
}
