/**
 * Meta Class
 * Handles 'meta' actions for site-wide or user-specific data.
 */
export class Meta {
  constructor( session ) { this.session = session; }

  /**
   * Fetches a CSRF token required for write actions.
   * 
   * @returns { Promise<string|null> }
   */
  async getCsrfToken( ) {
    try {
      const res = await this.session._post( {
        action: 'query',
        meta: 'tokens',
        type: 'csrf'
      } );
      return res.query.tokens.csrftoken;
    }
    catch ( e ) {
      console.error( `[Wiki] Meta failure (token): ${ e.message }` );
      return null;
    }
  }

  /**
   * Retrieves info about the logged-in bot account.
   * 
   * @returns { Promise<Object> }
   */
  async getUserInfo( ) {
    const res = await this.session._post( {
      action: 'query',
      meta: 'userinfo',
      uiprop: 'groups|rights|editcount'
    } );
    return res.query.userinfo;
  }
}
