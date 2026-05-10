/**
 * WikiEdit Class
 * Handles action=edit operations for modifying wiki content.
 */
export class WikiEdit {
  constructor( session ) { this.session = session; }

  /**
   * Performs an edit on a specific page.
   * 
   * @param { Object } params - Parameters for action=edit.
   * @returns { Promise<Object|null> }
   */
  async post( params ) {
    try {
      if ( !params.token ) {
        const tokenRes = await this.session._post( { action: 'query', meta: 'tokens', type: 'csrf' } );
        params.token = tokenRes.query.tokens.csrftoken;
      }
      const res = await this.session._post( { action: 'edit', ...params } );
      if ( res.edit && res.edit.result === 'Success' ) {
        console.log( '[Wiki] Edit successful on: ' + res.edit.title );
      }
      return res.edit;
    }
    catch ( e ) {
      console.error( '[Wiki] Edit failure: ' + e.message );
      return null;
    }
  }
}
