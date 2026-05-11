# mw-node-js (v1.0.1)
A modular Node.js 22+ library for MediaWiki 1.43+ with encrypted auth, rate limiting, and markdown logging.

## Package Metadata
- **Current Version**: 1.0.1
- **Last Updated**: 2026-05-11T10:00:00Z
- **Tracking**: Check `package.json` for the `lastUpdated` key.

## Features
- **Encrypted Auth**: Securely handle wiki credentials using AES-256-CBC.
- **Rate Limiting**: Built-in `minDelay` queue and native `fetch` handling to prevent API throttling.
- **Continuation**: `WikiQuery.execute()` handles recursion logic for large API queries automatically.
- **Flexible Logging**: Daily or incremental logs in Markdown, JSON, CSV, or Plain Text with collision-proof `|TAG|` placeholders.
- **Modular Design**: Separated concerns for Authentication, Maintenance, Moderation, and specialized Queries.

## Configuration

Setting up your bot requires two files: a private environment file and a public configuration file.

### Step 1: Create a `.env` file
In your project root, create a file named `.env`. This file stores your "private keys" and should **never** be shared or uploaded to GitHub.
```text
WIKI_ENCRYPTION_KEY=your_64_character_hex_key_here
WIKI_ENCRYPTION_SEED=your_32_character_hex_seed_here
```

### Step 2: Create a `wikiconfig.json` file
Create a file named `wikiconfig.json` to store your non-sensitive bot settings.

**Note on encryptedPassword**: You must encrypt your wiki password before putting it here.
1. Navigate to the `/tools` folder in this repository.
2. Open your terminal (**PowerShell**, **Command Prompt** (*cmd.exe*), or **Bash**) and run the encryptor using your **Key** and **Seed** from Step 1:
   ```bash
   java -jar WikiEncryptor.jar <your_key> <your_seed> "your_actual_password"
   ```
   - *Note: You must have the **Java Runtime Environment (JRE)** installed to run the encryptor.*
     - *If you do not have it, you can download it from [Java.com](https://java.com).*
3. Copy the resulting Hex string into the field below:

```json
{
  "apiUrl": "https://your-wiki.com",
  "username": "YourBotName",
  "encryptedPassword": "ENCRYPTED_HEX_RESULT",
  "userAgent": "MyWikiBot/1.0.0",
  "minDelay": 1000,
  "logDir": "./logs",
  "logName": "Wiki-|YYYY||MM||DD|",
  "logFormat": "md",
  "consoleVerbosity": 1,
  "fileVerbosity": 3
}
```

#### Detailed Variable Guide:
- **apiUrl**: The full URL to your wiki's `api.php`.
- **minDelay**: The "speed limit" in milliseconds between requests (1000 = 1 second). Use this to avoid tripping anti-spam triggers or being throttled by the server.
- **logName**: The template for your log files. The logger **appends** to the same file until the placeholders result in a new filename.
  - `|YYYY|`: Replaced with the current 4-digit Year.
  - `|MM|`: Replaced with the current 2-digit Month.
  - `|DD|`: Replaced with the current 2-digit Day.
  - `|##|`: An auto-incrementing number. Use this if you want to start a fresh log file manually or if you need multiple logs for the same day.
- **Verbosity Levels**:
  - `0`: Silent. No logs will be produced.
  - `1`: Warn/Error. Only logs system failures or warnings. Recommended for stable production bots.
  - `2`: Debug. Includes warning, errors, and granular debugging messages to trace logic.
  - `3`: Firehose. Logs everything including informational messages and raw API interactions.

### Step 3: Initialization
When you start your bot, you must "inject" the private keys from your `.env` into the configuration.
```javascript
import 'dotenv/config';
import fs from 'node:fs';
import { WikiSession } from '@Technical-13/mw-node-js';

const config = JSON.parse( fs.readFileSync( './wikiconfig.json', 'utf8' ) );
config.key = process.env.WIKI_ENCRYPTION_KEY;
config.seed = process.env.WIKI_ENCRYPTION_SEED;

const session = new WikiSession( config );

/* Perform a page write to the bot's userspace */
await session.edit.write( { 
  title: 'User:' + config.username + '/Sandbox', 
  text: config.userAgent + ' (Node ' + process.version + ') testing ~~~~', 
  summary: 'mw-node-js bot testing for ' + config.username + '.' 
} );
```

## Available Modules

### **Note on `params`**:
- Every method that accepts a `params` object is designed to pass those key-value pairs directly to your wiki's API.
  - For a full list of supported parameters for any action, visit your wiki's `api.php?action=help`.

- **`WikiSession` (The Hub)**
  - `_get( params )`: Internal wrapper for GET requests.
  - `_post( params )`: Internal wrapper for POST requests.
  - `decryptPassword( data, seed, key )`: (Static) Helper for secure credential handling.

- **`WikiAccount`**
  - `email( params )`: Sends internal wiki emails to other users.
  - `get( params )`: Retrieves a list of user metadata and account information.
  - `verify( user, pageid, revid, reason )`: Performs an automated user verification workflow, including rights assignment and content suppression.

- **`WikiAuth`**
  - `changeauthenticationdata( params )`: Updates existing AuthManager credentials (like passwords).
  - `clientlogin( params )`: The modern MediaWiki 1.43+ login flow.
  - `login( params )`: **(Legacy)** Standard MediaWiki login. Use only if `clientlogin` is unavailable.
  - `logout()`: Ends the current session and clears internal cookies.
  - `removeauthenticationdata( params )`: Detaches specific authentication methods from the account.
  - `resetpassword( params )`: Triggers or completes the password reset process.

- **`WikiEdit`**
  - `changecontentmodel( params )`: Changes how a page's content is interpreted (e.g., Wikitext to JSON).
  - `mergehistory( params )`: Combines the revision histories of two different pages.
  - `spamblacklist( params )`: Validates URLs against the wiki's spam filter.
  - `titleblacklist( params )`: Validates page titles against the title blacklist filter.
  - `upload( params )`: Handles asset and file uploads to the wiki.
  - `write( params )`: The primary tool for creating and modifying pages (aligns with `api.php?action=edit`).

- **`WikiMaintenance`**
  - `compare( params )`: Generates a comparison (diff) between two revisions or pages.
  - `delete( params )`: Permanently removes a page from the wiki.
  - `managetags( params )`: Utility to create, delete, or modify change tags.
  - `move( params )`: Renames pages and their associated talk pages.
  - `patrol( params )`: Marks specific revisions as patrolled.
  - `protect( params )`: Modifies the protection level of a page.
  - `purge( params )`: Manually clears the server-side cache for specific pages.
  - `revisiondelete( params )`: Masks specific revisions or log entries from public view.
  - `rollback( params )`: Rapidly reverts the last set of edits by a user on a page.
  - `suppress( pageid, revid, reason )`: Privacy-focused wrapper for `revisiondelete`.
  - `tag( params )`: Adds or removes change tags from specific revisions.
  - `undelete( params )`: Restores previously deleted pages or specific revisions.

- **`WikiModeration`**
  - `block( params )`: Blocks a user from performing edits or other actions.
  - `unblock( params )`: Removes an existing block from a user.
  - `userrights( params )`: Manages user group memberships and permissions.

- **`WikiParser`**
  - `expandtemplates( params )`: Resolves templates, variables, and parser functions without rendering full HTML.
  - `parse( params )`: Converts raw wikitext into HTML or extracts page metadata.

- **`WikiQuery`**
  - `execute( params, limit )`: "Smart" query with automatic continuation.
  - Sub-modules: 
    - `generator( type, params )`: Pipes list results into properties. Accepts array for `type`.
    - `list( type, params )`: Retrieves sequences of data. Accepts array for `type`.
    - `meta( type, params )`: Fetches site/user metadata. Accepts array for `type`.
    - `prop( type, params )`: Fetches page properties. Accepts array for `type`.

## Contributing
Contributions are welcome!
- To submit a bug report/feature request, use the [Issues](../../issues/new/choose) templates; or,
- See our [Contributing Guidelines](CONTRIBUTING.md) for details on our coding standards and how to submit a Pull Request.

## Support & Funding
If this library has helped your bot project, consider supporting its development:
- **GitHub Sponsors**: [Technical-13](https://github.com/sponsors/Technical-13)
- **PayPal**: [MagentaRV](https://paypal.me/MagentaRV)
- **Cash App**: [$MagentaRV](https://cash.app/$MagentaRV)
- **Venmo**: [@MagentaRV](https://venmo.com/u/MagentaRV)
