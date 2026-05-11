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
      if ( res.block ) this.session.logger.info( 'WikiSession.moderation.block( ... ) success: ' + res.block.user );
      return res.block;
    }
    catch ( e ) {
      this.session.logger.error( 'WikiSession.moderation.block( ... ) failure: ' + e.message );
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
      if ( res.unblock ) this.session.logger.info( 'WikiSession.moderation.unblock( ... ) success: ' + res.unblock.user );
      return res.unblock;
    }
    catch ( e ) {
      this.session.logger.error( 'WikiSession.moderation.unblock( ... ) failure: ' + e.message );
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
      if ( res.userrights ) this.session.logger.info( 'WikiSession.moderation.userrights( ... ) updated for: ' + res.userrights.user );
      return res.userrights;
    }
    catch ( e ) {
      this.session.logger.error( 'WikiSession.moderation.userrights( ... ) failure: ' + e.message );
      return null;
    }
  }
}

module.exports = WikiModeration;
