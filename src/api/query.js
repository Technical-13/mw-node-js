import { Prop } from './query/prop.js';
import { List } from './query/list.js';
import { Meta } from './query/meta.js';
import { Generator } from './query/generator.js';

/**
 * WikiQuery Class
 * Orchestrates modular MediaWiki action=query requests.
 */
export class WikiQuery {
  constructor( session ) {
    this.session = session;
    this.prop = new Prop( this.session );
    this.list = new List( this.session );
    this.meta = new Meta( this.session );
    this.generator = new Generator( this.session );
  }

  /**
   * Executes a raw query against the MediaWiki API.
   * 
   * @param { Object } params - Parameters for action=query.
   * @returns { Promise<Object> } - The full 'query' response object.
   */
  async execute( params ) {
    try {
      const fullParams = { action: 'query', ...params };
      for ( const [ key, value ] of Object.entries( fullParams ) ) {
        if ( Array.isArray( value ) ) fullParams[ key ] = value.join( '|' );
      }
      const res = await this.session._post( fullParams );
      return res.query;
    }
    catch ( e ) {
      console.error( `[Wiki] Query execution failed: ${ e.message }` );
      return null;
    }
  }
}
