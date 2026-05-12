/**
 * WikiModeration handles user-specific restrictions and enforcement actions.
 */
export class WikiModeration {
  /**
   * Initializes the WikiModeration module.
   * @param { WikiSession } session - The active wiki session.
   * @example
   * const moderation = new WikiModeration( session );
   */
  constructor( session ) { this.session = session; }

  /**
   * Blocks a user from editing the wiki.
   * @param { Object } params - Parameters for the block action.
   * @returns { Promise<Object|null> } Result of the block action.
   * @example
   * await session.moderation.block( { user: 'Spammer', reason: 'Vandalism' } );
   */
  async block( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'block', ...params } );
      if ( res?.block ) { this.session.logger.info( 'WikiSession.moderation.block( ... ) success: ' + res.block.user ); }
      return res?.block || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.moderation.block( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Unblocks a user.
   * @param { Object } params - Parameters for the unblock action.
   * @returns { Promise<Object|null> } Result of the unblock action.
   * @example
   * await session.moderation.unblock( { user: 'FixedUser', reason: 'Mistake' } );
   */
  async unblock( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'unblock', ...params } );
      if ( res?.unblock ) { this.session.logger.info( 'WikiSession.moderation.unblock( ... ) success: ' + res.unblock.user ); }
      return res?.unblock || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.moderation.unblock( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Changes a user's group membership.
   * @param { Object } params - Parameters for the userrights action.
   * @returns { Promise<Object|null> } Result of the userrights action.
   * @example
   * await session.moderation.userrights( { user: 'User', add: 'bot', reason: 'Bot account' } );
   */
  async userrights( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'userrights' ); }
      const res = await this.session._post( { action: 'userrights', ...params } );
      if ( res?.userrights ) { this.session.logger.info( 'WikiSession.moderation.userrights( ... ) updated for: ' + res.userrights.user ); }
      return res?.userrights || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.moderation.userrights( ... ) failure: ' + e.message ); }
    return null;
  }
}
