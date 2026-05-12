import { WikiGenerator } from './query/wikigenerator.js';
import { WikiList } from './query/wikilist.js';
import { WikiMeta } from './query/wikimeta.js';
import { WikiProp } from './query/wikiprop.js';

/**
 * WikiQuery handles all data retrieval and search actions from the MediaWiki API.
 */
export class WikiQuery {
  /**
   * Initializes the WikiQuery module.
   * @param { WikiSession } session - The active wiki session.
   * @example
   * const query = new WikiQuery( session );
   */
  constructor( session ) { this.session = session; }

  /**
   * Internal helper to join arrays into pipe-separated strings.
   * @param { string|string[] } val - The value to normalize.
   * @returns { string } Pipe-separated string.
   * @example
   * const joined = session.query._join( [ 'user', 'groups' ] );
   */
  _join( val ) { return Array.isArray( val ) ? val.join( '|' ) : val; }

  /**
   * Executes a continued query to handle large results automatically.
   * @param { Object } params - Parameters for the query action.
   * @param { number|string } limit - Max results to fetch or 'max'.
   * @returns { Promise<Object|null> } Combined result of the query.
   * @example
   * const results = await session.query.execute( { list: 'recentchanges' }, 50 );
   */
  async execute( params, limit = 10 ) {
    try {
      const fullResults = {};
      const currentParams = { action: 'query', continue: '', ...params };
      let totalFetched = 0;
      let continueParams = {};
      while ( true ) {
        const res = await this.session._post( { ...currentParams, ...continueParams } );
        if ( res?.query ) {
          for ( const [ key, value ] of Object.entries( res.query ) ) {
            if ( !fullResults[ key ] ) { fullResults[ key ] = value; }
            else if ( Array.isArray( value ) ) { fullResults[ key ] = fullResults[ key ].concat( value ); }
            else if ( typeof value === 'object' ) { Object.assign( fullResults[ key ], value ); }
          }
          const primaryKey = Object.keys( res.query )[ 0 ];
          totalFetched += Array.isArray( res.query[ primaryKey ] ) ? res.query[ primaryKey ].length : 1;
        }
        if ( !res?.continue || ( limit !== 'max' && totalFetched >= limit ) ) { break; }
        continueParams = res.continue;
      }
      return fullResults;
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.query.execute( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Executes a generator query.
   * @param { string|string[] } type - The generator type.
   * @param { Object } params - Additional parameters.
   * @returns { Promise<Object[]|null> } Result data.
   * @example
   * await session.query.generator( 'allpages', { gaplimit: 5 } );
   */
  async generator( type, params ) { return await WikiGenerator( this.session, this._join( type ), params ); }

  /**
   * Executes a list query.
   * @param { string|string[] } type - The list type.
   * @param { Object } params - Additional parameters.
   * @returns { Promise<Object|null> } Result data.
   * @example
   * await session.query.list( 'categorymembers', { cmtitle: 'Category:Staff' } );
   */
  async list( type, params ) { return await WikiList( this.session, this._join( type ), params ); }

  /**
   * Executes a meta query.
   * @param { string|string[] } type - The meta type.
   * @param { Object } params - Additional parameters.
   * @returns { Promise<Object|null> } Result data.
   * @example
   * await session.query.meta( 'siteinfo', { siprop: 'general' } );
   */
  async meta( type, params ) { return await WikiMeta( this.session, this._join( type ), params ); }

  /**
   * Executes a prop query.
   * @param { string|string[] } type - The prop type.
   * @param { Object } params - Additional parameters.
   * @returns { Promise<Object[]|null> } Result data.
   * @example
   * await session.query.prop( 'info', { titles: 'Main Page' } );
   */
  async prop( type, params ) { return await WikiProp( this.session, this._join( type ), params ); }
}
