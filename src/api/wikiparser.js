/**
 * WikiParser handles the conversion of wikitext into HTML or other display formats.
 */
export class WikiParser {
  /**
   * Initializes the WikiParser module.
   * @param { WikiSession } session - The active wiki session.
   * @example
   * const parser = new WikiParser( session );
   */
  constructor( session ) { this.session = session; }

  /**
   * Expands all templates, variables, and parser functions within wikitext.
   * @param { Object } params - Parameters for the expandtemplates action.
   * @returns { Promise<Object|null> } Result containing the expanded wikitext.
   * @example
   * await session.parser.expandtemplates( { text: '{{Project:Name}}' } );
   */
  async expandtemplates( params ) {
    try {
      const res = await this.session._post( { action: 'expandtemplates', ...params } );
      return res?.expandtemplates || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.parser.expandtemplates( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Parses wikitext or page content into HTML or other formats.
   * @param { Object } params - Parameters for the parse action.
   * @returns { Promise<Object|null> } Result of the parse action.
   * @example
   * await session.parser.parse( { text: '== Header ==' } );
   */
  async parse( params ) {
    try {
      const res = await this.session._post( { action: 'parse', ...params } );
      return res?.parse || null;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.parser.parse( ... ) failure: ' + e.message ); }
    return null;
  }
}
