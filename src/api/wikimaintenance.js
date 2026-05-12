/**
 * WikiMaintenance handles administrative page health and system-level actions.
 */
export class WikiMaintenance {
  /**
   * Initializes the WikiMaintenance module.
   * @param { WikiSession } session - The active wiki session.
   * @example
   * const maintenance = new WikiMaintenance( session );
   */
  constructor( session ) { this.session = session; }

  /**
   * Compares two pages or revisions.
   * @param { Object } params - Parameters for the compare action.
   * @returns { Promise<Object|null> } Result of the comparison.
   * @example
   * await session.maintenance.compare( { fromtitle: 'A', totitle: 'B' } );
   */
  async compare( params ) {
    try {
      const res = await this.session._get( { action: 'compare', ...params } );
      return res?.compare || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.maintenance.compare( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Deletes a page from the wiki.
   * @param { Object } params - Parameters for the delete action.
   * @returns { Promise<Object|null> } Result of the delete action.
   * @example
   * await session.maintenance.delete( { title: 'Sandbox', reason: 'Clearing' } );
   */
  async delete( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'delete', ...params } );
      if ( res?.delete ) { this.session.logger.info( 'WikiSession.maintenance.delete( ... ) success: ' + res.delete.title ); }
      return res?.delete || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.maintenance.delete( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Manages change tags (create/delete/activate/deactivate).
   * @param { Object } params - Parameters for the managetags action.
   * @returns { Promise<Object|null> } Result of the action.
   * @example
   * await session.maintenance.managetags( { operation: 'create', tag: 'bot-edit' } );
   */
  async managetags( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'managetags', ...params } );
      if ( res?.managetags ) { this.session.logger.info( 'WikiSession.maintenance.managetags( ... ) successful' ); }
      return res?.managetags || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.maintenance.managetags( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Moves a page to a new title.
   * @param { Object } params - Parameters for the move action.
   * @returns { Promise<Object|null> } Result of the move action.
   * @example
   * await session.maintenance.move( { from: 'Draft', to: 'Article' } );
   */
  async move( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'move', ...params } );
      if ( res?.move ) { this.session.logger.info( 'WikiSession.maintenance.move( ... ) success: ' + res.move.from + ' -> ' + res.move.to ); }
      return res?.move || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.maintenance.move( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Marks a revision or page as patrolled.
   * @param { Object } params - Parameters for the patrol action.
   * @returns { Promise<Object|null> } Result of the patrol action.
   * @example
   * await session.maintenance.patrol( { rcid: 123 } );
   */
  async patrol( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'patrol' ); }
      const res = await this.session._post( { action: 'patrol', ...params } );
      if ( res?.patrol ) { this.session.logger.info( 'WikiSession.maintenance.patrol( ... ) revision: ' + res.patrol.rcid ); }
      return res?.patrol || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.maintenance.patrol( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Protects or unprotects a page.
   * @param { Object } params - Parameters for the protect action.
   * @returns { Promise<Object|null> } Result of the protect action.
   * @example
   * await session.maintenance.protect( { title: 'Main Page', protections: 'edit=sysop' } );
   */
  async protect( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'protect', ...params } );
      if ( res?.protect ) { this.session.logger.info( 'WikiSession.maintenance.protect( ... ) success: ' + res.protect.title ); }
      return res?.protect || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.maintenance.protect( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Purges the server cache for pages.
   * @param { Object } params - Parameters for the purge action.
   * @returns { Promise<Object|null> } Result of the purge action.
   * @example
   * await session.maintenance.purge( { titles: 'Main Page' } );
   */
  async purge( params ) {
    try {
      const res = await this.session._post( { action: 'purge', ...params } );
      if ( res?.purge ) { this.session.logger.info( 'WikiSession.maintenance.purge( ... ) successful' ); }
      return res?.purge || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.maintenance.purge( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Deletes or undeletes specific revisions of a page.
   * @param { Object } params - Parameters for the revisiondelete action.
   * @returns { Promise<Object|null> } Result of the action.
   * @example
   * await session.maintenance.revisiondelete( { target: 'Page', ids: '123', hide: 'content' } );
   */
  async revisiondelete( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'revisiondelete', ...params } );
      if ( res?.revisiondelete ) { this.session.logger.info( 'WikiSession.maintenance.revisiondelete( ... ) updated' ); }
      return res?.revisiondelete || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.maintenance.revisiondelete( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Reverts the last edits of a user to a page.
   * @param { Object } params - Parameters for the rollback action.
   * @returns { Promise<Object|null> } Result of the rollback action.
   * @example
   * await session.maintenance.rollback( { title: 'Page', user: 'Spammer' } );
   */
  async rollback( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'rollback' ); }
      const res = await this.session._post( { action: 'rollback', ...params } );
      if ( res?.rollback ) { this.session.logger.info( 'WikiSession.maintenance.rollback( ... ) successful on: ' + res.rollback.title ); }
      return res?.rollback || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.maintenance.rollback( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Wrapper for revisiondelete to assist with verification privacy.
   * @param { string } pageid - The ID of the page.
   * @param { string } revid - The ID of the revision.
   * @param { string } reason - The reason for suppression.
   * @returns { Promise<Object|null> } Result of the action.
   * @example
   * await session.maintenance.suppress( '1', '2', 'Private info' );
   */
  async suppress( pageid, revid, reason ) { return await this.revisiondelete( { target: pageid, ids: revid, type: 'revision', hide: 'content|comment|user', reason: reason } ); }

  /**
   * Adds or removes change tags from revisions or log entries.
   * @param { Object } params - Parameters for the tag action.
   * @returns { Promise<Object|null> } Result of the tag action.
   * @example
   * await session.maintenance.tag( { tags: 'proven', revid: 123 } );
   */
  async tag( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'tag', ...params } );
      if ( res?.tag ) { this.session.logger.info( 'WikiSession.maintenance.tag( ... ) updated successfully' ); }
      return res?.tag || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.maintenance.tag( ... ) update failure: ' + e.message ); }
    return null;
  }

  /**
   * Restores a deleted page or specific revisions.
   * @param { Object } params - Parameters for the undelete action.
   * @returns { Promise<Object|null> } Result of the undelete action.
   * @example
   * await session.maintenance.undelete( { title: 'OldPage', reason: 'Restoring' } );
   */
  async undelete( params ) {
    try {
      if ( !params.token ) { params.token = await this.session.tokens.get( 'csrf' ); }
      const res = await this.session._post( { action: 'undelete', ...params } );
      if ( res?.undelete ) { this.session.logger.info( 'WikiSession.maintenance.undelete( ... ) page restored: ' + res.undelete.title ); }
      return res?.undelete || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.maintenance.undelete( ... ) failure: ' + e.message ); }
    return null;
  }
}
