/**
 * List Class
 * Handles 'list' actions for retrieving groups of pages or data.
 */
export class List {
  constructor( session ) { this.session = session; }

  /**
   * Searches the wiki for pages matching a query.
   * 
   * @param { Object } params - Parameters for list=search.
   * @returns { Promise<Array> }
   */
  async search( params ) {
    const res = await this.session._post( {
      action: 'query',
      list: 'search',
      srlimit: 10,
      ...params
    } );
    return res.query.search;
  }
}
