# mw-node-js (v1.0.1)
A modular Node.js 22+ library for MediaWiki 1.43+ and Discord.js v14 bots.

## Package Metadata
- **Current Version**: 1.0.1
- **Last Updated**: 2026-05-10T18:52:48Z
- **Tracking**: Check `package.json` for the `lastUpdated` key.

## Features
- **Encrypted Auth**: Securely handle wiki credentials using AES-256-CBC.
- **Rate Limiting**: Built-in `minDelay` queue to prevent API throttling.
- **Continuation**: Automatic recursion logic for large API queries.
- **Flexible Logging**: Daily or incremental logs in Markdown, JSON, CSV, or Plain Text with independent verbosity controls.

## Configuration
The `WikiSession` requires a configuration object, typically stored in a `wikiconfig.json` file.

```json
{
  "entrypoint": "https://your-wiki.com/wiki/api.php",
  "username": "YourBotName",
  "minDelay": 1000,
  "logDir": "./logs",
  "logName": "Wiki-YYYYMMDD",
  "logFormat": "md",
  "consoleVerbosity": 1,
  "fileVerbosity": 3
}
```

- **entrypoint**: The full URL to your wiki's `api.php`:
  - This can be found on your wiki at **`Special:Version#mw-version-entrypoints`**.
- **username**: The wiki account name for the bot.
- **minDelay**: Milliseconds to wait between requests (prevents rate-limiting).
- **logDir**: Path to store log files (Default: `./logs`).
- **logName**: Filename template. Supports dynamic placeholders:
  - `YYYY`: 4-digit Year.
  - `MM`: 2-digit Month.
  - `DD`: 2-digit Day.
  - `##`: Incremental counter (scans directory for the next available integer).
- **logFormat**: 'md', 'json', 'csv', or 'txt' (Default: 'md').
- **Verbosity Levels**:
  - `0`: No logging.
  - `1`: Only Warnings and Errors (Default).
  - `2`: Debugging (Warnings, Errors, and Debug messages).
  - `3`: Everything (Info, Debug, Warnings, Errors, and Logs).
  - *Note*: `consoleVerbosity` and `fileVerbosity` are configured independently.

## Basic Usage
```javascript
import 'dotenv/config';
import fs from 'node:fs';
import { WikiSession, WikiQuery } from '@Technical-13/mw-node-js';

/* 1. Load your configuration */
const config = JSON.parse( fs.readFileSync( './wikiconfig.json', 'utf8' ) );

/* 2. Initialize Session */
const session = new WikiSession( config );

/* 3. Decrypt your password using the static helper and your .env key */
const password = WikiSession.decryptPassword( 
  config.encryptedPassword, 
  config.iv, 
  process.env.WIKI_ENCRYPTION_KEY 
);

/* 4. Modern Login (Recommended for MW 1.43+) */
await session.clientLogin( password );

/* --- Legacy Fallback --- */
/* If your wiki does not support clientlogin, use the legacy method: */
/* await session.login( password ); */

/* 5. Example Query */
const query = new WikiQuery( session );
const data = await query.prop.get( { titles: 'Special:Statistics' } );
```

## Available Modules

- **WikiSession (Auth)**: Handles the connection, authentication, and rate limiting.
  - `clientLogin( password )`: Performs a modern OAuth2-style login (Recommended for MW 1.43+).
  - `login( password )`: **(Legacy)** Performs a standard MediaWiki login. Use only if `clientLogin` is unavailable.
  - `logout()`: Ends the current session and clears cookies.
  - `decryptPassword( data, iv, key )`: (Static) Helper to decrypt credentials for the config.

- **WikiAccount**: Identity and user management.
  - `email( params )`: Sends an email to a wiki user.
  - `get( params )`: Retrieves metadata for specific wiki users.
  - `rights( params )`: Changes user group memberships.
  - `verify( username, token )`: Validates a token on a user's `Discord.json` subpage.

- **WikiEdit**: Content modification.
  - `post( params )`: Submits an edit. Automatically fetches CSRF tokens.

- **WikiLogger**: Infrastructure utility.
  - `error`, `warn`, `debug`, `info`, `log`: Methods to log at specific priority levels.

- **WikiMaintenance**: Admin and moderation suite.
  - `block( params )`: Prevents a user from performing wiki actions.
  - `delete( params )`: Removes a page from the wiki.
  - `move( params )`: Renames pages and talk pages.
  - `patrol( params )`: Marks revisions as patrolled.
  - `protect( params )`: Modifies page protection levels.
  - `revisionDelete( params )`: Masks revisions or logs.
  - `rollback( params )`: Reverts the last edits on a page.
  - `suppress( pageid, revid, reason )`: Wrapper for `revisionDelete` to hide specific content.
  - `undelete( params )`: Restores deleted pages or revisions.

- **WikiMedia**: File asset management.
  - `upload( params )`: Uploads files to the wiki.

- **WikiParser**: Processes wikitext.
  - `parse( params )`: Converts wikitext to HTML or extracts metadata.

- **WikiQuery**: Data retrieval suite.
  - `execute( params, limit )`: Raw API queries with auto-continuation.
  - **.prop**
    - `get( params )`: Fetches properties of specific pages.
  - **.list**
    - `get( params )`: Retrieves lists of data.
  - **.meta**
    - `get( params )`: Fetches site or user metadata.
  - **.generator**
    - `get( params )`: Pipes list results into properties for bulk retrieval.

- **WikiWatchlist**: Personal watchlist management.
  - `watch( params )`: Adds pages to the watchlist.
  - `unwatch( params )`: Removes pages from the watchlist.

## Contributing
Contributions are welcome! Use the templates in the [Issues](https://github.com/Technical-13/mw-node-js/issues) tab.

## Support & Funding
If this library has helped your bot project, consider supporting its development:
- **GitHub Sponsors**: [Technical-13](https://github.com/Technical-13)
- **PayPal**: [MagentaRV](https://paypal.me/MagentaRV)
- **Cash App**: [$MagentaRV](https://cash.app/$MagentaRV)
- **Venmo**: [@MagentaRV](https://venmo.com/u/@MagentaRV)
