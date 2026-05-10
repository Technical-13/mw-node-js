/**
 * Meta Class
 * Handles 'meta' actions for site-wide or user-specific data.
 */
export class Meta {
  constructor( session ) { this.session = session; }

  /**
   * Retrieves info about the logged-in bot account.
   * 
   * @param { Object } params - Optional parameters for meta=userinfo.
   * @returns { Promise<Object> }
   */
  async getUserInfo( params = { uiprop: 'groups|rights|editcount' } ) {
    const res = await this.session._post( {
      action: 'query',
      meta: 'userinfo',
      ...params
    } );
    return res.query.userinfo;
  }
}
