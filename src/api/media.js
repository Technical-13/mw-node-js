/**
 * WikiMedia Class
 * Handles file-related operations such as uploading images and documents.
 */
export class WikiMedia {
  constructor( session ) { this.session = session; }

  async upload( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'upload', ...params } );
      if ( res.upload && res.upload.result === 'Success' ) this.session.logger.info( '[Wiki] Upload successful: ' + res.upload.filename );
      return res.upload;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Upload failure: ' + e.message );
      return null;
    }
  }
}
