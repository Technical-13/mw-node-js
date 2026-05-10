/**
 * WikiMaintenance Class
 * Handles administrative and moderation actions.
 */
export class WikiMaintenance {
  constructor( session ) { this.session = session; }

  async block( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'block', ...params } );
      if ( res.block ) this.session.logger.info( '[Wiki] User blocked: ' + res.block.user );
      return res.block;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Block failure: ' + e.message );
      return null;
    }
  }

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

  async patrol( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'patrol' );
      const res = await this.session._post( { action: 'patrol', ...params } );
      return res.patrol;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Patrol failure: ' + e.message );
      return null;
    }
  }

  async protect( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'protect', ...params } );
      if ( res.protect ) this.session.logger.info( '[Wiki] Protection updated for: ' + res.protect.title );
      return res.protect;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Protect failure: ' + e.message );
      return null;
    }
  }

  async revisionDelete( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const baseParams = { action: 'revisiondelete', ...params };
      let res = await this.session._post( { ...baseParams, suppress: 'yes' } );
      if ( res.revisiondelete && res.revisiondelete.status === 'success' ) return res.revisiondelete;
      this.session.logger.warn( 'Bot lacks suppressrevision permission. Falling back to deleterevision.' );
      res = await this.session._post( baseParams );
      if ( res.revisiondelete && res.revisiondelete.status === 'success' ) return res.revisiondelete;
      this.session.logger.error( 'Bot lacks necessary permissions (suppressrevision/deleterevision).' );
      return null;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] RevisionDelete failure: ' + e.message );
      return null;
    }
  }

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

  async suppress( pageid, revid, reason ) {
    return await this.revisionDelete( { target: pageid, ids: revid, type: 'revision', hide: 'content|comment|user', reason: reason } );
  }

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
