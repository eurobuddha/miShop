/**
 * Messaging module for miniMerch
 * Handles encrypted messaging using ChainMail-style protocol
 * @module messaging
 */

/** Fixed address for all messages */
const MINIMERCH_ADDRESS = '0x4D494E494D45524348'; // hex for "MINIMERCH"

/** Token IDs */
const TOKEN_IDS = {
    MINIMA: '0x00'
};

/** @type {string|null} Cached public key */
let cachedPublicKey = null;

/**
 * Generate a random ID
 * @returns {string} Random ID
 */
function generateRandomId() {
    return Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Convert text to hex
 * @param {string} text - Text to convert
 * @returns {string} Hex string
 */
function textToHex(text) {
    let hex = '';
    for (let i = 0; i < text.length; i++) {
        hex += text.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return hex;
}

/**
 * Convert hex to text
 * @param {string} hex - Hex string
 * @returns {string} Text
 */
function hexToText(hex) {
    let text = '';
    for (let i = 0; i < hex.length; i += 2) {
        text += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return text;
}

/**
 * Get Minimerch address
 * @returns {string} Minimerch address
 */
function getMinimerchAddress() {
    return MINIMERCH_ADDRESS;
}

/**
 * Get token IDs
 * @returns {Object} Token IDs
 */
function getTokenIds() {
    return TOKEN_IDS;
}

/**
 * Get my public key from Minima
 * @returns {Promise<string|null>} Public key
 */
async function getMyPublicKey() {
    if (cachedPublicKey) return cachedPublicKey;

    return new Promise((resolve) => {
        MDS.key.get((result) => {
            if (result && result.status && result.response) {
                cachedPublicKey = result.response.publickey;
                resolve(result.response.publickey);
            } else {
                resolve(null);
            }
        });
    });
}

/**
 * Get decoded public key
 * @returns {Promise<Object|null>} Decoded public key
 */
async function getDecodedPublicKey() {
    const pubKey = await getMyPublicKey();
    if (!pubKey) return null;

    return new Promise((resolve) => {
        MDS.key.decode(pubKey, (result) => {
            if (result && result.status && result.response) {
                resolve(result.response);
            } else {
                resolve(null);
            }
        });
    });
}

/**
 * Decode obfuscated API key
 * @param {string} obfuscated - Obfuscated key
 * @param {string} salt - Salt string
 * @returns {string} Decoded key
 */
function decodeObfuscated(obfuscated, salt) {
    if (!obfuscated || !salt) return '';
    let result = '';
    for (let i = 0; i < obfuscated.length; i++) {
        result += String.fromCharCode(obfuscated.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
    }
    return result;
}

/**
 * Generate order reference
 * @returns {string} Order reference
 */
function generateOrderReference() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let ref = '';
    for (let i = 0; i < 8; i++) {
        ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'ORD-' + ref;
}

/**
 * Extract TX ID from response
 * @param {Object} response - MDS response
 * @returns {string|null} Transaction ID
 */
function extractTxid(response) {
    return response?.response?.txpowid
        || response?.response?.txnid
        || response?.response?.body?.txpowid
        || null;
}

/**
 * Get state[99] data from transaction
 * @param {Object|Array} state - State object or array
 * @returns {*} State data
 */
function getState99Data(state) {
    if (!state) return null;
    if (Array.isArray(state)) {
        for (const entry of state) {
            if (entry && entry.port === 99 && entry.data) return entry.data;
        }
        return null;
    }
    if (typeof state === 'object') {
        if (state[99]) return state[99];
    }
    return null;
}

/**
 * Encrypt message for recipient
 * @param {string} message - Message to encrypt
 * @param {string} recipientPublicKey - Recipient's public key
 * @returns {Promise<Object|null>} Encrypted data
 */
async function encryptMessage(message, recipientPublicKey) {
    if (!recipientPublicKey) {
        console.error('encryptMessage: No recipient public key provided');
        return null;
    }

    return new Promise((resolve) => {
        const hexData = textToHex(JSON.stringify(message));

        MDS.encrypt(hexData, recipientPublicKey, (result) => {
            if (result && result.status && result.response) {
                resolve({
                    encrypted: result.response,
                    publicKey: recipientPublicKey
                });
            } else {
                console.error('Encryption failed:', result);
                resolve(null);
            }
        });
    });
}

/**
 * Try to decrypt a message
 * @param {string} encryptedData - Encrypted data
 * @returns {Promise<Object|null>} Decrypted message or null
 */
async function tryDecryptMessage(encryptedData) {
    return new Promise((resolve) => {
        MDS.decrypt(encryptedData, (result) => {
            if (result && result.status && result.response) {
                try {
                    const decrypted = hexToText(result.response);
                    const parsed = JSON.parse(decrypted);
                    resolve(parsed);
                } catch (err) {
                    console.log('Failed to decrypt/parse message');
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    });
}

/**
 * Create encrypted send command
 * @param {Object} data - Data to send
 * @param {string} recipientPublicKey - Recipient's public key
 * @param {Object} amount - Amount object
 * @returns {Promise<Object|null>} Command object
 */
async function createEncryptedSendCommand(data, recipientPublicKey, amount) {
    const encrypted = await encryptMessage(data, recipientPublicKey);
    if (!encrypted) return null;

    return {
        address: MINIMERCH_ADDRESS,
        amount: amount,
        state: [
            { port: 99, data: encrypted.encrypted }
        ]
    };
}

/**
 * Create payment command
 * @param {Object} orderData - Order data
 * @param {string} recipientPublicKey - Vendor's public key
 * @param {number} minimaAmount - Amount in Minima
 * @returns {Promise<Object|null>} Command object
 */
async function createPaymentCommand(orderData, recipientPublicKey, minimaAmount) {
    const message = {
        type: 'ORDER',
        ref: orderData.ref,
        product: orderData.product,
        size: orderData.size,
        amount: orderData.amount,
        currency: orderData.currency,
        delivery: orderData.delivery,
        shipping: orderData.shipping,
        timestamp: Date.now(),
        buyerPublicKey: await getMyPublicKey()
    };

    return createEncryptedSendCommand(message, recipientPublicKey, {
        token: TOKEN_IDS.MINIMA,
        amount: minimaAmount
    });
}
