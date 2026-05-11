import crypto from 'node:crypto';
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
   * Fetches metadata for the bot account.
   * @returns {Promise} The bot metadata.
   */
  async _getBotMetadata() {
    try {
      const res = await this._get( { action: 'query', meta: 'userinfo', uiprop: 'groups|rights' } );
      if ( res.query && res.query.userinfo ) {
        this.logger.info( '[Wiki] Metadata loaded for: ' + res.query.userinfo.name );
        return res.query.userinfo;
      }
    }
    catch ( e ) {
      this.logger.error( '[Wiki] Metadata failure: ' + e.message );
    }
    return null;
  }

  /**
   * Internal GET request wrapper with rate limiting and cookie handling.
   * @param {Object} params - The API parameters.
   * @returns {Promise} The API response data.
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
      this.logger.error( '[Wiki] GET Error: ' + e.message );
      return null;
    }
  }

  /**
   * Orchestrates the login process using encrypted credentials.
   * @returns {Promise} Result of the login attempt.
   */
  async _performLogin() {
    try {
      const pass = WikiSession.decryptPassword( this.config.pass, this.config.iv, this.config.key );
      const res = await this.auth.login( { username: this.config.user, password: pass } );
      if ( res && res.status === 'PASS' ) {
        this.logger.info( '[Wiki] Auto-login successful' );
        return true;
      }
    }
    catch ( e ) {
      this.logger.error( '[Wiki] Auto-login failure: ' + e.message );
    }
    return false;
  }

  /**
   * Internal POST request wrapper with rate limiting and cookie handling.
   * @param {Object} params - The API parameters.
   * @returns {Promise} The API response data.
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
    catch ( e ) {
      this.logger.error( '[Wiki] POST Error: ' + e.message );
      return null;
    }
  }

  /**
   * Starts the 15-minute keep-alive loop to prevent session timeout.
   */
  _startKeepAlive() {
    if ( this.keepAliveInterval ) clearInterval( this.keepAliveInterval );
    this.keepAliveInterval = setInterval( async () => {
      try {
        const res = await this._post( { action: 'query', meta: 'userinfo' } );
        if ( res && res.query.userinfo.id === 0 ) await this._performLogin();
      }
      catch ( err ) {
        this.logger.error( '[Wiki] Keep-alive failed: ' + err.message );
      }
    }, 15 * 60 * 1000 );
  }

  /**
   * Updates the internal cookie jar from response headers.
   * @param {string} cookies - The set-cookie header string.
   */
  _updateCookies( cookies ) {
    if ( cookies ) this.cookieJar = cookies.split( ',' ).map( ( c ) => c.split( ';' ) ).join( '; ' );
  }

  /**
   * Decrypts an AES-256-CBC encrypted password.
   * @param {string} encryptedData - The hex string to decrypt.
   * @param {string} ivHex - The hex initialization vector.
   * @param {string} keyHex - The hex encryption key.
   * @returns {string} The decrypted password.
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
