import { Prop } from './query/prop.js';
import { List } from './query/list.js';
import { Meta } from './query/meta.js';
import { Generator } from './query/generator.js';

/**
 * WikiQuery Class
 * Orchestrates modular MediaWiki action=query requests with continuation support.
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
   * Executes a query with automatic continuation support.
   * 
   * @param { Object } params - Parameters for action=query.
   * @param { number|string } limit - Total results desired or 'max' for all.
   * @returns { Promise<Object> } - The aggregated query results.
   */
  async execute( params, limit = 10 ) {
    try {
      const fullResults = { };
      let currentParams = { action: 'query', ...params };
      let totalFetched = 0;
      let continueParams = { };
      while ( true ) {
        const res = await this.session._post( { ...currentParams, ...continueParams } );
        if ( res.query ) {
          for ( const [ key, value ] of Object.entries( res.query ) ) {
            if ( !fullResults[ key ] ) fullResults[ key ] = value;
            else if ( Array.isArray( value ) ) fullResults[ key ] = fullResults[ key ].concat( value );
            else if ( typeof value === 'object' ) Object.assign( fullResults[ key ], value );
          }
          const primaryKey = Object.keys( res.query );
          totalFetched += Array.isArray( res.query[ primaryKey ] ) ? res.query[ primaryKey ].length : 1;
        }
        if ( !res.continue || ( limit !== 'max' && totalFetched >= limit ) ) break;
        continueParams = res.continue;
      }
      return fullResults;
    }
    catch ( e ) {
      console.error( `[Wiki] Continued query failed: ${ e.message }` );
      return null;
    }
  }
}
