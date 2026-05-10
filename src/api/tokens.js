/**
 * WikiTokens Class
 * A centralized utility for fetching various MediaWiki API tokens.
 */
export class WikiTokens {
  constructor( session ) { this.session = session; }

  /**
   * Retrieves a specific type of token from the API.
   * 
   * @param { string } type - The token type (e.g., 'csrf', 'login', 'patrol', 'rollback', 'watch', 'createaccount').
   * @returns { Promise<string|null> } - The hex token string or null on failure.
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
}
