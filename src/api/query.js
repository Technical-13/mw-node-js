import { WikiGenerator } from './query/generator.js';
import { WikiList } from './query/list.js';
import { WikiMeta } from './query/meta.js';
import { WikiProp } from './query/prop.js';

/**
 * WikiQuery handles all data retrieval and search actions from the MediaWiki API.
 */
export class WikiQuery {
  constructor( session ) {
    this.session = session;
    this.generator = new WikiGenerator( session );
    this.list = new WikiList( session );
    this.meta = new WikiMeta( session );
    this.prop = new WikiProp( session );
  }

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
            else if ( Array.isArray( value ) ) fullResults[key] = fullResults[ key ].concat( value );
            else if ( typeof value === 'object' ) Object.assign( fullResults[ key ], value );
          }
          const primaryKey = Object.keys( res.query )[ 0 ];
          totalFetched += Array.isArray( res.query[ primaryKey ] ) ? res.query[ primaryKey ].length : 1;
        }
        if ( !res.continue || ( limit !== 'max' && totalFetched >= limit ) ) break;
        continueParams = res.continue;
      }
      return fullResults;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Continued query failed: ' + e.message );
      return null;
    }
  }

  /**
   * Performs a standard GET query to retrieve data.
   * @param {Object} params - Parameters for the query action.
   * @returns {Promise} Result of the query.
   */
  async get( params ) {
    try {
      const res = await this.session._get( { action: 'query', ...params } );
      return res.query;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] Query failure: ' + e.message );
      return null;
    }
  }

  /**
   * Performs a POST query, useful for large parameter sets or generators.
   * @param {Object} params - Parameters for the query action.
   * @returns {Promise} Result of the query.
   */
  async post( params ) {
    try {
      const res = await this.session._post( { action: 'query', ...params } );
      return res.query;
    }
    catch ( e ) {
      this.session.logger.error( '[Wiki] POST query failure: ' + e.message );
      return null;
    }
  }
}
