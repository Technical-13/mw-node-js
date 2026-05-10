/**
 * Meta Class
 * Handles 'meta' actions for site-wide or user-specific data.
 */
export class Meta {
  constructor( session ) { this.session = session; }

  async getCsrfToken( ) { return await this.session.tokens.get( 'csrf' ); }

  async getUserInfo( params = { uiprop: 'groups|rights|editcount' } ) {
    const res = await this.session._post( { action: 'query', meta: 'userinfo', ...params } );
    return res.query.userinfo;
  }
}
