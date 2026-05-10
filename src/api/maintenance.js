/**
 * WikiMaintenance Class
 * Handles administrative and moderation actions.
 */
export class WikiMaintenance {
  constructor( session ) { this.session = session; }

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
}
