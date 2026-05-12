/**
 * WikiEdit handles content modification, page creation, and history management.
 */
export class WikiEdit {
  /**
   * Initializes the WikiEdit module.
   * @param { WikiSession } session - The active wiki session.
   * @example
   * const edit = new WikiEdit( session );
   */
  constructor( session ) { this.session = session; }

  /**
   * Changes the content model of a page.
   * @param { Object } params - Parameters for the changecontentmodel action.
   * @returns { Promise<Object|null> } Result of the action.
   * @example
   * await session.edit.changecontentmodel( { title: 'MyPage.json', model: 'json' } );
   */
  async changecontentmodel( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'changecontentmodel', ...params } );
      if ( res?.changecontentmodel ) { this.session.logger.info( 'WikiSession.edit.changecontentmodel( ... ) changed: ' + res.changecontentmodel.title ); }
      return res?.changecontentmodel || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.edit.changecontentmodel( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Merges the history of one page into another.
   * @param { Object } params - Parameters for the mergehistory action.
   * @returns { Promise<Object|null> } Result of the action.
   * @example
   * await session.edit.mergehistory( { from: 'Old', to: 'New', reason: 'Consolidating' } );
   */
  async mergehistory( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'mergehistory', ...params } );
      if ( res?.mergehistory ) { this.session.logger.info( 'WikiSession.edit.mergehistory( ... ) success: ' + res.mergehistory.from + ' -> ' + res.mergehistory.to ); }
      return res?.mergehistory || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.edit.mergehistory( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Validates one or more URLs against the spam block list.
   * @param { Object } params - Parameters for the spamblacklist action.
   * @returns { Promise<Object|null> } Result of the validation.
   * @example
   * await session.edit.spamblacklist( { url: 'https://spam.com' } );
   */
  async spamblacklist( params ) {
    try {
      const res = await this.session._post( { action: 'spamblacklist', ...params } );
      return res?.spamblacklist || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.edit.spamblacklist( ... ) check failure: ' + e.message ); }
    return null;
  }

  /**
   * Validates a title, filename, or username against the title blacklist.
   * @param { Object } params - Parameters for the titleblacklist action.
   * @returns { Promise<Object|null> } Result of the validation.
   * @example
   * await session.edit.titleblacklist( { title: 'User:BadName' } );
   */
  async titleblacklist( params ) {
    try {
      const res = await this.session._post( { action: 'titleblacklist', ...params } );
      return res?.titleblacklist || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.edit.titleblacklist( ... ) check failure: ' + e.message ); }
    return null;
  }

  /**
   * Uploads a file to the wiki.
   * @param { Object } params - Parameters for the upload action.
   * @returns { Promise<Object|null> } Result of the upload action.
   * @example
   * await session.edit.upload( { filename: 'File.png', url: 'https://site.com' } );
   */
  async upload( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'upload', ...params } );
      if ( res?.upload?.result === 'Success' ) { this.session.logger.info( 'WikiSession.edit.upload( ... ) successful: ' + res.upload.filename ); }
      return res?.upload || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.edit.upload( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Creates or edits a page on the wiki.
   * @param { Object } params - Parameters for the edit action.
   * @returns { Promise<Object|null> } Result of the edit action.
   * @example
   * await session.edit.write( { title: 'Main Page', text: 'New content', summary: 'Update' } );
   */
  async write( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'edit', ...params } );
      if ( res?.edit?.result === 'Success' ) { this.session.logger.info( 'WikiSession.edit.write( ... ) success: ' + res.edit.title ); }
      return res?.edit || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.edit.write( ... ) failure: ' + e.message ); }
    return null;
  }
}
