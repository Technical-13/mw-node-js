/**
 * WikiFeeds handles retrieving activity feeds in RSS or Atom formats.
 */
export class WikiFeeds {
  /**
   * Initializes the WikiFeeds module.
   * @param { WikiSession } session - The active wiki session.
   * @example
   * const feeds = new WikiFeeds( session );
   */
  constructor( session ) { this.session = session; }

  /**
   * Returns a user's contributions feed.
   * @param { Object } params - Parameters for the feedcontributions action.
   * @returns { Promise<string|null> } The feed data.
   * @example
   * const rss = await session.feeds.contributions( { user: 'Admin', feedformat: 'rss' } );
   */
  async contributions( params ) {
    try { return await this.session._get( { action: 'feedcontributions', ...params } ); }
    catch ( e ) { this.session.logger.error( 'WikiSession.feeds.contributions( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Returns a recent changes feed.
   * @param { Object } params - Parameters for the feedrecentchanges action.
   * @returns { Promise<string|null> } The feed data.
   * @example
   * const atom = await session.feeds.recentchanges( { feedformat: 'atom' } );
   */
  async recentchanges( params ) {
    try { return await this.session._get( { action: 'feedrecentchanges', ...params } ); }
    catch ( e ) { this.session.logger.error( 'WikiSession.feeds.recentchanges( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Returns a watchlist feed.
   * @param { Object } params - Parameters for the feedwatchlist action.
   * @returns { Promise<string|null> } The feed data.
   * @example
   * const rss = await session.feeds.watchlist( { feedformat: 'rss' } );
   */
  async watchlist( params ) {
    try { return await this.session._get( { action: 'feedwatchlist', ...params } ); }
    catch ( e ) { this.session.logger.error( 'WikiSession.feeds.watchlist( ... ) failure: ' + e.message ); }
    return null;
  }
}
