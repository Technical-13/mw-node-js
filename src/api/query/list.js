/**
 * List Class
 * Handles 'list' actions for retrieving groups of pages or data.
 */
export class List {
  constructor( session ) { this.session = session; }

  /**
   * Searches the wiki for pages matching a query.
   * 
   * @param { string } srsearch - The search term.
   * @param { number } srlimit - Number of results.
   * @returns { Promise<Array> }
   */
  async search( srsearch, srlimit = 10 ) {
    const res = await this.session._post( {
      action: 'query',
      list: 'search',
      srsearch,
      srlimit
    } );
    return res.query.search;
  }
}
