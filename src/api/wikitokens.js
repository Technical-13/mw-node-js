/**
 * WikiTokens handles the retrieval and validation of security tokens for write actions.
 */
export class WikiTokens {
  /**
   * Initializes the WikiTokens module.
   * @param { WikiSession } session - The active wiki session.
   * @example
   * const tokens = new WikiTokens( session );
   */
  constructor( session ) {
    this.session = session;
    this._cache = {};
  }

  /**
   * Retrieves specific tokens from the MediaWiki API.
   * @param { string } type - The type of token to fetch (e.g., 'csrf', 'login').
   * @returns { Promise<string|null> } The requested token string or null.
   * @example
   * const token = await session.tokens.get( 'csrf' );
   */
  async get( type = 'csrf' ) {
    try {
      const normalizedType = type.toLowerCase();
      const validTypes = [ 'createaccount', 'csrf', 'login', 'patrol', 'rollback', 'userrights', 'watch' ];
      if ( !validTypes.includes( normalizedType ) ) {
        this.session.logger.error( 'WikiSession.tokens.get( ' + type + ' ) is an invalid token type request.' );
        return null;
      }
      if ( this._cache[ normalizedType ] ) { return this._cache[ normalizedType ]; }
      const res = await this.session._post( { action: 'query', meta: 'tokens', type: normalizedType } );
      const tokenKey = normalizedType + 'token';
      if ( !res || !res.query || !res.query.tokens || !res.query.tokens[ tokenKey ] ) {
        this.session.logger.error( 'WikiSession.tokens.get( ' + type + ' ) did not return a token. Check user permissions.' );
        return null;
      }
      this._cache[ normalizedType ] = res.query.tokens[ tokenKey ];
      return this._cache[ normalizedType ];
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.tokens.get( ' + type + ' ) failed to fetch token: ' + e.message ); }
    return null;
  }

  /**
   * Validates a token against the MediaWiki API.
   * @param { string } type - The type of token to validate.
   * @param { string } token - The token string to check.
   * @param { number } maxtokenage - Optional maximum age of the token in seconds.
   * @returns { Promise<boolean> } True if the token is valid.
   * @example
   * const isValid = await session.tokens.validate( 'csrf', '12345...' );
   */
  async validate( type, token, maxtokenage ) {
    try {
      const normalizedType = type.toLowerCase();
      const params = { action: 'checktoken', type: normalizedType, token: token };
      if ( maxtokenage ) { params.maxtokenage = maxtokenage; }
      const res = await this.session._post( params );
      const isValid = res && res.checktoken && res.checktoken.result === 'valid';
      if ( !isValid ) { delete this._cache[ normalizedType ]; }
      return isValid;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.tokens.validate( \'' + type + '\', \'' + token + '\', ... ) failed: ' + e.message ); }
    return false;
  }
}
