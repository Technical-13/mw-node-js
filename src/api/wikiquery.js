import { WikiGenerator } from './query/wikigenerator.js';
import { WikiList } from './query/wikilist.js';
import { WikiMeta } from './query/wikimeta.js';
import { WikiProp } from './query/wikiprop.js';

/**
 * WikiQuery handles all data retrieval and search actions from the MediaWiki API.
 */
export class WikiQuery {
  constructor( session ) { this.session = session; }

  /**
   * Internal helper to join arrays into pipe-separated strings.
   * @param {string|string[]} val - The value to normalize.
   * @returns {string} Pipe-separated string.
   */
  _join( val ) { return Array.isArray( val ) ? val.join( '|' ) : val; }

  /**
   * Executes a continued query to handle large results automatically.
   * @param {Object} params - Parameters for the query action.
   * @param {number|string} limit - Max results to fetch or 'max'.
   * @returns {Promise} Combined result of the query.
   */
  async execute( params, limit = 10 ) {
    try {
      const fullResults = {};
      let currentParams = { action: 'query', continue: '', ...params };
      let totalFetched = 0;
      let continueParams = {};
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
      this.session.logger.error( 'WikiSession.query.execute( ... ) failed to continue: ' + e.message );
      return null;
    }
  }

  /**
   * Executes a generator query.
   * @param {string|string[]} type - The generator type.
   * @param {Object} params - Additional parameters.
   * @returns {Promise} Result data.
   */
  async generator( type, params ) { return await wikigenerator( this.session, this._join( type ), params ); }

  /**
   * Executes a list query.
   * @param {string|string[]} type - The list type.
   * @param {Object} params - Additional parameters.
   * @returns {Promise} Result data.
   */
  async list( type, params ) { return await wikilist( this.session, this._join( type ), params ); }

  /**
   * Executes a meta query.
   * @param {string|string[]} type - The meta type.
   * @param {Object} params - Additional parameters.
   * @returns {Promise} Result data.
   */
  async meta( type, params ) { return await wikimeta( this.session, this._join( type ), params ); }

  /**
   * Executes a prop query.
   * @param {string|string[]} type - The prop type.
   * @param {Object} params - Additional parameters.
   * @returns {Promise} Result data.
   */
  async prop( type, params ) { return await wikiprop( this.session, this._join( type ), params ); }
}
