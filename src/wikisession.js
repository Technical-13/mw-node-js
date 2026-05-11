import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';
import { WikiAccount } from './api/wikiaccount.js';
import { WikiAuth } from './api/wikiauth.js';
import { WikiEdit } from './api/wikiedit.js';
import { WikiMaintenance } from './api/wikimaintenance.js';
import { WikiModeration } from './api/wikimoderation.js';
import { WikiParser } from './api/wikiparser.js';
import { WikiQuery } from './api/wikiquery.js';
import { WikiTokens } from './api/wikitokens.js';
import { WikiWatchlist } from './api/wikiwatchlist.js';

/**
 * WikiSession manages the core connection, security, and state for the MediaWiki API.
 */
export class WikiSession {
  /**
   * Initializes the WikiSession module.
   * @param {Object} config - Connection details including api, user, and encryption keys.
   * @example
   * const session = new WikiSession( {
   *   apiUrl: 'https://wikipedia.org',
   *   userAgent: 'MyBot/1.0',
   *   minDelay: 1000,
   *   logger: myLogger
   * } );
   */
  constructor( config ) {
    this.apiUrl = config.apiUrl;
    this.config = config;
    this.cookieJar = '';
    this.keepAliveInterval = null;
    this.lastRequestTime = 0;
    this.logger = config.logger;
    this.minDelay = config.minDelay || 1000;
    this.userAgent = config.userAgent;
    this.account = new WikiAccount( this );
    this.auth = new WikiAuth( this );
    this.edit = new WikiEdit( this );
    this.maintenance = new WikiMaintenance( this );
    this.moderation = new WikiModeration( this );
    this.parser = new WikiParser( this );
    this.query = new WikiQuery( this );
    this.tokens = new WikiTokens( this );
    this.watchlist = new WikiWatchlist( this );
    this._startKeepAlive();
  }

  /**
   * Internal GET request wrapper with rate limiting and cookie handling.
   * @param {Object} params - The API parameters.
   * @returns {Promise} The API response data.
   * @example
   * const data = await session._get( { action: 'query', meta: 'siteinfo' } );
   */
  async _get( params ) {
    try {
      const now = Date.now();
      const timeSinceLast = now - this.lastRequestTime;
      if ( timeSinceLast < this.minDelay ) await new Promise( ( resolve ) => setTimeout( resolve, this.minDelay - timeSinceLast ) );
      this.lastRequestTime = Date.now();
      const url = new URL( this.apiUrl );
      const searchParams = new URLSearchParams( { ...params, format: 'json', formatversion: '2' } );
      url.search = searchParams.toString();
      const res = await fetch( url, {
        method: 'GET',
        headers: { 'Cookie': this.cookieJar, 'User-Agent': this.userAgent }
      } );
      this._updateCookies( res.headers.get( 'set-cookie' ) );
      return await res.json();
    }
    catch ( e ) {
      this.logger.error( 'WikiSession._get( ... ) failure: ' + e.message );
      return null;
    }
  }

  /**
   * Fetches metadata for the bot account.
   * @returns {Promise} The bot metadata.
   * @example
   * const metadata = await session._getBotMetadata();
   */
  async _getBotMetadata() {
    try {
      const res = await this._get( { action: 'query', meta: 'userinfo', uiprop: 'groups|rights' } );
      if ( res.query && res.query.userinfo ) {
        this.logger.info( 'WikiSession._getBotMetadata( ... ) loaded for: ' + res.query.userinfo.name );
        return res.query.userinfo;
      }
    }
    catch ( e ) { this.logger.error( 'WikiSession._getBotMetadata( ... ) failure: ' + e.message ); }
    return null;
  }

  /**
   * Orchestrates the login process using encrypted credentials.
   * @returns {Promise} Result of the login attempt.
   * @example
   * const success = await session._performLogin();
   */
  async _performLogin() {
    try {
      const pass = WikiSession.decryptPassword( this.config.pass, this.config.iv, this.config.key );
      const res = await this.auth.login( { username: this.config.user, password: pass } );
      if ( res && res.status === 'PASS' ) {
        this.logger.info( 'WikiSession._performLogin( ... ) auto-login successful' );
        return true;
      }
    }
    catch ( e ) { this.logger.error( 'WikiSession._performLogin( ... ) auto-login failure: ' + e.message ); }
    return false;
  }

  /**
   * Internal POST request wrapper with rate limiting and cookie handling.
   * @param {Object} params - The API parameters.
   * @returns {Promise} The API response data.
   * @example
   * const res = await session._post( { action: 'edit', title: 'Test', text: 'Hello' } );
   */
  async _post( params ) {
    try {
      const now = Date.now();
      const timeSinceLast = now - this.lastRequestTime;
      if ( timeSinceLast < this.minDelay ) await new Promise( ( resolve ) => setTimeout( resolve, this.minDelay - timeSinceLast ) );
      this.lastRequestTime = Date.now();
      const body = new URLSearchParams( { ...params, format: 'json', formatversion: '2' } );
      const res = await fetch( this.apiUrl, {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': this.cookieJar,
          'User-Agent': this.userAgent
        }
      } );
      this._updateCookies( res.headers.get( 'set-cookie' ) );
      return await res.json();
    }
    catch ( e ) { this.logger.error( 'WikiSession._post( ... ) error: ' + e.message ); }
    return null;
  }

  /**
   * Starts the 15-minute keep-alive loop to prevent session timeout.
   * @example
   * session._startKeepAlive();
   */
  _startKeepAlive() {
    if ( this.keepAliveInterval ) clearInterval( this.keepAliveInterval );
    this.keepAliveInterval = setInterval( async () => {
      try {
        if ( !this.config.pass || !this.config.key ) return;
        const res = await this._post( { action: 'query', meta: 'userinfo' } );
        if ( res && res.query.userinfo.id === 0 ) await this._performLogin();
      }
      catch ( err ) { this.logger.error( 'WikiSession._startKeepAlive() failure: ' + err.message ); }
    }, 15 * 60 * 1000 );
  }

  /**
   * Updates the internal cookie jar from response headers.
   * @param {string} headers - The set-cookie header string.
   * @example
   * session._updateCookies( response.headers );
   */
  _updateCookies( headers ) {
    // Use getSetCookie() to get an array of strings instead of one comma-split string
    const cookies = headers.getSetCookie();
    if ( cookies.length > 0 ) { this.cookieJar = cookies.map( ( c ) => c.split( ';' )[ 0 ] ).join( '; ' ); }
  }

  /**
   * Decrypts an AES-256-CBC encrypted password.
   * @param {string} encryptedData - The hex string to decrypt.
   * @param {string} ivHex - The hex initialization vector.
   * @param {string} keyHex - The hex encryption key.
   * @returns {string} The decrypted password.
   * @example
   * const pass = WikiSession.decryptPassword( 'hex_data', 'hex_iv', 'hex_key' );
   */
  static decryptPassword( encryptedData, ivHex, keyHex ) {
    const key = Buffer.from( keyHex, 'hex' );
    const iv = Buffer.from( ivHex, 'hex' );
    const decipher = crypto.createDecipheriv( 'aes-256-cbc', key, iv );
    let decrypted = decipher.update( encryptedData, 'hex', 'utf8' );
    decrypted += decipher.final( 'utf8' );
    return decrypted;
  }
}
