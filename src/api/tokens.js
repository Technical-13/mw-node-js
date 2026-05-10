/**
 * WikiTokens Class
 * A centralized utility for fetching and validating MediaWiki API tokens.
 */
export class WikiTokens {
  constructor( session ) { this.session = session; }

  async get( type = 'csrf' ) {
    try {
      const normalizedType = type.toLowerCase( );
      const validTypes = [ 'createaccount', 'csrf', 'login', 'patrol', 'rollback', 'userrights', 'watch' ];
      if ( !validTypes.includes( normalizedType ) ) {
        this.session.logger.error( '[Wiki] Invalid token type requested: ' + type );
        return null;
      }
      const res = await this.session._post( { action: 'query', meta: 'tokens', type: normalizedType } );
      const tokenKey = normalizedType + 'token';
      if ( !res.query.tokens[ tokenKey ] ) {
        this.session.logger.error( '[Wiki] API did not return a ' + type + ' token. Check user permissions.' );
        return null;
      }
      return res.query.tokens[ tokenKey ];
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Failed to fetch ' + type + ' token: ' + e.message );
      return null;
    }
  }

  async validate( type, token, maxtokenage ) {
    try {
      const normalizedType = type.toLowerCase( );
      const params = { action: 'checktoken', type: normalizedType, token: token };
      if ( maxtokenage ) params.maxtokenage = maxtokenage;
      const res = await this.session._post( params );
      return res.checktoken.result === 'valid';
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Token validation failed: ' + e.message );
      return false;
    }
  }
}
