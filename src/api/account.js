/**
 * WikiAccount Class
 * Handles account-related actions like verification and metadata.
 */
export class WikiAccount {
  constructor( session ) { this.session = session; }

  async get( params ) {
    try {
      const res = await this.session._post( { action: 'query', list: 'users', usprop: 'blockinfo|registration|editcount|groups', ...params } );
      return res.query.users;
    }
    catch ( e ) {
      console.error( '[Wiki] Account fetch failure: ' + e.message );
      return null;
    }
  }

  async verify( username, token ) {
    try {
      const res = await this.session._post( { action: 'query', prop: 'revisions', titles: 'User:' + username + '/Discord.json', rvprop: 'content|ids', rvslots: 'main' } );
      const page = res.query.pages;
      if ( !page || page.missing ) return null;
      const revision = page.revisions;
      if ( !revision.slots.main.content.includes( token ) ) return null;
      return { pageid: page.pageid, revid: revision.revid };
    }
    catch ( e ) {
      console.error( '[Wiki] Verification failure: ' + e.message );
      return null;
    }
  }

  async suppress( pageid, revid, reason = 'Discord account verification complete' ) {
    try {
      const token = await this.session.tokens.get( 'csrf' );
      const baseParams = { action: 'revisiondelete', type: 'revision', target: pageid, ids: revid, hide: 'content|comment|user', reason: reason, token: token };
      let res = await this.session._post( { ...baseParams, suppress: 'yes' } );
      if ( res.revisiondelete && res.revisiondelete.status === 'success' ) return true;
      console.warn( 'Bot lacks suppressrevision permission. Falling back to deleterevision.' );
      res = await this.session._post( baseParams );
      if ( res.revisiondelete && res.revisiondelete.status === 'success' ) return true;
      console.error( 'Bot lacks necessary permissions (suppressrevision/deleterevision) to hide verification edits.' );
      return false;
    }
    catch ( e ) {
      console.error( '[Wiki] Suppression failure: ' + e.message );
      return false;
    }
  }
}
