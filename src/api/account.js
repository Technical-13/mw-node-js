/**
 * WikiAccount Class
 * Handles user-specific actions including metadata, verification, emailing, and rights management.
 */
export class WikiAccount {
  constructor( session ) { this.session = session; }

  async email( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'csrf' );
      const res = await this.session._post( { action: 'emailuser', ...params } );
      return res.emailuser;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Email failure: ' + e.message );
      return null;
    }
  }

  async get( params ) {
    try {
      const res = await this.session._post( { action: 'query', list: 'users', usprop: 'blockinfo|registration|editcount|groups', ...params } );
      return res.query.users;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Account fetch failure: ' + e.message );
      return null;
    }
  }

  async rights( params ) {
    try {
      if ( !params.token ) params.token = await this.session.tokens.get( 'userrights' );
      const res = await this.session._post( { action: 'userrights', ...params } );
      return res.userrights;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Rights change failure: ' + e.message );
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
      this.session.logger.error( '[Wiki] Verification failure: ' + e.message );
      return null;
    }
  }
}
