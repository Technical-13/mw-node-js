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
- **Markdown Logging**: Daily log files in Markdown, JSON, CSV, or Plain Text with independent verbosity controls.

## Basic Usage
```javascript
import { WikiSession, WikiQuery } from '@Technical-13/mw-node-js';

const session = new WikiSession( config );
await session.login( decryptedPassword );

const query = new WikiQuery( session );
const data = await query.prop.get( { titles: 'Special:Statistics' } );
```

## Available Modules

- **WikiSession (Auth)**: Handles the connection, authentication, and rate limiting.
  - `login( password )`: Performs a standard MediaWiki login.
  - `clientLogin( password )`: Performs a modern OAuth2-style login (recommended for MW 1.43+).
  - `logout( )`: Ends the current session and clears cookies.
  - `decryptPassword( data, iv, key )`: (Static) Helper to decrypt credentials for the config.

- **WikiAccount**: Identity and user management.
  - `email( params )`: Sends an email to a wiki user (requires CSRF token).
  - `get( params )`: Retrieves metadata for specific wiki users.
  - `rights( params )`: Changes user group memberships (requires `userrights` token).
  - `verify( username, token )`: Validates a token on a user's `Discord.json` subpage.

- **WikiEdit**: Content modification.
  - `post( params )`: Submits an edit. Automatically fetches CSRF tokens.

- **WikiLogger**: Infrastructure utility.
  - `error`, `warn`, `debug`, `info`, `log`: Methods to log at specific priority levels.
  - **Verbosity Levels**: 0 (None), 1 (Warn/Error), 2 (Debug), 3 (Everything).
  - **Independent Control**: Configure `consoleVerbosity` vs `fileVerbosity` separately.
  - **Formats**: Supports 'md', 'json', 'csv', and 'txt'.

- **WikiMaintenance**: Admin and moderation suite.
  - `block( params )`: Prevents a user from performing wiki actions.
  - `delete( params )`: Removes a page from the wiki.
  - `move( params )`: Renames pages and talk pages.
  - `patrol( params )`: Marks revisions as patrolled (requires `patrol` token).
  - `protect( params )`: Changes page protection levels.
  - `revisionDelete( params )`: Masks revisions or logs. Falls back to deletion if suppression fails.
  - `rollback( params )`: Reverts the last edits on a page (requires `rollback` token).
  - `suppress( pageid, revid, reason )`: Wrapper for `revisionDelete` to hide specific content.
  - `undelete( params )`: Restores deleted pages or revisions.

- **WikiMedia**: File asset management.
  - `upload( params )`: Uploads files to the wiki. Handles CSRF tokens.

- **WikiParser**: Processes wikitext.
  - `parse( params )`: Converts wikitext to HTML or extracts metadata.

- **WikiQuery**: Data retrieval suite.
  - `execute( params, limit )`: Raw API queries with auto-continuation until `limit` (default 10) or 'max'.
  - **.prop**
    - `get( params )`: Fetches properties of specific pages (e.g., revisions, categories).
  - **.list**
    - `get( params )`: Retrieves lists of data (e.g., search, categorymembers, users).
  - **.meta**
    - `get( params )`: Fetches site or user metadata (e.g., siteinfo, userinfo).
  - **.generator**
    - `get( params )`: Pipes list results into properties for bulk data retrieval.

- **WikiWatchlist**: Personal watchlist management.
  - `watch( params )`: Adds pages to the watchlist (requires `watch` token).
  - `unwatch( params )`: Removes pages from the watchlist.

## Contributing
Contributions are welcome! If you've found a bug or have a feature request, please use the templates found in the [Issues](https://github.com) tab:
- **Bug Reports**: Provide your Node.js version and relevant `logs/*.md` snippets.
- **Feature Requests**: Describe the problem and your proposed solution.

## Support & Funding
If this library has helped your bot project, consider supporting its development:
- **GitHub Sponsors**: [Technical-13](https://github.com/Technical-13)
- **PayPal**: [MagentaRV](https://paypal.me/MagentaRV)
- **Cash App**: [$MagentaRV](https://cash.app/$MagentaRV)
- **Venmo**: [@MagentaRV](https://venmo.com/@MagentaRV)
