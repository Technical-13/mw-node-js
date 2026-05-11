/**
 * WikiModeration handles user-specific restrictions and enforcement actions.
 */
class WikiModeration {
  constructor( session ) { this.session = session; }

  /**
   * Blocks a user from editing the wiki.
   * @param {Object} params - Parameters for the block action.
   * @returns {Promise} Result of the block action.
   */
  async block( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'block', ...params } );
      if ( res.block ) this.session.logger.info( '[Wiki] User blocked: ' + res.block.user );
      return res.block;
    } catch ( e ) {
      this.session.logger.error( '[Wiki] Block failure: ' + e.message );
      return null;
    }
  }

  /**
   * Unblocks a user.
   * @param {Object} params - Parameters for the unblock action.
   * @returns {Promise} Result of the unblock action.
   */
  async unblock( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'unblock', ...params } );
      if ( res.unblock ) this.session.logger.info( '[Wiki] User unblocked: ' + res.unblock.user );
      return res.unblock;
    } catch ( e ) {
      this.session.logger.error( '[Wiki] Unblock failure: ' + e.message );
      return null;
    }
  }

  /**
   * Changes a user's group membership.
   * @param {Object} params - Parameters for the userrights action.
   * @returns {Promise} Result of the userrights action.
   */
  async userrights( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'userrights' );
      const res = await this.session._post( { action: 'userrights', ...params } );
      if ( res.userrights ) this.session.logger.info( '[Wiki] Rights updated for: ' + res.userrights.user );
      return res.userrights;
    } catch ( e ) {
      this.session.logger.error( '[Wiki] User rights failure: ' + e.message );
      return null;
    }
  }
}

module.exports = WikiModeration;
