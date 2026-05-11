/**
 * WikiProp handles "prop" actions to retrieve data attached to specific pages.
 */
export class WikiProp {
  constructor( session ) { this.session = session; }

  /**
   * Retrieves page properties using a generic params object.
   * 
   * @param { Object } params - Parameters for prop query.
   * @returns { Promise<Object|null> }
   */
  async get( params ) {
    try {
      const res = await this.session._post( {
        action: 'query',
        prop: 'revisions',
        rvprop: 'content',
        rvslots: 'main',
        ...params
      } );
      const page = res.query.pages;
      if ( !page || page.missing ) return null;
      return page;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Prop failure: ' + e.message );
      return null;
    }
  }
}
