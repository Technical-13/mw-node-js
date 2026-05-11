import fs from 'node:fs';
import path from 'node:path';

/**
 * WikiLogger provides a file-based logging system with support for Markdown, JSON, CSV, and Plain Text.
 * Supports independent verbosity levels for both the system console and the local log files.
 * 
 * @param {Object} config - Configuration object.
 * @param {string} config.logDir - Directory to store log files.
 * @param {string} config.logName - Filename format. Supports '|YYYY|', '|MM|', '|DD|', and '|##|'.
 * @param {string} config.logFormat - Format for entries: 'md', 'json', 'csv', 'txt'.
 * @param {number} config.consoleVerbosity - Console level 0-3.
 * @param {number} config.fileVerbosity - File level 0-3.
 */
export class WikiLogger {
  constructor( config ) {
    this.logDir = config.logDir || path.resolve( process.cwd(), 'logs' );
    this.logName = config.logName || 'Wiki-|YYYY||MM||DD|';
    this.format = config.logFormat || 'md';
    this.consoleVerbosity = config.consoleVerbosity ?? 1;
    this.fileVerbosity = config.fileVerbosity ?? 1;
    if ( !fs.existsSync( this.logDir ) ) fs.mkdirSync( this.logDir, { recursive: true } );
  }

  /**
   * Formats a log entry based on the specified file format.
   * @param {string} timestamp - ISO timestamp string.
   * @param {string} level - Log level.
   * @param {string} message - The message to log.
   * @returns {string} Formatted log entry.
   */
  _formatEntry( timestamp, level, message ) {
    if ( this.format === 'json' ) return JSON.stringify( { timestamp, level, message } ) + '\n';
    if ( this.format === 'csv' ) return '"' + timestamp + '","' + level + '","' + message.replace( /"/g, '""' ) + '"\n';
    if ( this.format === 'md' ) return '```\n[' + timestamp + '] [' + level + '] ' + message + '\n```\n';
    return '[' + timestamp + '] [' + level + '] ' + message + '\n';
  }

  /**
   * Calculates the next incremental counter for filename placeholders.
   * @param {string} fileNameBase - The base filename with '|##|'.
   * @returns {number} The next available counter.
   */
  _getNextCounter( fileNameBase ) {
    try {
      const files = fs.readdirSync( this.logDir );
      let max = 0;
      const escapedBase = fileNameBase.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ).replace( '\\|##\\|', '(\\d+)' );
      const regex = new RegExp( '^' + escapedBase + '\\.' + this.format + '$' );
      for ( const file of files ) {
        const match = file.match( regex );
        if ( match && parseInt( match[ 1 ] ) > max ) max = parseInt( match[ 1 ] );
      }
      return max + 1;
    }
    catch ( e ) { return 1; }
  }

  /**
   * Internal write method to handle console and file output.
   * @param {string} level - Log level.
   * @param {string} message - Message to log.
   * @param {number} priority - Priority level for verbosity checks.
   */
  _write( level, message, priority ) {
    this._writeConsole( level, message, priority );
    this._writeFile( level, message, priority );
  }

  /**
   * Internal write method to handle console output.
   * @param {string} level - Log level.
   * @param {string} message - Message to log.
   * @param {number} priority - Priority level for verbosity checks.
   */
  _writeConsole( level, message, priority ) {
    if ( priority <= this.consoleVerbosity && this.consoleVerbosity > 0 ) {
      if ( level === 'ERROR' ) console.error( message );
      else if ( level === 'WARN' ) console.warn( message );
      else console.log( message );
    }
  }  

  /**
   * Internal write method to handle file output.
   * @param {string} level - Log level.
   * @param {string} message - Message to log.
   * @param {number} priority - Priority level for verbosity checks.
   */
  _writeFile( level, message, priority ) {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String( now.getMonth() + 1 ).padStart( 2, '0' );
    const DD = String( now.getDate() ).padStart( 2, '0' );
    const timestamp = now.toISOString().replace( 'T', ' ' ).split( '.' )[ 0 ];
    let fileName = this.logName.replace( '|YYYY|', YYYY ).replace( '|MM|', MM ).replace( '|DD|', DD );
    if ( fileName.includes( '|##|' ) ) {
      const counter = this._getNextCounter( fileName );
      fileName = fileName.replace( '|##|', counter );
    }
    const logFile = path.join( this.logDir, fileName + '.' + this.format );
    const entry = this._formatEntry( timestamp, level, message );
    if ( priority <= this.fileVerbosity && this.fileVerbosity > 0 ) {
      try { fs.appendFileSync( logFile, entry, 'utf8' ); }
      catch ( e ) {
        if ( priority <= this.consoleVerbosity && this.consoleVerbosity > 0 ) {
          const logLevel = level.toLowerCase();
          this._writeConsole( 'WikiSession.logger.' + logLevel + '( ... ) failed to write to log file: ' + e.message );
        }
      }
    }
  }

  /**
   * Logs a debugging message.
   * @param {string} message - Message to log.
   */
  debug( message ) { this._write( 'DEBUG', message, 2 ); }

  /**
   * Logs an error message.
   * @param {string} message - Message to log.
   */
  error( message ) { this._write( 'ERROR', message, 1 ); }

  /**
   * Logs an informational message.
   * @param {string} message - Message to log.
   */
  info( message ) { this._write( 'INFO', message, 3 ); }

  /**
   * Alias for info.
   * @param {string} message - Message to log.
   */
  log( message ) { this.info( message ); }

  /**
   * Logs a warning message.
   * @param {string} message - Message to log.
   */
  warn( message ) { this._write( 'WARN', message, 1 ); }
}
