/**
 * WikiParser handles the conversion of wikitext into HTML or other display formats.
 */
export class WikiParser {
  constructor( session ) { this.session = session; }

  /**
   * Expands all templates, variables, and parser functions within wikitext.
   * @param {Object} params - Parameters for the expandtemplates action.
   * @returns {Promise} Result containing the expanded wikitext.
   */
  async expandtemplates( params ) {
    try {
      const res = await this.session._post( { action: 'expandtemplates', ...params } );
      return res.expandtemplates;
    }
    catch ( e ) {
      this.session.logger.error( 'WikiSession.parser.expandtemplates( ... ) failure: ' + e.message );
      return null;
    }
  }

  /**
   * Parses wikitext or page content into HTML or other formats.
   * @param {Object} params - Parameters for the parse action.
   * @returns {Promise} Result of the parse action.
   */
  async parse( params ) {
    try {
      const res = await this.session._post( { action: 'parse', ...params } );
      return res.parse;
    }
    catch ( e ) {
      this.session.logger.error( 'WikiSession.parser.parse( ... ) failure: ' + e.message );
      return null;
    }
  }
}
