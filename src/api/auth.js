import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import pkg from '../../package.json' assert { type: 'json' };
import { WikiLogger } from '../util/logger.js';
import { WikiTokens } from './tokens.js';
/**
 * WikiSession Class
 * Handles authentication, session persistence, and rate limiting.
 */
export class WikiSession {
  constructor( config ) {
    this.apiUrl = config.entrypoint;
    this.username = config.username;
    this.minDelay = config.minDelay || 1000;
    this.lastRequestTime = 0;
    this.password = null;
    this.cookieJar = '';
    this.keepAliveInterval = null;
    this.logger = new WikiLogger( config.logDir );
    this.tokens = new WikiTokens( this );
    const metadata = this._getBotMetadata( );
    this.userAgent = 'mw-node-js (' + pkg.version + ') (Bot: ' + this.username + '; Version: ' + metadata.version + '; Author: ' + metadata.author + ')';
  }
  _getBotMetadata( ) {
    const data = { author: 'undefined', version: 'undefined' };
    try {
      const pkgPath = path.resolve( process.cwd( ), 'package.json' );
      const botPkg = JSON.parse( fs.readFileSync( pkgPath, 'utf8' ) );
      if ( botPkg.version ) data.version = botPkg.version;
      else this.logger.warn( 'Bot\'s package.json is missing a version number.' );
      if ( typeof botPkg.author === 'string' ) data.author = botPkg.author;
      else if ( botPkg.author && botPkg.author.name ) data.author = botPkg.author.name;
      else this.logger.warn( 'Bot\'s package.json is missing an author.' );
    }
    catch ( e ) { }
    return data;
  }
  static decryptPassword( encryptedData, ivHex, keyHex ) {
    const key = Buffer.from( keyHex, 'hex' );
    const iv = Buffer.from( ivHex, 'hex' );
    const decipher = crypto.createDecipheriv( 'aes-256-cbc', key, iv );
    let decrypted = decipher.update( encryptedData, 'hex', 'utf8' );
    decrypted += decipher.final( 'utf8' );
    return decrypted;
  }
  async login( password ) {
    this.password = password;
    const success = await this._performLogin( );
    if ( success ) this._startKeepAlive( );
    return success;
  }
  async _performLogin( ) {
    try {
      const lgtoken = await this.tokens.get( 'login' );
      const loginRes = await this._post( {
        action: 'login',
        lgname: this.username,
        lgpassword: this.password,
        lgtoken: lgtoken
      } );
      return loginRes.login.result === 'Success';
    }
    catch ( error ) {
      this.logger.error( '[Wiki] Login failed: ' + error.message );
      return false;
    }
  }
  async clientLogin( password ) {
    this.password = password;
    try {
      const lgtoken = await this.tokens.get( 'login' );
      const loginRes = await this._post( {
        action: 'clientlogin',
        username: this.username,
        password: this.password,
        logintoken: lgtoken,
        loginreturnurl: this.apiUrl
      } );
      if ( loginRes.clientlogin.status === 'PASS' ) {
        this._startKeepAlive( );
        return true;
      }
      return false;
    }
    catch ( error ) {
      this.logger.error( '[Wiki] ClientLogin failed: ' + error.message );
      return false;
    }
  }
  async logout( ) {
    const token = await this.tokens.get( 'csrf' );
    await this._post( { action: 'logout', token: token } );
    if ( this.keepAliveInterval ) clearInterval( this.keepAliveInterval );
    this.cookieJar = '';
    this.password = null;
    return true;
  }
  _startKeepAlive( ) {
    if ( this.keepAliveInterval ) clearInterval( this.keepAliveInterval );
    this.keepAliveInterval = setInterval( async ( ) => {
      try {
        const res = await this._post( { action: 'query', meta: 'userinfo' } );
        if ( res.query.userinfo.id === 0 ) await this._performLogin( );
      }
      catch ( err ) {
        this.logger.error( '[Wiki] Keep-alive failed: ' + err.message );
      }
    }, 15 * 60 * 1000 );
  }
  async _post( params ) {
    const now = Date.now( );
    const timeSinceLast = now - this.lastRequestTime;
    if ( timeSinceLast < this.minDelay ) {
      await new Promise( ( resolve ) => setTimeout( resolve, this.minDelay - timeSinceLast ) );
    }
    this.lastRequestTime = Date.now( );
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
    const cookies = res.headers.get( 'set-cookie' );
    if ( cookies ) this.cookieJar = cookies.split( ',' ).map( c => c.split( ';' ) ).join( '; ' );
    return await res.json( );
  }
}
