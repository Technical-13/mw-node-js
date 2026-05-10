/**
 * WikiParser Class
 * Converts wikitext into HTML or other formats for display in external apps.
 */
export class WikiParser {
  constructor( session ) { this.session = session; }

  async parse( params ) {
    try {
      const res = await this.session._post( { action: 'parse', ...params } );
      return res.parse;
    }
    catch ( e ) {
      console.error( '[Wiki] Parse failure: ' + e.message );
      return null;
    }
  }
}
