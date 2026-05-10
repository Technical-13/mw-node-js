import fs from 'node:fs';
import path from 'node:path';
/**
 * WikiLogger Class
 * Handles daily markdown-based logging for bot events and errors.
 */
export class WikiLogger {
  constructor( logDir ) {
    this.logDir = logDir || path.resolve( process.cwd( ), 'logs' );
    if ( !fs.existsSync( this.logDir ) ) fs.mkdirSync( this.logDir, { recursive: true } );
  }
  error( message ) { this._write( 'ERROR', message ); }
  info( message ) { this._write( 'INFO', message ); }
  warn( message ) { this._write( 'WARN', message ); }
  _write( level, message ) {
    const now = new Date( );
    const date = now.toISOString( ).split( 'T' )[ 0 ];
    const timestamp = now.toISOString( ).replace( 'T', ' ' ).split( '.' )[ 0 ];
    const logFile = path.join( this.logDir, date + '.md' );
    const entry = '```\n[' + timestamp + '] [' + level + '] ' + message + '\n```\n';
    try { fs.appendFileSync( logFile, entry, 'utf8' ); }
    catch ( e ) { console.error( '[Logger] Failed to write to log: ' + e.message ); }
    if ( level === 'ERROR' ) console.error( message );
    else if ( level === 'WARN' ) console.warn( message );
    else console.log( message );
  }
}
