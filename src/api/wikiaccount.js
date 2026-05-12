/**
 * WikiAccount handles user-specific account data, messaging, and permissions.
 */
export class WikiAccount {
  /**
   * Initializes the WikiAccount module.
   * @param { WikiSession } session - The active wiki session.
   * @example
   * const account = new WikiAccount( session );
   */
  constructor( session ) { this.session = session; }

  /**
   * Emails a user through the wiki's internal mail system.
   * @param { Object } params - Parameters for the emailuser action.
   * @returns { Promise<Object|null> } Result of the action.
   * @example
   * await session.account.email( { target: 'User1', subject: 'Hi', text: 'Text' } );
   */
  async email( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'emailuser', ...params } );
      if ( res?.emailuser ) { this.session.logger.info( 'WikiSession.account.email( ... ) sent to: ' + params.target ); }
      return res?.emailuser || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.account.email( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Retrieves data about one or more user accounts.
   * @param { Object } params - Parameters for the list users query.
   * @returns { Promise<Object[]|null> } Result of the query.
   * @example
   * await session.account.getUsers( { ususers: 'Technical_13' } );
   */
  async getUsers( params ) {
    try {
      const res = await this.session._get( { action: 'query', list: 'users', ...params } );
      return res?.query?.users || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.account.getUsers( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Verifies a user and suppresses the verification revision for privacy.
   * @param { string } user - The username to verify.
   * @param { string } pageid - The ID of the verification page.
   * @param { string } revid - The ID of the revision to suppress.
   * @param { string } reason - The reason for suppression.
   * @returns { Promise<Object|null> } Result of the verification and suppression.
   * @example
   * await session.account.verify( 'User', '1', '2', 'Verified' );
   */
  async verify( user, pageid, revid, reason ) {
    try {
      const res = await this.session.moderation.userrights( { user: user, add: 'verified', reason: reason } );
      if ( res ) { await this.session.maintenance.suppress( pageid, revid, reason ); }
      return res;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.account.verify( \'' + user + '\', ... ) failure: ' + e.message ); }
    return null;
  }
}
