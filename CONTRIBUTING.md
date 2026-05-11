# Contributing to mw-node-js

Thank you for your interest in improving this library! To maintain our high standards for clarity and organization, please follow these technical rules when submitting code.

## 🛠 Technical Standards

### 1. File and Class Naming
- **Filenames**: All files must be **lowercase** (e.g., `wikisession.js`, `wikiquery.js`).
- **Classes/Functions**: Exported classes and functions must use **CamelCase** (e.g., `WikiSession`, `WikiQuery`).

### 2. Method Organization
- **Alphabetical Order**: All methods within a class must be sorted **alphabetically** (A-Z).
- **Private Members**: Internal methods intended for private use must start with an underscore (`_`) and be placed at the **top** of the class.

### 3. Logic and Formatting
- **Indentation**: Use **2-space** indentation throughout.
- **Strings**: Use **single-quotes** (`'`) for all strings.
- **No Template Literals**: Do **not** use backticks (`` ` ``). Use the `+` operator for string concatenation.
- **Internal Whitespace**: Include spaces inside all containers that hold data:
  - `( params )`, `[ 'value' ]` and `{ key: 'value' }`
  - Empty containers should not have spaces: `()`, `[]`, or `{}`.
- **Grouping Structures**:
  - Grouping blocks should be collapsed if there's only a short single command contained
  - "Following statements" must start on a **new line** immediately following the closing brace of the preceding block.
  - *Example:*
    ```javascript
    try {
      // logic
    }
    catch ( e ) { this.session.logger.error( 'WikiSession.module.method(...) failure: ' + e.message ); }
    ```
- **JSDoc Headers**: Every class and method must have a JSDoc header immediately preceding it.
  - Use `/** ... */` block syntax.
  - **Description**: A concise summary of the function's purpose.
  - **@param**: Include the type and a short description for every argument.
  - **@returns**: Specify the return type and what it represents.
  - **@example**: Provide at least one practical code example for public methods.

### 4. Logging Standards
All success and failure messages must use the explicit **`WikiSession.module.method(...)`** prefix to provide clear tracking in the logs.
- *Example*: `WikiSession.auth.login( ... ) failure: [Error Message]`

## 🚀 How to Help
If you have a bug fix or feature, please open an [Issue](/../../issues) first to discuss it. When ready, submit a Pull Request following the guidelines above.
