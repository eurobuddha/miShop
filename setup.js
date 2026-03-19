const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONFIG_PATH = path.join(__dirname, 'vendor.config.json');

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
    const obfuscated = combined.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ salt.charCodeAt(i % salt.length))).join('');
    return Buffer.from(obfuscated + salt).toString('base64');
}

function saveConfig(obfuscatedAddress, salt, obfuscatedApiKey, vendorPublicKey) {
    const config = {
        obfuscated: obfuscatedAddress,
        salt: salt,
        obfuscatedApiKey: obfuscatedApiKey,
        vendorPublicKey: vendorPublicKey,
        created: new Date().toISOString()
    };
    
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log(`\n✓ Vendor config saved to vendor.config.json`);
}

function loadConfig() {
    if (fs.existsSync(CONFIG_PATH)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        return config;
    }
    return null;
}

// CLI Mode
if (require.main === module) {
    const address = process.argv[2];
    const apiKey = process.argv[3];
    const publicKey = process.argv[4];
    
    if (!address || !apiKey || !publicKey) {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║           miShop Generator - Setup                   ║
╠═══════════════════════════════════════════════════════════╣
║  This script configures your vendor settings:            ║
║  - Payment address for Minima transactions               ║
║  - CoinMarketCap API key for price fetching              ║
║  - ChainMail public key for encrypted messages          ║
║  Values are obfuscated to prevent tampering by users.   ║
╚═══════════════════════════════════════════════════════════╝

Usage: node setup.js <minima-address> <cmc-api-key> <chainmail-public-key>

Example: node setup.js 0x465CA86A9B5756F45DEB667A69B3DBEC1B82B211814B294ED32693603F28AD37 c1d37f5f89564ca5868d21e2303c281b MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282G60G19TUFFWSB6EEF0619DH9A069ECNU1TNEFRBHKTE8DU5T9740QUW30BH9F45YSZUM5SSVUHU36WFGSWDZS6CZYGB4AJG83VQPUF42R6S11Z9R70MUQCJRG202YQK7Z4FS904R7V4W8ZBHK7D5STVHK1GYSV54HJSBRE1MUTHNHCCGV9BUWE2FZBEND91D421Z6V2Z7BRGMTECVC10608006P3DB2S
`);
        process.exit(1);
    }
    
    // Validate address format
    if (!address.match(/^0x[a-fA-F0-9]{64}$/)) {
        console.error('❌ Invalid Minima address format. Address must start with 0x and be 66 characters.');
        process.exit(1);
    }
    
    // Validate public key format
    if (!publicKey || !publicKey.startsWith('Mx')) {
        console.error('❌ Invalid ChainMail public key format. Key must start with "Mx".');
        console.error('   Get your public key from the ChainMail MiniDapp.');
        process.exit(1);
    }
    
    // Check if config already exists
    const existingConfig = loadConfig();
    if (existingConfig) {
        console.log('⚠️  Vendor config already exists.');
        console.log('   To change settings, delete vendor.config.json and run setup again.');
        console.log(`   Created: ${existingConfig.created}`);
        process.exit(1);
    }
    
    // Generate salt and obfuscate
    const salt = generateSalt();
    const obfuscated = obfuscateAddress(address, salt);
    const obfuscatedApiKey = obfuscateApiKey(apiKey, salt);
    
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║           miShop Generator - Setup                   ║
╚═══════════════════════════════════════════════════════════╝

🔐 Generating obfuscated config...

Address:    ${address.substring(0, 10)}...${address.substring(address.length - 8)}
CMC Key:    ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}
Public Key: ${publicKey.substring(0, 12)}...${publicKey.substring(publicKey.length - 8)}
`);
    
    saveConfig(obfuscated, salt, obfuscatedApiKey, publicKey);
    
    console.log(`
✅ Setup complete!

Next steps:
1. Run 'npm install' to install dependencies
2. Run 'node generator.js --help' to see usage

You're ready to generate MiniDapps! 🌿
`);
}

module.exports = {
    obfuscateAddress,
    obfuscateApiKey,
    generateSalt,
    loadConfig
};
