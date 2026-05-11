/**
 * WikiMaintenance handles administrative page health and system-level actions.
 */
export class WikiMaintenance {
  constructor( session ) { this.session = session; }

  /**
   * Compares two pages or revisions.
   * @param {Object} params - Parameters for the compare action.
   * @returns {Promise} Result of the comparison.
   */
  async compare( params ) {
    try {
      const res = await this.session._get( { action: 'compare', ...params } );
      return res.compare;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Compare failure: ' + e.message );
      return null;
    }
  }

  /**
   * Deletes a page from the wiki.
   * @param {Object} params - Parameters for the delete action.
   * @returns {Promise} Result of the delete action.
   */
  async delete( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'delete', ...params } );
      if ( res.delete ) this.session.logger.info( '[Wiki] Page deleted: ' + res.delete.title );
      return res.delete;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Delete failure: ' + e.message );
      return null;
    }
  }

  /**
   * Manages change tags (create/delete/activate/deactivate).
   * @param {Object} params - Parameters for the managetags action.
   * @returns {Promise} Result of the action.
   */
  async managetags( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'managetags', ...params } );
      if ( res.managetags ) this.session.logger.info( '[Wiki] Tag management successful' );
      return res.managetags;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Tag management failure: ' + e.message );
      return null;
    }
  }

  /**
   * Moves a page to a new title.
   * @param {Object} params - Parameters for the move action.
   * @returns {Promise} Result of the move action.
   */
  async move( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'move', ...params } );
      if ( res.move ) this.session.logger.info( '[Wiki] Page moved: ' + res.move.from + ' -> ' + res.move.to );
      return res.move;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Move failure: ' + e.message );
      return null;
    }
  }

  /**
   * Marks a revision or page as patrolled.
   * @param {Object} params - Parameters for the patrol action.
   * @returns {Promise} Result of the patrol action.
   */
  async patrol( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'patrol' );
      const res = await this.session._post( { action: 'patrol', ...params } );
      if ( res.patrol ) this.session.logger.info( '[Wiki] Patrolled revision: ' + res.patrol.rcid );
      return res.patrol;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Patrol failure: ' + e.message );
      return null;
    }
  }

  /**
   * Protects or unprotects a page.
   * @param {Object} params - Parameters for the protect action.
   * @returns {Promise} Result of the protect action.
   */
  async protect( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'protect', ...params } );
      if ( res.protect ) this.session.logger.info( '[Wiki] Page protected: ' + res.protect.title );
      return res.protect;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Protect failure: ' + e.message );
      return null;
    }
  }

  /**
   * Purges the server cache for pages.
   * @param {Object} params - Parameters for the purge action.
   * @returns {Promise} Result of the purge action.
   */
  async purge( params ) {
    try {
      const res = await this.session._post( { action: 'purge', ...params } );
      if ( res.purge ) this.session.logger.info( '[Wiki] Purge successful' );
      return res.purge;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Purge failure: ' + e.message );
      return null;
    }
  }

  /**
   * Deletes or undeletes specific revisions of a page.
   * @param {Object} params - Parameters for the revisiondelete action.
   * @returns {Promise} Result of the action.
   */
  async revisiondelete( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'revisiondelete', ...params } );
      if ( res.revisiondelete ) this.session.logger.info( '[Wiki] Revision visibility updated' );
      return res.revisiondelete;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Revision delete failure: ' + e.message );
      return null;
    }
  }

  /**
   * Reverts the last edits of a user to a page.
   * @param {Object} params - Parameters for the rollback action.
   * @returns {Promise} Result of the rollback action.
   */
  async rollback( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'rollback' );
      const res = await this.session._post( { action: 'rollback', ...params } );
      if ( res.rollback ) this.session.logger.info( '[Wiki] Rollback successful on: ' + res.rollback.title );
      return res.rollback;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Rollback failure: ' + e.message );
      return null;
    }
  }

  /**
   * Wrapper for revisiondelete to assist with verification privacy.
   * @param {string} pageid - The ID of the page.
   * @param {string} revid - The ID of the revision.
   * @param {string} reason - The reason for suppression.
   * @returns {Promise} Result of the action.
   */
  async suppress( pageid, revid, reason ) {
    return await this.revisiondelete( { target: pageid, ids: revid, type: 'revision', hide: 'content|comment|user', reason: reason } );
  }

  /**
   * Adds or removes change tags from revisions or log entries.
   * @param {Object} params - Parameters for the tag action.
   * @returns {Promise} Result of the tag action.
   */
  async tag( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'tag', ...params } );
      if ( res.tag ) this.session.logger.info( '[Wiki] Tags updated successfully' );
      return res.tag;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Tag update failure: ' + e.message );
      return null;
    }
  }

  /**
   * Restores a deleted page or specific revisions.
   * @param {Object} params - Parameters for the undelete action.
   * @returns {Promise} Result of the undelete action.
   */
  async undelete( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'undelete', ...params } );
      if ( res.undelete ) this.session.logger.info( '[Wiki] Page restored: ' + res.undelete.title );
      return res.undelete;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Undelete failure: ' + e.message );
      return null;
    }
  }
}
