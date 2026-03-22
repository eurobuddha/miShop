/**
 * Database module for miniMerch
 * Handles SQLite operations via MDS
 * @module db
 */

/**
 * Execute SQL command asynchronously
 * @param {string} command - SQL command
 * @returns {Promise<Object>} Query result
 */
function sqlAsync(command) {
    return new Promise((resolve) => {
        MDS.sql(command, (result) => {
            resolve(result);
        });
    });
}

/**
 * Escape SQL string values
 * @param {*} val - Value to escape
 * @returns {string} Escaped SQL value
 */
function escapeSQL(val) {
    if (val == null) return 'NULL';
    return "'" + String(val).replace(/'/g, "''") + "'";
}

/**
 * Initialize database tables
 * @returns {Promise<boolean>} Success status
 */
async function initDB() {
    try {
        // Create settings table
        await sqlAsync(`CREATE TABLE IF NOT EXISTS settings (
            key VARCHAR(255) PRIMARY KEY,
            value TEXT
        )`);

        // Create messages table with status support
        await sqlAsync(
            `CREATE TABLE IF NOT EXISTS messages (` +
            `id INTEGER PRIMARY KEY AUTO_INCREMENT,` +
            `randomid VARCHAR(255) UNIQUE,` +
            `ref VARCHAR(255),` +
            `type VARCHAR(50),` +
            `product VARCHAR(500),` +
            `size VARCHAR(100),` +
            `amount VARCHAR(50),` +
            `currency VARCHAR(50),` +
            `delivery VARCHAR(500),` +
            `shipping VARCHAR(50),` +
            `message TEXT,` +
            `timestamp BIGINT,` +
            `coinid VARCHAR(255),` +
            `"read" INTEGER DEFAULT 0,` +
            `direction VARCHAR(50) DEFAULT 'received',` +
            `buyerPublicKey TEXT,` +
            `buyerAddress VARCHAR(255),` +
            `status VARCHAR(50) DEFAULT 'PENDING'` +
            `)`
        );

        // Migration: Add status column if not exists
        await sqlAsync(`ALTER TABLE messages ADD COLUMN status VARCHAR(50) DEFAULT 'PENDING'`);

        return true;
    } catch (err) {
        console.error('initDB error:', err);
        return false;
    }
}

/**
 * Save a setting to database
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 * @returns {Promise<boolean>} Success status
 */
async function saveSetting(key, value) {
    try {
        const sql = `INSERT OR REPLACE INTO settings (key, value) VALUES (${escapeSQL(key)}, ${escapeSQL(JSON.stringify(value))})`;
        const result = await sqlAsync(sql);
        return result && result.status;
    } catch (err) {
        console.error('saveSetting error:', err);
        return false;
    }
}

/**
 * Load a setting from database
 * @param {string} key - Setting key
 * @param {*} defaultValue - Default value if not found
 * @returns {Promise<*>} Setting value
 */
async function loadSetting(key, defaultValue) {
    try {
        const result = await sqlAsync(`SELECT value FROM settings WHERE key = ${escapeSQL(key)}`);
        if (result && result.status && result.rows && result.rows.length > 0) {
            return JSON.parse(result.rows[0].value);
        }
        return defaultValue;
    } catch (err) {
        console.error('loadSetting error:', err);
        return defaultValue;
    }
}

/**
 * Save message to database
 * @param {Object} message - Message object
 * @returns {Promise<boolean>} Success status
 */
async function saveMessageToDb(message) {
    try {
        const sql = `INSERT INTO messages ` +
            `(randomid, ref, type, product, size, amount, currency, delivery, shipping, message, ` +
            `timestamp, coinid, "read", direction, buyerPublicKey, buyerAddress, status) ` +
            `VALUES (` +
            `${escapeSQL(message.randomid)}, ` +
            `${escapeSQL(message.ref || '')}, ` +
            `${escapeSQL(message.type || 'ORDER')}, ` +
            `${escapeSQL(message.product || '')}, ` +
            `${escapeSQL(message.size || '')}, ` +
            `${escapeSQL(message.amount || '')}, ` +
            `${escapeSQL(message.currency || '')}, ` +
            `${escapeSQL(message.delivery || '')}, ` +
            `${escapeSQL(message.shipping || '')}, ` +
            `${escapeSQL(message.message || '')}, ` +
            `${message.timestamp || Date.now()}, ` +
            `${escapeSQL(message.coinid || '')}, ` +
            `${message.read ? 1 : 0}, ` +
            `${escapeSQL(message.direction || 'received')}, ` +
            `${escapeSQL(message.buyerPublicKey || '')}, ` +
            `${escapeSQL(message.buyerAddress || '')}, ` +
            `${escapeSQL(message.status || 'PENDING')})`;

        const result = await sqlAsync(sql);
        return result && result.status;
    } catch (err) {
        console.error('saveMessageToDb error:', err);
        return false;
    }
}

/**
 * Load messages from database
 * @returns {Promise<Array>} Array of messages
 */
async function loadMessagesFromDb() {
    try {
        const result = await sqlAsync(`SELECT * FROM messages ORDER BY timestamp DESC`);
        if (result && result.status && result.rows) {
            return result.rows.map(row => ({
                id: row.id,
                randomid: row.randomid,
                ref: row.ref,
                type: row.type,
                product: row.product,
                size: row.size,
                amount: row.amount,
                currency: row.currency,
                delivery: row.delivery,
                shipping: row.shipping,
                message: row.message,
                timestamp: row.timestamp,
                coinid: row.coinid,
                read: row.read === 1,
                direction: row.direction || 'received',
                buyerPublicKey: row.buyerPublicKey,
                buyerAddress: row.buyerAddress,
                status: row.status || 'PENDING'
            }));
        }
        return [];
    } catch (err) {
        console.error('loadMessagesFromDb error:', err);
        return [];
    }
}

/**
 * Update message read status
 * @param {string} randomid - Message ID
 * @param {boolean} read - Read status
 * @returns {Promise<boolean>} Success status
 */
async function updateMessageReadStatus(randomid, read) {
    try {
        const sql = `UPDATE messages SET "read" = ${read ? 1 : 0} WHERE randomid = ${escapeSQL(randomid)}`;
        const result = await sqlAsync(sql);
        return result && result.status;
    } catch (err) {
        console.error('updateMessageReadStatus error:', err);
        return false;
    }
}

/**
 * Check if message exists in database
 * @param {string} randomid - Message ID
 * @returns {Promise<boolean>} Exists status
 */
async function isMessageStored(randomid) {
    try {
        const result = await sqlAsync(`SELECT id FROM messages WHERE randomid = ${escapeSQL(randomid)}`);
        return result && result.status && result.rows && result.rows.length > 0;
    } catch (err) {
        console.error('isMessageStored error:', err);
        return false;
    }
}
