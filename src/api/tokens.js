/**
 * WikiTokens Class
 * A centralized utility for fetching and validating MediaWiki API tokens.
 */
export class WikiTokens {
  constructor( session ) { this.session = session; }

  /**
   * Retrieves a specific type of token from the API.
   */
  async get( type = 'csrf' ) {
    try {
      const normalizedType = type.toLowerCase( );
      const validTypes = [ 'createaccount', 'csrf', 'login', 'patrol', 'rollback', 'userrights', 'watch' ];
      if ( !validTypes.includes( normalizedType ) ) {
        console.error( '[Wiki] Invalid token type requested: ' + type );
        return null;
      }
      const res = await this.session._post( { action: 'query', meta: 'tokens', type: normalizedType } );
      const tokenKey = normalizedType + 'token';
      if ( !res.query.tokens[ tokenKey ] ) {
        console.error( '[Wiki] API did not return a ' + type + ' token. Check user permissions.' );
        return null;
      }
      return res.query.tokens[ tokenKey ];
    }
    catch ( e ) {
      console.error( '[Wiki] Failed to fetch ' + type + ' token: ' + e.message );
      return null;
    }
  }

  /**
   * Validates the validity of a specific token using action=checktoken.
   * 
   * @param { string } type - The token type to test.
   * @param { string } token - The token string to validate.
   * @param { number } maxtokenage - Maximum allowed age of the token in seconds.
   * @returns { Promise<boolean> } - True if valid, false otherwise.
   */
  async validate( type, token, maxtokenage ) {
    try {
      const normalizedType = type.toLowerCase( );
      const params = { action: 'checktoken', type: normalizedType, token: token };
      if ( maxtokenage ) params.maxtokenage = maxtokenage;
      const res = await this.session._post( params );
      return res.checktoken.result === 'valid';
    }
    catch ( e ) {
      console.error( '[Wiki] Token validation failed: ' + e.message );
      return false;
    }
  }
}
