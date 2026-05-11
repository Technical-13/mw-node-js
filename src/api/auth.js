/**
 * WikiAuth handles user authentication, session management, and login flows.
 */
export class WikiAuth {
  constructor( session ) { this.session = session; }

  /**
   * Changes authentication data for the current user (e.g., password change).
   * @param {Object} params - Parameters for the changeauthenticationdata action.
   * @returns {Promise} Result of the action.
   */
  async changeauthenticationdata( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'changeauthenticationdata', ...params } );
      if ( res.changeauthenticationdata ) this.session.logger.info( '[Wiki] Authentication data changed' );
      return res.changeauthenticationdata;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Change auth data failure: ' + e.message );
      return null;
    }
  }

  /**
   * Performs a modern client-side login to the wiki.
   * @param {Object} params - Parameters for the clientlogin action.
   * @returns {Promise} Result of the login attempt.
   */
  async clientlogin( params ) {
    try {
      if ( !params.logintoken ) params.logintoken = await this.session.tokens.get( 'login' );
      const res = await this.session._post( { action: 'clientlogin', ...params } );
      if ( res.clientlogin && res.clientlogin.status === 'PASS' ) {
        this.session.logger.info( '[Wiki] ClientLogin successful for: ' + res.clientlogin.username );
      }
      return res.clientlogin;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] ClientLogin failure: ' + e.message );
      return null;
    }
  }

  /**
   * Legacy login method for environments where clientlogin is unavailable.
   * @param {Object} params - Parameters for the legacy login action.
   * @returns {Promise} Result of the login attempt.
   */
  async login( params ) {
    try {
      if ( !params.lgtoken ) params.lgtoken = await this.session.tokens.get( 'login' );
      const res = await this.session._post( { action: 'login', ...params } );
      if ( res.login && res.login.result === 'Success' ) {
        this.session.logger.info( '[Wiki] Legacy login successful for: ' + res.login.lgusername );
      }
      return res.login;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Legacy login failure: ' + e.message );
      return null;
    }
  }

  /**
   * Log out and end the current session.
   * @returns {Promise} Result of the logout action.
   */
  async logout() {
    try {
      const res = await this.session._post( { action: 'logout' } );
      this.session.logger.info( '[Wiki] Logged out successfully' );
      return res;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Logout failure: ' + e.message );
      return null;
    }
  }

  /**
   * Removes authentication data for the current user.
   * @param {Object} params - Parameters for the removeauthenticationdata action.
   * @returns {Promise} Result of the action.
   */
  async removeauthenticationdata( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'removeauthenticationdata', ...params } );
      if ( res.removeauthenticationdata ) this.session.logger.info( '[Wiki] Authentication data removed' );
      return res.removeauthenticationdata;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Remove auth data failure: ' + e.message );
      return null;
    }
  }

  /**
   * Sends a password reset email or resets the password via token.
   * @param {Object} params - Parameters for the resetpassword action.
   * @returns {Promise} Result of the action.
   */
  async resetpassword( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'resetpassword', ...params } );
      if ( res.resetpassword ) this.session.logger.info( '[Wiki] Password reset action triggered' );
      return res.resetpassword;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Reset password failure: ' + e.message );
      return null;
    }
  }
}
