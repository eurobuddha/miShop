/**
 * Price module for miniMerch
 * Handles Minima price fetching with caching
 * @module price
 */

/** Cache TTL in milliseconds (5 minutes) */
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Price cache storage */
let priceCache = {
    price: null,
    timestamp: null,
    source: null
};

/**
 * Get cached price if still valid
 * @returns {number|null} Cached price or null if expired
 */
function getCachedPrice() {
    if (!priceCache.price || !priceCache.timestamp) {
        return null;
    }
    const age = Date.now() - priceCache.timestamp;
    if (age > CACHE_TTL_MS) {
        return null;
    }
    return priceCache.price;
}

/**
 * Fetch Minima price from multiple sources
 * Order: CoinGecko → CoinMarketCap → Database → Default
 * @param {boolean} forceRefresh - Skip cache and fetch fresh price
 * @returns {Promise<number>} Minima price in USD
 */
async function fetchMXPrice(forceRefresh = false) {
    // Check cache first
    if (!forceRefresh) {
        const cached = getCachedPrice();
        if (cached) {
            console.log('Using cached price:', cached);
            return cached;
        }
    }

    // Try CoinGecko first (no API key needed)
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=minima&vs_currencies=usd', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.minima && data.minima.usd) {
                priceCache = {
                    price: data.minima.usd,
                    timestamp: Date.now(),
                    source: 'coingecko'
                };
                console.log('Price from CoinGecko:', data.minima.usd);
                return data.minima.usd;
            }
        }
    } catch (err) {
        console.log('CoinGecko fetch failed:', err.message);
    }

    // Try CoinMarketCap as fallback (requires API key in production)
    try {
        if (typeof OBFUSCATED_CMC_KEY !== 'undefined' && OBFUSCATED_CMC_KEY) {
            const cmcKey = decodeObfuscated(OBFUSCATED_CMC_KEY, CMC_KEY_SALT);
            const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=MINIMA', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-CMC_PRO_API_KEY': cmcKey
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.MINIMA && data.data.MINIMA.quote && data.data.MINIMA.quote.USD) {
                    priceCache = {
                        price: data.data.MINIMA.quote.USD.price,
                        timestamp: Date.now(),
                        source: 'coinmarketcap'
                    };
                    console.log('Price from CoinMarketCap:', data.data.MINIMA.quote.USD.price);
                    return data.data.MINIMA.quote.USD.price;
                }
            }
        }
    } catch (err) {
        console.log('CoinMarketCap fetch failed:', err.message);
    }

    // Try to get from database (if vendor has saved a manual price)
    try {
        if (typeof loadSetting === 'function') {
            const manualPrice = await loadSetting('manualPrice', null);
            if (manualPrice) {
                priceCache = {
                    price: manualPrice,
                    timestamp: Date.now(),
                    source: 'database'
                };
                console.log('Price from database:', manualPrice);
                return manualPrice;
            }
        }
    } catch (err) {
        console.log('Database price fetch failed:', err.message);
    }

    // Fallback to default
    priceCache = {
        price: DEFAULT_MINIMA_PRICE || 0.01,
        timestamp: Date.now(),
        source: 'default'
    };
    console.log('Using default price:', DEFAULT_MINIMA_PRICE || 0.01);
    return DEFAULT_MINIMA_PRICE || 0.01;
}

/**
 * Calculate Minima amount from USD
 * @param {number} usdAmount - Amount in USD
 * @param {number} minimaPrice - Minima price in USD (optional)
 * @returns {number} Amount in Minima
 */
function calculateMinimaAmount(usdAmount, minimaPrice) {
    const price = minimaPrice || priceCache.price || DEFAULT_MINIMA_PRICE || 0.01;
    const slippage = typeof SLIPPAGE_RATE !== 'undefined' ? SLIPPAGE_RATE : 0.05;
    const minimaAmount = usdAmount / price;
    return minimaAmount * (1 + slippage);
}

/**
 * Format Minima amount for display
 * @param {number} amount - Amount in Minima
 * @returns {string} Formatted amount
 */
function formatMinimaAmount(amount) {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(2) + 'M';
    }
    if (amount >= 1000) {
        return (amount / 1000).toFixed(2) + 'K';
    }
    return amount.toFixed(2);
}

/**
 * Clear price cache
 */
function clearPriceCache() {
    priceCache = {
        price: null,
        timestamp: null,
        source: null
    };
}

/**
 * Get cache info for debugging
 * @returns {Object} Cache information
 */
function getCacheInfo() {
    return {
        ...priceCache,
        age: priceCache.timestamp ? Date.now() - priceCache.timestamp : null,
        valid: !!getCachedPrice()
    };
}
