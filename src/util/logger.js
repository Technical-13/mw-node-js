import fs from 'fs';
import path from 'path';

/**
 * WikiLogger Class
 * 
 * Provides a daily file-based logging system with support for Markdown, JSON, CSV, and Plain Text.
 * Supports independent verbosity levels for both the system console and the local log files.
 * 
 * Verbosity Levels:
 * 0 - No logging.
 * 1 - Only Warnings and Errors (Default).
 * 2 - Debugging (Warnings, Errors, and Debug messages).
 * 3 - Everything (Info, Debug, Warnings, Errors, and Logs).
 * 
 * @param { Object } config - Configuration object.
 * @param { string } config.logDir - Directory to store log files (Default: '/logs').
 * @param { string } config.logFormat - Format for entries: 'md', 'json', 'csv', 'txt' (Default: 'md').
 * @param { number } config.consoleVerbosity - Console level 0-3 (Default: 1).
 * @param { number } config.fileVerbosity - File level 0-3 (Default: 1).
 */
export class WikiLogger {
  constructor( config ) {
    this.logDir = config.logDir || path.resolve( process.cwd( ), 'logs' );
    this.consoleVerbosity = config.consoleVerbosity ?? 1;
    this.fileVerbosity = config.fileVerbosity ?? 1;
    this.format = config.logFormat || 'md';
    if ( !fs.existsSync( this.logDir ) ) fs.mkdirSync( this.logDir, { recursive: true } );
  }

  debug( message ) { this._write( 'DEBUG', message, 2 ); }
  error( message ) { this._write( 'ERROR', message, 1 ); }
  info( message ) { this._write( 'INFO', message, 3 ); }
  log( message ) { this.info( message ); }
  warn( message ) { this._write( 'WARN', message, 1 ); }

  _formatEntry( timestamp, level, message ) {
    if ( this.format === 'json' ) return JSON.stringify( { timestamp, level, message } ) + '\n';
    if ( this.format === 'csv' ) return '"' + timestamp + '","' + level + '","' + message.replace( /"/g, '""' ) + '"\n';
    if ( this.format === 'md' ) return '```\n[' + timestamp + '] [' + level + '] ' + message + '\n```\n';
    return '[' + timestamp + '] [' + level + '] ' + message + '\n';
  }

  _write( level, message, priority ) {
    const now = new Date( );
    const date = now.toISOString( ).split( 'T' )[ 0 ];
    const timestamp = now.toISOString( ).replace( 'T', ' ' ).split( '.' )[ 0 ];
    const logFile = path.join( this.logDir, date + '.' + this.format );
    const entry = this._formatEntry( timestamp, level, message );
    if ( priority <= this.fileVerbosity && this.fileVerbosity > 0 ) {
      try { fs.appendFileSync( logFile, entry, 'utf8' ); }
      catch ( e ) { console.error( '[Logger] Failed to write to log: ' + e.message ); }
    }
    if ( priority <= this.consoleVerbosity && this.consoleVerbosity > 0 ) {
      if ( level === 'ERROR' ) console.error( message );
      else if ( level === 'WARN' ) console.warn( message );
      else console.log( message );
    }
  }
}
