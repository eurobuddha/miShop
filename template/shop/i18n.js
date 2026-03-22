/**
 * Internationalization module for miniMerch
 * Supports English, Spanish, French
 * @module i18n
 */

/** Current locale */
let currentLocale = 'en';

/** Available locales */
const SUPPORTED_LOCALES = ['en', 'es', 'fr'];

/** Translation dictionary */
const translations = {
    en: {
        // Product
        'product.selectSize': 'Select Size',
        'product.sizeGuide': 'Size Guide',
        'product.addToCart': 'Add to Cart',
        'product.outOfStock': 'Out of Stock',
        'product.inStock': 'In Stock',

        // Cart
        'cart.title': 'Shopping Cart',
        'cart.empty': 'Your cart is empty',
        'cart.subtotal': 'Subtotal',
        'cart.shipping': 'Shipping',
        'cart.total': 'Total',
        'cart.checkout': 'Checkout',
        'cart.continueShopping': 'Continue Shopping',
        'cart.remove': 'Remove',
        'cart.quantity': 'Quantity',

        // Shipping
        'shipping.uk': 'UK Delivery (£5)',
        'shipping.eu': 'EU Delivery (£8)',
        'shipping.world': 'Worldwide Delivery (£12)',

        // Checkout
        'checkout.title': 'Checkout',
        'checkout.email': 'Email Address',
        'checkout.deliveryAddress': 'Delivery Address',
        'checkout.paymentMethod': 'Payment Method',
        'checkout.payWithMinima': 'Pay with Minima',
        'checkout.processing': 'Processing...',
        'checkout.success': 'Order Placed!',
        'checkout.error': 'Payment Failed',

        // Price
        'price.minimaAmount': 'Minima Amount',
        'price.usdAmount': 'USD Amount',
        'price.calculating': 'Calculating...',

        // Status
        'status.pending': 'Pending',
        'status.paid': 'Paid',
        'status.confirmed': 'Confirmed',
        'status.shipped': 'Shipped',
        'status.delivered': 'Delivered',

        // General
        'general.loading': 'Loading...',
        'general.error': 'Error',
        'general.retry': 'Retry',
        'general.close': 'Close',
        'general.confirm': 'Confirm',
        'general.cancel': 'Cancel'
    },

    es: {
        // Product
        'product.selectSize': 'Seleccionar Talla',
        'product.sizeGuide': 'Guía de Tallas',
        'product.addToCart': 'Añadir al Carrito',
        'product.outOfStock': 'Agotado',
        'product.inStock': 'En Stock',

        // Cart
        'cart.title': 'Carrito de Compras',
        'cart.empty': 'Tu carrito está vacío',
        'cart.subtotal': 'Subtotal',
        'cart.shipping': 'Envío',
        'cart.total': 'Total',
        'cart.checkout': 'Pagar',
        'cart.continueShopping': 'Seguir Comprando',
        'cart.remove': 'Eliminar',
        'cart.quantity': 'Cantidad',

        // Shipping
        'shipping.uk': 'Entrega UK (£5)',
        'shipping.eu': 'Entrega EU (£8)',
        'shipping.world': 'Entrega Mundial (£12)',

        // Checkout
        'checkout.title': 'Pago',
        'checkout.email': 'Correo Electrónico',
        'checkout.deliveryAddress': 'Dirección de Entrega',
        'checkout.paymentMethod': 'Método de Pago',
        'checkout.payWithMinima': 'Pagar con Minima',
        'checkout.processing': 'Procesando...',
        'checkout.success': '¡Pedido Realizado!',
        'checkout.error': 'Pago Fallido',

        // Price
        'price.minimaAmount': 'Cantidad en Minima',
        'price.usdAmount': 'Cantidad en USD',
        'price.calculating': 'Calculando...',

        // Status
        'status.pending': 'Pendiente',
        'status.paid': 'Pagado',
        'status.confirmed': 'Confirmado',
        'status.shipped': 'Enviado',
        'status.delivered': 'Entregado',

        // General
        'general.loading': 'Cargando...',
        'general.error': 'Error',
        'general.retry': 'Reintentar',
        'general.close': 'Cerrar',
        'general.confirm': 'Confirmar',
        'general.cancel': 'Cancelar'
    },

    fr: {
        // Product
        'product.selectSize': 'Sélectionner la Taille',
        'product.sizeGuide': 'Guide des Tailles',
        'product.addToCart': 'Ajouter au Panier',
        'product.outOfStock': 'Rupture de Stock',
        'product.inStock': 'En Stock',

        // Cart
        'cart.title': 'Panier',
        'cart.empty': 'Votre panier est vide',
        'cart.subtotal': 'Sous-total',
        'cart.shipping': 'Livraison',
        'cart.total': 'Total',
        'cart.checkout': 'Commander',
        'cart.continueShopping': 'Continuer les Achats',
        'cart.remove': 'Supprimer',
        'cart.quantity': 'Quantité',

        // Shipping
        'shipping.uk': 'Livraison UK (£5)',
        'shipping.eu': 'Livraison EU (£8)',
        'shipping.world': 'Livraison Mondiale (£12)',

        // Checkout
        'checkout.title': 'Paiement',
        'checkout.email': 'Adresse Email',
        'checkout.deliveryAddress': 'Adresse de Livraison',
        'checkout.paymentMethod': 'Mode de Paiement',
        'checkout.payWithMinima': 'Payer avec Minima',
        'checkout.processing': 'Traitement...',
        'checkout.success': 'Commande Passée !',
        'checkout.error': 'Paiement Échoué',

        // Price
        'price.minimaAmount': 'Montant en Minima',
        'price.usdAmount': 'Montant en USD',
        'price.calculating': 'Calcul...',

        // Status
        'status.pending': 'En Attente',
        'status.paid': 'Payé',
        'status.confirmed': 'Confirmé',
        'status.shipped': 'Expédié',
        'status.delivered': 'Livré',

        // General
        'general.loading': 'Chargement...',
        'general.error': 'Erreur',
        'general.retry': 'Réessayer',
        'general.close': 'Fermer',
        'general.confirm': 'Confirmer',
        'general.cancel': 'Annuler'
    }
};

/**
 * Initialize i18n and load saved locale
 * @returns {Promise<void>}
 */
async function initI18n() {
    try {
        if (typeof loadSetting === 'function') {
            const savedLocale = await loadSetting('locale', null);
            if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
                currentLocale = savedLocale;
            }
        }
    } catch (err) {
        console.error('initI18n error:', err);
    }
}

/**
 * Get current locale
 * @returns {string} Current locale code
 */
function getLocale() {
    return currentLocale;
}

/**
 * Set locale and save to settings
 * @param {string} locale - Locale code (en, es, fr)
 * @returns {Promise<boolean>} Success status
 */
async function setLocale(locale) {
    if (!SUPPORTED_LOCALES.includes(locale)) {
        console.warn('Unsupported locale:', locale);
        return false;
    }

    currentLocale = locale;

    try {
        if (typeof saveSetting === 'function') {
            await saveSetting('locale', locale);
        }
        return true;
    } catch (err) {
        console.error('setLocale error:', err);
        return false;
    }
}

/**
 * Translate a key with optional parameter interpolation
 * @param {string} key - Translation key
 * @param {Object} params - Parameters for interpolation
 * @returns {string} Translated text
 */
function t(key, params = {}) {
    const localeData = translations[currentLocale] || translations.en;
    let text = localeData[key] || translations.en[key] || key;

    // Simple parameter interpolation: {paramName}
    Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });

    return text;
}

/**
 * Get supported locales
 * @returns {Array<string>} List of supported locale codes
 */
function getSupportedLocales() {
    return [...SUPPORTED_LOCALES];
}

/**
 * Get locale display name
 * @param {string} locale - Locale code
 * @returns {string} Display name
 */
function getLocaleDisplayName(locale) {
    const names = {
        en: 'English',
        es: 'Español',
        fr: 'Français'
    };
    return names[locale] || locale;
}

/**
 * Format currency based on locale
 * @param {number} amount - Amount
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
function formatCurrency(amount, currency = 'USD') {
    try {
        return new Intl.NumberFormat(currentLocale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    } catch (err) {
        return `$${amount.toFixed(2)}`;
    }
}

/**
 * Format date based on locale
 * @param {Date|number} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    try {
        return new Intl.DateTimeFormat(currentLocale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(d);
    } catch (err) {
        return d.toLocaleDateString();
    }
}

/**
 * Format number based on locale
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    try {
        return new Intl.NumberFormat(currentLocale).format(num);
    } catch (err) {
        return num.toString();
    }
}
