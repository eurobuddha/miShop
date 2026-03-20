const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const CONFIG_DIR = path.join(os.homedir(), '.mini-merch');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

function getConfigPath() {
    return CONFIG_PATH;
}

function ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
}

function generateSalt() {
    return crypto.randomBytes(32).toString('hex');
}

function obfuscateAddress(address, salt) {
    const encoded = Buffer.from(JSON.stringify({
        address: address,
        salt: salt
    })).toString('base64');
    return encoded;
}

function obfuscateApiKey(apiKey, salt) {
    const combined = apiKey + ',' + salt;
    const obfuscated = combined.split('').map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ salt.charCodeAt(i % salt.length))
    ).join('');
    return Buffer.from(obfuscated + salt).toString('base64');
}

function saveConfig(obfuscatedAddress, salt, obfuscatedApiKey, vendorPublicKey, inboxPublicKey) {
    ensureConfigDir();
    const config = {
        obfuscated: obfuscatedAddress,
        salt: salt,
        obfuscatedApiKey: obfuscatedApiKey,
        vendorPublicKey: vendorPublicKey,
        inboxPublicKey: inboxPublicKey || '',
        created: new Date().toISOString()
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function loadConfig() {
    if (fs.existsSync(CONFIG_PATH)) {
        try {
            return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        } catch (e) {
            return null;
        }
    }
    return null;
}

function deleteConfig() {
    if (fs.existsSync(CONFIG_PATH)) {
        fs.unlinkSync(CONFIG_PATH);
    }
}

function validateAddress(address) {
    if (!address || !address.match(/^0x[a-fA-F0-9]{64}$/)) {
        return { valid: false, error: 'Invalid Minima address format. Address must start with 0x and be 66 characters.' };
    }
    return { valid: true };
}

function validatePublicKey(publicKey, fieldName) {
    if (!publicKey || !publicKey.startsWith('Mx')) {
        return { valid: false, error: `Invalid ${fieldName} format. Key must start with "Mx".` };
    }
    return { valid: true };
}

function maskString(str, showStart, showEnd) {
    if (!str) return '';
    const start = str.substring(0, showStart);
    const end = str.substring(str.length - showEnd);
    return `${start}...${end}`;
}

module.exports = {
    generateSalt,
    obfuscateAddress,
    obfuscateApiKey,
    saveConfig,
    loadConfig,
    deleteConfig,
    validateAddress,
    validatePublicKey,
    maskString,
    getConfigPath,
    CONFIG_DIR,
    CONFIG_PATH
};
