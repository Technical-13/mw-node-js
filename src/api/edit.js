/**
 * WikiEdit handles content modification, page creation, and history management.
 */
export class WikiEdit {
  constructor( session ) { this.session = session; }

  /**
   * Changes the content model of a page.
   * @param {Object} params - Parameters for the changecontentmodel action.
   * @returns {Promise} Result of the action.
   */
  async changecontentmodel( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'changecontentmodel', ...params } );
      if ( res.changecontentmodel ) this.session.logger.info( '[Wiki] Content model changed for: ' + res.changecontentmodel.title );
      return res.changecontentmodel;
    } catch ( e ) {
      this.session.logger.error( '[Wiki] Content model change failure: ' + e.message );
      return null;
    }
  }

  /**
   * Creates or edits a page on the wiki.
   * @param {Object} params - Parameters for the edit action.
   * @returns {Promise} Result of the edit action.
   */
  async edit( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'edit', ...params } );
      if ( res.edit && res.edit.result === 'Success' ) {
        this.session.logger.info( '[Wiki] Page edited: ' + res.edit.title );
      }
      return res.edit;
    } catch ( e ) {
      this.session.logger.error( '[Wiki] Edit failure: ' + e.message );
      return null;
    }
  }

  /**
   * Merges the history of one page into another.
   * @param {Object} params - Parameters for the mergehistory action.
   * @returns {Promise} Result of the action.
   */
  async mergehistory( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'mergehistory', ...params } );
      if ( res.mergehistory ) {
        this.session.logger.info( '[Wiki] History merged: ' + res.mergehistory.from + ' -> ' + res.mergehistory.to );
      }
      return res.mergehistory;
    } catch ( e ) {
      this.session.logger.error( '[Wiki] History merge failure: ' + e.message );
      return null;
    }
  }

  /**
   * Uploads a file to the wiki.
   * @param {Object} params - Parameters for the upload action.
   * @returns {Promise} Result of the upload action.
   */
  async upload( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'upload', ...params } );
      if ( res.upload && res.upload.result === 'Success' ) {
        this.session.logger.info( '[Wiki] File uploaded: ' + res.upload.filename );
      }
      return res.upload;
    } catch ( e ) {
      this.session.logger.error( '[Wiki] Upload failure: ' + e.message );
      return null;
    }
  }
}
