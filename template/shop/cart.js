/**
 * Cart module for miniMerch
 * Manages shopping cart state and operations
 * @module cart
 */

/** @type {Array<Object>} */
let cart = [];

/** @type {string|null} */
let selectedShipping = 'uk';

/**
 * Get current cart
 * @returns {Array<Object>} Cart items
 */
function getCart() {
    return cart;
}

/**
 * Set cart (for initialization)
 * @param {Array<Object>} newCart - New cart array
 */
function setCart(newCart) {
    cart = newCart || [];
}

/**
 * Get selected shipping option
 * @returns {string} Shipping option ('uk', 'eu', or 'world')
 */
function getSelectedShipping() {
    return selectedShipping || 'uk';
}

/**
 * Set selected shipping option
 * @param {string} option - Shipping option
 */
function setSelectedShipping(option) {
    selectedShipping = option || 'uk';
}

/**
 * Calculate subtotal of cart items
 * @returns {number} Subtotal amount
 */
function cartItemsSubtotal() {
    return cart.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
}

/**
 * Calculate shipping fee
 * @returns {number} Shipping fee
 */
function cartShippingFee() {
    const shipping = getSelectedShipping();
    switch (shipping) {
    case 'uk': return 5;
    case 'eu': return 8;
    case 'world': return 12;
    default: return 5;
    }
}

/**
 * Calculate grand total
 * @returns {number} Grand total amount
 */
function cartGrandTotal() {
    return cartItemsSubtotal() + cartShippingFee();
}

/**
 * Get total quantity in cart
 * @returns {number} Total items
 */
function getCartTotalQuantity() {
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

/**
 * Get unique item count
 * @returns {number} Number of unique products
 */
function getCartItemCount() {
    return cart.length;
}

/**
 * Add product to cart by index
 * @param {number} productIndex - Product index in PRODUCTS array
 * @param {string} size - Selected size
 * @param {number} quantity - Quantity to add
 * @returns {Object} Result with success status and message
 */
function addToCartByIndex(productIndex, size, quantity) {
    if (!PRODUCTS || productIndex >= PRODUCTS.length) {
        return { success: false, message: 'Invalid product' };
    }

    const product = PRODUCTS[productIndex];
    const existingItem = cart.find(item =>
        item.productIndex === productIndex && item.size === size
    );

    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.lineTotal = existingItem.quantity * product.price;
    } else {
        cart.push({
            productIndex: productIndex,
            name: product.name,
            price: product.price,
            size: size,
            quantity: quantity,
            lineTotal: quantity * product.price
        });
    }

    return {
        success: true,
        message: `Added ${product.name} (${size}) × ${quantity} to cart`,
        cartCount: getCartTotalQuantity()
    };
}

/**
 * Remove item from cart
 * @param {number} index - Cart item index
 * @returns {boolean} Success status
 */
function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Clear entire cart
 */
function clearCart() {
    cart = [];
    selectedShipping = 'uk';
}

/**
 * Format cart for order submission
 * @returns {Object} Formatted order data
 */
function formatCartForOrder() {
    return {
        items: cart.map(item => ({
            name: item.name,
            price: item.price,
            size: item.size,
            quantity: item.quantity,
            lineTotal: item.lineTotal
        })),
        shipping: {
            option: getSelectedShipping(),
            fee: cartShippingFee()
        },
        subtotal: cartItemsSubtotal(),
        total: cartGrandTotal()
    };
}

/**
 * Get product summary for display
 * @returns {string} Summary string
 */
function getProductSummary() {
    if (cart.length === 0) return 'No items in cart';
    if (cart.length === 1) {
        return `${cart[0].name} (${cart[0].size}) × ${cart[0].quantity}`;
    }
    return `${cart.length} items, total: $${cartGrandTotal().toFixed(2)}`;
}
