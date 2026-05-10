/**
 * WikiWatchlist Class
 * Manages the bot\'s watchlist (adding or removing pages).
 */
export class WikiWatchlist {
  constructor( session ) { this.session = session; }

  async watch( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'watch' );
      const res = await this.session._post( { action: 'watch', ...params } );
      if ( res.watch ) this.session.logger.info( '[Wiki] Watchlist updated for: ' + res.watch.title );
      return res.watch;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Watch failure: ' + e.message );
      return null;
    }
  }

  async unwatch( params ) { return await this.watch( { ...params, unwatch: true } ); }
}
