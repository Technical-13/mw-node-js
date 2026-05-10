import crypto from 'node:crypto';

export class WikiSession {
    constructor(config) {
        this.apiUrl = config.entrypoint;
        this.username = config.username;
        this.password = null;
        this.cookieJar = '';
        this.keepAliveInterval = null;
    }

    /**
     * Decrypts the password using a key from .env
     */
    static decryptPassword(encryptedData, ivHex, keyHex) {
        const key = Buffer.from(keyHex, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    /**
     * Unified Login for Bot Passwords and Main Accounts
     */
    async login(password) {
        this.password = password;
        const success = await this._performLogin();
        
        if (success) {
            this._startKeepAlive();
        }
        return success;
    }

    async _performLogin() {
        try {
            // Step 1: Request a login token
            const tokenRes = await this._post({ 
                action: 'query', 
                meta: 'tokens', 
                type: 'login' 
            });
            const lgtoken = tokenRes.query.tokens.logintoken;

            // Step 2: Submit to action=login
            const loginRes = await this._post({
                action: 'login',
                lgname: this.username,
                lgpassword: this.password,
                lgtoken
            });

            return loginRes.login.result === 'Success';
        } catch (error) {
            console.error('[Wiki] Login request failed:', error.message);
            return false;
        }
    }

    /**
     * Pings the wiki every 15 minutes to prevent session timeout
     */
    _startKeepAlive() {
        if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
        
        this.keepAliveInterval = setInterval(async () => {
            try {
                const res = await this._post({ action: 'query', meta: 'userinfo' });
                
                // If User ID is 0, session is dead; re-authenticate
                if (res.query.userinfo.id === 0) {
                    console.log('[Wiki] Session expired. Re-authenticating...');
                    await this._performLogin();
                }
            } catch (err) {
                console.error('[Wiki] Keep-alive failed:', err.message);
            }
        }, 15 * 60 * 1000);
    }

    /**
     * Internal helper to handle fetch and cookie persistence
     */
    async _post(params) {
        const body = new URLSearchParams({ ...params, format: 'json', formatversion: '2' });
        const res = await fetch(this.apiUrl, {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': this.cookieJar,
                'User-Agent': 'MW-Discord-Bot/1.43'
            }
        });

        // Capture and store cookies
        const cookies = res.headers.get('set-cookie');
        if (cookies) {
            this.cookieJar = cookies.split(',').map(c => c.split(';')).join('; ');
        }

        return await res.json();
    }
}
