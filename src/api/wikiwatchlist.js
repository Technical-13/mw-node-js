/**
 * WikiWatchlist handles actions related to the user's personal watchlist.
 */
export class WikiWatchlist {
  constructor( session ) { this.session = session; }

  /**
   * Removes pages from the current user's watchlist.
   * @param {Object} params - Parameters for the watch action.
   * @returns {Promise} Result of the watch action.
   */
  async unwatch( params ) { return await this.watch( { ...params, unwatch: true } ); }

  /**
   * Adds or removes pages from the current user's watchlist.
   * @param {Object} params - Parameters for the watch action.
   * @returns {Promise} Result of the watch action.
   */
  async watch( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'watch' );
      const res = await this.session._post( { action: 'watch', ...params } );
      if ( res.watch ) {
        const status = res.watch.unwatch ? 'removed from' : 'added to';
        this.session.logger.info( '[Wiki] Page ' + status + ' watchlist: ' + res.watch.title );
      }
      return res.watch;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Watchlist update failure: ' + e.message );
      return null;
    }
  }
}
