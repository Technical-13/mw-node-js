/**
 * WikiTokens handles the retrieval and validation of security tokens for write actions.
 */
export class WikiTokens {
  constructor( session ) { this.session = session; }

  /**
   * Retrieves specific tokens from the MediaWiki API.
   * @param {string} type - The type of token to fetch (e.g., 'csrf', 'login').
   * @returns {Promise} The requested token string or null.
   */
  async get( type = 'csrf' ) {
    try {
      const normalizedType = type.toLowerCase();
      const validTypes = [ 'createaccount', 'csrf', 'login', 'patrol', 'rollback', 'userrights', 'watch' ];
      if ( !validTypes.includes( normalizedType ) ) {
        this.session.logger.error( 'WikiSession.tokens.get( ' + type + ' ) is an invalid token type request.' );
        return null;
      }
      const res = await this.session._post( { action: 'query', meta: 'tokens', type: normalizedType } );
      const tokenKey = normalizedType + 'token';
      if ( !res.query.tokens[ tokenKey ] ) {
        this.session.logger.error( 'WikiSession.tokens.get( ' + type + ' ) did not return a token. Check user permissions.' );
        return null;
      }
      return res.query.tokens[ tokenKey ];
    }
    catch ( e ) {
      this.session.logger.error( 'WikiSession.tokens.get( ' + type + ' ) failed to fetch token: ' + e.message );
      return null;
    }
  }

  /**
   * Validates a token against the MediaWiki API.
   * @param {string} type - The type of token to validate.
   * @param {string} token - The token string to check.
   * @param {number} maxtokenage - Optional maximum age of the token in seconds.
   * @returns {Promise} True if the token is valid.
   */
  async validate( type, token, maxtokenage ) {
    try {
      const normalizedType = type.toLowerCase();
      const params = { action: 'checktoken', type: normalizedType, token: token };
      if ( maxtokenage ) params.maxtokenage = maxtokenage;
      const res = await this.session._post( params );
      return res.checktoken.result === 'valid';
    }
    catch ( e ) {
      this.session.logger.error( 'WikiSession.tokens.validate( \'' + type + '\', \'' + token + '\', ... ) failed: ' + e.message );
      return false;
    }
  }
}
