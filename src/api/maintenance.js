/**
 * WikiMaintenance Class
 * Handles administrative and moderation actions.
 */
export class WikiMaintenance {
  constructor( session ) { this.session = session; }

  /**
   * Prevents a user from editing or performing actions.
   * 
   * @param { Object } params - Parameters for action=block.
   * @returns { Promise<Object|null> }
   */
  async block( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'block', ...params } );
      if ( res.block ) console.log( '[Wiki] User blocked: ' + res.block.user );
      return res.block;
    }
    catch ( e ) {
      console.error( '[Wiki] Block failure: ' + e.message );
      return null;
    }
  }

  /**
   * Deletes a page from the wiki.
   * 
   * @param { Object } params - Parameters for action=delete.
   * @returns { Promise<Object|null> }
   */
  async delete( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'delete', ...params } );
      if ( res.delete ) console.log( '[Wiki] Page deleted: ' + res.delete.title );
      return res.delete;
    }
    catch ( e ) {
      console.error( '[Wiki] Delete failure: ' + e.message );
      return null;
    }
  }

  /**
   * Renames a page on the wiki.
   * 
   * @param { Object } params - Parameters for action=move.
   * @returns { Promise<Object|null> }
   */
  async move( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'move', ...params } );
      if ( res.move ) console.log( '[Wiki] Page moved: ' + res.move.from + ' -> ' + res.move.to );
      return res.move;
    }
    catch ( e ) {
      console.error( '[Wiki] Move failure: ' + e.message );
      return null;
    }
  }

  /**
   * Marks a specific revision or recent change as patrolled.
   * 
   * @param { Object } params - Parameters for action=patrol.
   * @returns { Promise<Object|null> }
   */
  async patrol( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'patrol' );
      const res = await this.session._post( { action: 'patrol', ...params } );
      return res.patrol;
    }
    catch ( e ) {
      console.error( '[Wiki] Patrol failure: ' + e.message );
      return null;
    }
  }

  /**
   * Changes the protection levels of a page.
   * 
   * @param { Object } params - Parameters for action=protect.
   * @returns { Promise<Object|null> }
   */
  async protect( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'protect', ...params } );
      if ( res.protect ) console.log( '[Wiki] Protection updated for: ' + res.protect.title );
      return res.protect;
    }
    catch ( e ) {
      console.error( '[Wiki] Protect failure: ' + e.message );
      return null;
    }
  }

  /**
   * Modifies the visibility of specific revisions or log entries.
   * 
   * @param { Object } params - Parameters for action=revisiondelete.
   * @returns { Promise<Object|null> }
   */
  async revisionDelete( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const baseParams = { action: 'revisiondelete', ...params };
      let res = await this.session._post( { ...baseParams, suppress: 'yes' } );
      if ( res.revisiondelete && res.revisiondelete.status === 'success' ) return res.revisiondelete;
      console.warn( 'Bot lacks suppressrevision permission. Falling back to deleterevision.' );
      res = await this.session._post( baseParams );
      if ( res.revisiondelete && res.revisiondelete.status === 'success' ) return res.revisiondelete;
      console.error( 'Bot lacks necessary permissions (suppressrevision/deleterevision).' );
      return null;
    }
    catch ( e ) {
      console.error( '[Wiki] RevisionDelete failure: ' + e.message );
      return null;
    }
  }

  /**
   * Reverts the last edits of a specific user on a page.
   * 
   * @param { Object } params - Parameters for action=rollback.
   * @returns { Promise<Object|null> }
   */
  async rollback( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'rollback' );
      const res = await this.session._post( { action: 'rollback', ...params } );
      if ( res.rollback ) console.log( '[Wiki] Rollback successful on: ' + res.rollback.title );
      return res.rollback;
    }
    catch ( e ) {
      console.error( '[Wiki] Rollback failure: ' + e.message );
      return null;
    }
  }

  /**
   * Specialized wrapper for revisionDelete to hide content from history.
   * 
   * @param { number } pageid - ID of the page.
   * @param { number } revid - ID of the revision.
   * @param { string } reason - Reason for suppression.
   * @returns { Promise<Object|null> }
   */
  async suppress( pageid, revid, reason ) {
    return await this.revisionDelete( {
      target: pageid,
      ids: revid,
      type: 'revision',
      hide: 'content|comment|user',
      reason: reason
    } );
  }

  /**
   * Restores a deleted page or specific revisions.
   * 
   * @param { Object } params - Parameters for action=undelete.
   * @returns { Promise<Object|null> }
   */
  async undelete( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'undelete', ...params } );
      if ( res.undelete ) console.log( '[Wiki] Page restored: ' + res.undelete.title );
      return res.undelete;
    }
    catch ( e ) {
      console.error( '[Wiki] Undelete failure: ' + e.message );
      return null;
    }
  }
}
