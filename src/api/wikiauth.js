/**
 * WikiAuth handles user authentication, session management, and login flows.
 */
export class WikiAuth {
  /**
   * Initializes the WikiAuth module.
   * @param { WikiSession } session - The active wiki session.
   * @example
   * const auth = new WikiAuth( session );
   */
  constructor( session ) { this.session = session; }

  /**
   * Changes authentication data for the current user (e.g., password change).
   * @param { Object } params - Parameters for the changeauthenticationdata action.
   * @returns { Promise<Object|null> } Result of the action.
   * @example
   * await session.auth.changeauthenticationdata( { changeauthrequest: '...', token: '...' } );
   */
  async changeauthenticationdata( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'changeauthenticationdata', ...params } );
      if ( res.changeauthenticationdata ) { this.session.logger.info( 'WikiSession.auth.changeauthenticationdata( ... ) changed' ); }
      return res.changeauthenticationdata;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.auth.changeauthenticationdata( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Performs a modern client-side login. Supports multi-stage auth (2FA, UI, REDIRECT).
   * @param { Object } params - Parameters for clientlogin (username, password, logincontinue, etc.).
   * @returns { Promise<Object|null> } The full clientlogin response object.
   * @example
   * // Initial attempt
   * let res = await session.auth.clientlogin( { username: 'Bot', password: '...', loginreturnurl: 'https://bot.local' } );
   *
   * // If 2FA is needed (status: 'UI')
   * if ( res.status === 'UI' ) {
   *   res = await session.auth.clientlogin( { logincontinue: true, OATHToken: '123456' } );
   * }
   */
  async clientlogin( params ) {
    try {
      if ( !params.logintoken ) { params.logintoken = await this.session.tokens.get( 'login' ); }
      const res = await this.session._post( { action: 'clientlogin', ...params } );
      const data = res ? res.clientlogin : null;
      switch ( data?.status ) {
        case 'PASS': this.session.logger.info( 'WikiSession.auth.clientlogin( ... ) successful for: ' + data.username ); break;
        case 'UI':
        case 'REDIRECT': this.session.logger.info( 'WikiSession.auth.clientlogin( ... ) requires action: ' + data.status ); break;
        case 'FAIL': this.session.logger.warn( 'WikiSession.auth.clientlogin( ... ) failed: ' + ( data.message || 'Unknown error' ) ); break;
        case undefined: break;
        default: this.session.logger.debug( 'WikiSession.auth.clientlogin( ... ) status: ' + data.status );
      }
      return data;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.auth.clientlogin( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Legacy login method for environments where clientlogin is unavailable.
   * @param { Object } params - Parameters for the legacy login action.
   * @returns { Promise<Object|null> } Result of the login attempt.
   * @example
   * await session.auth.login( { lgname: 'Bot', lgpassword: '...' } );
   */
  async login( params ) {
    try {
      if ( !params.lgtoken ) { params.lgtoken = await this.session.tokens.get( 'login' ); }
      const res = await this.session._post( { action: 'login', ...params } );
      if ( res && res.login && res.login.result === 'Success' ) {
        this.session.logger.info( 'WikiSession.auth.login( ... ) successful for: ' + res.login.lgusername );
      }
      return res ? res.login : null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.auth.login( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Log out and end the current session.
   * @returns { Promise<Object|null> } Result of the logout action.
   * @example
   * await session.auth.logout();
   */
  async logout() {
    try {
      const res = await this.session._post( { action: 'logout' } );
      this.session.logger.info( 'WikiSession.auth.logout( ... ) successful' );
      return res;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.auth.logout( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Removes authentication data for the current user.
   * @param { Object } params - Parameters for the removeauthenticationdata action.
   * @returns { Promise<Object|null> } Result of the action.
   * @example
   * await session.auth.removeauthenticationdata( { requestid: '...' } );
   */
  async removeauthenticationdata( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'removeauthenticationdata', ...params } );
      if ( res.removeauthenticationdata ) { this.session.logger.info( 'WikiSession.auth.removeauthenticationdata( ... ) removed' ); }
      return res.removeauthenticationdata;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.auth.removeauthenticationdata( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Sends a password reset email or resets the password via token.
   * @param { Object } params - Parameters for the resetpassword action.
   * @returns { Promise<Object|null> } Result of the action.
   * @example
   * await session.auth.resetpassword( { user: 'SomeUser' } );
   */
  async resetpassword( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'resetpassword', ...params } );
      if ( res.resetpassword ) { this.session.logger.info( 'WikiSession.auth.resetpassword( ... ) action triggered' ); }
      return res.resetpassword;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.auth.resetpassword( ... ) failure: ' + e.message ); }
    return null;
  }
}
