/**
 * WikiEdit Class
 * Handles action=edit operations for modifying wiki content.
 */
export class WikiEdit {
  constructor( session ) { this.session = session; }

  async post( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'edit', ...params } );
      if ( res.edit && res.edit.result === 'Success' ) this.session.logger.info( '[Wiki] Edit successful on: ' + res.edit.title );
      return res.edit;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Edit failure: ' + e.message );
      return null;
    }
  }
}
