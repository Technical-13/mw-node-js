/**
 * Prop Class
 * Handles 'prop' actions to get data attached to specific pages.
 */
export class Prop {
  constructor( session ) { this.session = session; }

  /**
   * Retrieves the raw wikitext content of a specific page.
   * 
   * @param { string } title - The title of the page.
   * @returns { Promise<string|null> }
   */
  async getPageText( title ) {
    try {
      const res = await this.session._post( {
        action: 'query',
        prop: 'revisions',
        titles: title,
        rvprop: 'content',
        rvslots: 'main'
      } );
      const page = res.query.pages;
      if ( !page || page.missing ) return null;
      return page.revisions.slots.main.content;
    }
    catch ( e ) {
      console.error( `[Wiki] Prop failure for ${ title }: ${ e.message }` );
      return null;
    }
  }
}
