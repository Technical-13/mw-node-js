/**
 * WikiAccount handles user-specific account data, messaging, and permissions.
 */
export class WikiAccount {
  constructor( session ) { this.session = session; }

  /**
   * Emails a user through the wiki's internal mail system.
   * @param {Object} params - Parameters for the emailuser action.
   * @returns {Promise} Result of the action.
   */
  async email( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'emailuser', ...params } );
      if ( res.emailuser ) this.session.logger.info( '[Wiki] Email sent to: ' + params.target );
      return res.emailuser;
    } catch ( e ) {
      this.session.logger.error( '[Wiki] Email failure: ' + e.message );
      return null;
    }
  }

  /**
   * Retrieves data about one or more user accounts.
   * @param {Object} params - Parameters for the list users query.
   * @returns {Promise} Result of the query.
   */
  async get( params ) {
    try {
      const res = await this.session._get( { action: 'query', list: 'users', ...params } );
      return res.query.users;
    } catch ( e ) {
      this.session.logger.error( '[Wiki] User query failure: ' + e.message );
      return null;
    }
  }

  /**
   * Verifies a user and suppresses the verification revision for privacy.
   * @param {string} user - The username to verify.
   * @param {string} pageid - The ID of the verification page.
   * @param {string} revid - The ID of the revision to suppress.
   * @param {string} reason - The reason for suppression.
   * @returns {Promise} Result of the verification and suppression.
   */
  async verify( user, pageid, revid, reason ) {
    try {
      const res = await this.session.moderation.userrights( { user: user, add: 'verified', reason: reason } );
      if ( res ) await this.session.maintenance.suppress( pageid, revid, reason );
      return res;
    } catch ( e ) {
      this.session.logger.error( '[Wiki] Verification failure: ' + e.message );
      return null;
    }
  }
}
