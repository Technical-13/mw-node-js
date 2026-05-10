import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export class WikiSession {
  constructor( config ) {
    this.apiUrl = config.entrypoint;
    this.username = config.username;
    this.password = null;
    this.cookieJar = '';
    this.keepAliveInterval = null;
    
    const metadata = this._getBotMetadata( );
    this.userAgent = `mw-node-js (Bot: ${ this.username }; Version: ${ metadata.version }; Author: ${ metadata.author })`;
  }

  _getBotMetadata( ) {
    const data = { author: 'Unknown Author', version: 'Unknown Version' };
    try {
      const pkgPath = path.resolve( process.cwd( ), 'package.json' );
      const pkg = JSON.parse( fs.readFileSync( pkgPath, 'utf8' ) );
      
      if ( pkg.version ) data.version = pkg.version;

      if ( typeof pkg.author === 'string' ) data.author = pkg.author;
      else if ( pkg.author && pkg.author.name ) data.author = pkg.author.name;
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
      const tokenRes = await this._post( { 
        action: 'query', 
        meta: 'tokens', 
        type: 'login' 
      } );
      const lgtoken = tokenRes.query.tokens.logintoken;

      const loginRes = await this._post( {
        action: 'login',
        lgname: this.username,
        lgpassword: this.password,
        lgtoken
      } );

      return loginRes.login.result === 'Success';
    }
    catch ( error ) {
      console.error( `[Wiki] Login failed: ${ error.message }` );
      return false;
    }
  }

  async clientLogin( password ) {
    this.password = password;
    const tokenRes = await this._post( { action: 'query', meta: 'tokens', type: 'login' } );
    
    const loginRes = await this._post( {
      action: 'clientlogin',
      username: this.username,
      password: this.password,
      logintoken: tokenRes.query.tokens.logintoken,
      loginreturnurl: this.apiUrl
    } );

    if ( loginRes.clientlogin.status === 'PASS' ) {
      this._startKeepAlive( );
      return true;
    }
    return false;
  }

  async logout( ) {
    const tokenRes = await this._post( { action: 'query', meta: 'tokens', type: 'csrf' } );
    
    await this._post( {
      action: 'logout',
      token: tokenRes.query.tokens.csrftoken
    } );

    if ( this.keepAliveInterval ) clearInterval( this.keepAliveInterval );
    this.cookieJar = '';
    this.password = null;
    console.log( '[Wiki] Session closed.' );
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
        console.error( `[Wiki] Keep-alive failed: ${ err.message }` );
      }
    }, 15 * 60 * 1000 );
  }

  async _post( params ) {
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
