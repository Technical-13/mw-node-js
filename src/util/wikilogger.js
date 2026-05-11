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
  /**
   * Initializes the WikiLogger module.
   * @param {Object} config - Configuration settings for directories, naming, and verbosity.
   * @example
   * const logger = new WikiLogger( {
   *   logDir: './logs',
   *   logName: 'Wiki-|YYYY||MM||DD|',
   *   logFormat: 'md',
   *   consoleVerbosity: 2,
   *   fileVerbosity: 3
   * } );
   */
  constructor( config ) {
    this._cachedCounter = null;
    this._cachedDate = '';
    this.logDir = config.logDir || path.resolve( process.cwd(), 'logs' );
    this.logName = config.logName || 'Wiki-|YYYY||MM||DD|';
    this.format = config.logFormat || 'md';
    this.consoleVerbosity = config.consoleVerbosity ?? 1;
    this.fileVerbosity = config.fileVerbosity ?? 1;
    if ( !fs.existsSync( this.logDir ) ) fs.mkdirSync( this.logDir, { recursive: true } );
  }

  /**
   * Splits a message into chunks by line breaks to fit within character limits.
   * @param { string } text - The long message to split.
   * @param { number } limit - The character limit (default 4000).
   * @returns { string[] } An array of message chunks.
   * @example
   * const chunks = logger._chunkMessage( longLogString, 4000 );
   */
  _chunkMessage( text, limit ) {
    const maxLength = limit || 4000;
    const lines = text.split( '\n' );
    const chunks = [];
    let currentChunk = '';

    for ( const line of lines ) {
      if ( line.length > maxLength ) {
        if ( currentChunk ) {
          chunks.push( currentChunk );
          currentChunk = '';
        }
        chunks.push( line.substring( 0, maxLength ) );
        continue;
      }
      if ( ( currentChunk + line ).length + 1 > maxLength ) {
        chunks.push( currentChunk );
        currentChunk = line;
      }
      else { currentChunk = ( currentChunk === '' ) ? line : currentChunk + '\n' + line; }
    }
    if ( currentChunk ) chunks.push( currentChunk );
    return chunks;
  }

  /**
   * Formats a log entry based on the specified file format.
   * @param {string} timestamp - ISO timestamp string.
   * @param {string} level - Log level.
   * @param {string} message - The message to log.
   * @returns {string} Formatted log entry.
   * @example
   * const entry = logger._formatEntry( '2026-05-11 12:00:00', 'INFO', 'System started' );
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
   * @example
   * const next = logger._getNextCounter( 'Wiki-2026-05-11-|##|' );
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
   * @example
   * logger._write( 'INFO', 'Message received', 3 );
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
   * @example
   * logger._writeConsole( 'ERROR', 'Fatal crash', 1 );
   */
  _writeConsole( level, message, priority ) {
    if ( priority <= this.consoleVerbosity && this.consoleVerbosity > 0 ) {
      if ( level === 'ERROR' ) console.error( message );
      else if ( level === 'WARN' ) console.warn( message );
      else console.log( message );
    }
  }

  /**
   * Internal write method to handle file output with row-aware chunking and cached counters.
   * @param { string } level - Log level.
   * @param { string } message - Message to log.
   * @param { number } priority - Priority level for verbosity checks.
   * @example
   * logger._writeFile( 'DEBUG', 'Variable state: x=10', 2 );
   */
  _writeFile( level, message, priority ) {
    if ( priority > this.fileVerbosity || this.fileVerbosity <= 0 ) return;
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String( now.getMonth() + 1 ).padStart( 2, '0' );
    const DD = String( now.getDate() ).padStart( 2, '0' );
    const dateKey = YYYY + MM + DD;
    const timestamp = now.toISOString().replace( 'T', ' ' ).split( '.' )[ 0 ];
    let fileName = this.logName.replace( '|YYYY|', YYYY ).replace( '|MM|', MM ).replace( '|DD|', DD );
    if ( fileName.includes( '|##|' ) ) {
      if ( this._cachedCounter === null || this._cachedDate !== dateKey ) {
        this._cachedCounter = this._getNextCounter( fileName );
        this._cachedDate = dateKey;
      }
      fileName = fileName.replace( '|##|', this._cachedCounter );
    }
    const logFile = path.join( this.logDir, fileName + '.' + this.format );
    const chunks = this._chunkMessage( message, 4000 );
    for ( const chunk of chunks ) {
      const entry = this._formatEntry( timestamp, level, chunk );
      try { fs.appendFileSync( logFile, entry, 'utf8' ); }
      catch ( e ) {
        const logLevel = level.toLowerCase();
        this._writeConsole( 'ERROR', 'WikiSession.logger.' + logLevel + '( ... ) failure: ' + e.message, 1 );
        break;
      }
    }
  }

  /**
   * Logs a debugging message.
   * @param {string} message - Message to log.
   * @example
   * logger.debug( 'Debugging trace logic' );
   */
  debug( message ) { this._write( 'DEBUG', message, 2 ); }

  /**
   * Logs an error message.
   * @param {string} message - Message to log.
   * @example
   * logger.error( 'WikiSession.auth.login() failure: Unauthorized' );
   */
  error( message ) { this._write( 'ERROR', message, 1 ); }

  /**
   * Logs an informational message.
   * @param {string} message - Message to log.
   * @example
   * logger.info( 'Connection established.' );
   */
  info( message ) { this._write( 'INFO', message, 3 ); }

  /**
   * Alias for info.
   * @param {string} message - Message to log.
   * @example
   * logger.log( 'General log entry.' );
   */
  log( message ) { this.info( message ); }

  /**
   * Logs a warning message.
   * @param {string} message - Message to log.
   * @example
   * logger.warn( 'Rate limit approaching.' );
   */
  warn( message ) { this._write( 'WARN', message, 1 ); }
}
