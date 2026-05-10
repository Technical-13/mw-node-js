/**
 * Generator Class
 * Handles 'generator' actions to pipe lists into properties.
 */
export class Generator {
  constructor( session ) { this.session = session; }

  /**
   * Gets content for all pages in a specific category.
   * 
   * @param { string } category - Category name.
   * @param { number } gcmlimit - Max pages to fetch.
   * @returns { Promise<Array> }
   */
  async getCategoryContent( category, gcmlimit = 10 ) {
    const res = await this.session._post( {
      action: 'query',
      generator: 'categorymembers',
      gcmtitle: category,
      gcmlimit,
      prop: 'revisions',
      rvprop: 'content',
      rvslots: 'main'
    } );
    return res.query.pages;
  }
}
