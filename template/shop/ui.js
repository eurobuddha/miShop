/**
 * UI module for miniMerch
 * Handles DOM manipulation and UI state
 * @module ui
 */

/** @type {string} */
let currentView = 'grid';

/** @type {Object|null} */
let selectedMessage = null;

/** @type {number} */
let currentProductIndex = 0;

/** @type {boolean} */
let carouselMode = false;

/** @type {boolean} */
let carouselListenersAdded = false;

/** @type {boolean} */
let modalListenersReady = false;

/**
 * Get current view mode
 * @returns {string} Current view ('grid' or 'list')
 */
function getCurrentView() {
    return currentView;
}

/**
 * Set current view mode
 * @param {string} view - View mode
 */
function setCurrentView(view) {
    currentView = view;
}

/**
 * Get selected message
 * @returns {Object|null} Selected message
 */
function getSelectedMessage() {
    return selectedMessage;
}

/**
 * Set selected message
 * @param {Object|null} msg - Message object
 */
function setSelectedMessage(msg) {
    selectedMessage = msg;
}

/**
 * Get current product index for carousel
 * @returns {number} Product index
 */
function getCurrentProductIndex() {
    return currentProductIndex;
}

/**
 * Set current product index
 * @param {number} index - Product index
 */
function setCurrentProductIndex(index) {
    currentProductIndex = index;
}

/**
 * Check if in carousel mode
 * @returns {boolean} Carousel mode status
 */
function isCarouselMode() {
    return carouselMode;
}

/**
 * Check if carousel listeners added
 * @returns {boolean} Listener status
 */
function areCarouselListenersAdded() {
    return carouselListenersAdded;
}

/**
 * Mark carousel listeners as added
 */
function markCarouselListenersAdded() {
    carouselListenersAdded = true;
}

/**
 * Check if modal listeners are ready
 * @returns {boolean} Listener status
 */
function areModalListenersReady() {
    return modalListenersReady;
}

/**
 * Mark modal listeners as ready
 */
function markModalListenersReady() {
    modalListenersReady = true;
}

/**
 * Get card state based on cart contents
 * @param {Object} product - Product object
 * @returns {Object} Card state
 */
function getCardState(product) {
    const cart = typeof getCart === 'function' ? getCart() : [];
    const inCart = cart.some(item => item.productIndex === product.index);
    const cartItem = cart.find(item => item.productIndex === product.index);

    return {
        inCart: inCart,
        quantity: cartItem ? cartItem.quantity : 0,
        size: cartItem ? cartItem.size : null
    };
}

/**
 * Apply layout mode (grid vs carousel)
 * @param {string} mode - Layout mode
 */
function applyLayoutMode(mode) {
    const container = document.getElementById('products-container');
    if (!container) return;

    carouselMode = mode === 'carousel';

    if (carouselMode) {
        container.classList.add('carousel-mode');
        container.classList.remove('grid-mode');
    } else {
        container.classList.add('grid-mode');
        container.classList.remove('carousel-mode');
    }
}

/**
 * Render carousel navigation dots
 */
function renderCarouselDots() {
    const dotsContainer = document.getElementById('carousel-dots');
    if (!dotsContainer || !PRODUCTS) return;

    dotsContainer.innerHTML = PRODUCTS.map((_, i) =>
        `\u003cspan class="dot ${i === currentProductIndex ? 'active' : ''}" data-index="${i}"\u003e\u003c/span\u003e`
    ).join('');
}

/**
 * Navigate to product in carousel
 * @param {number} index - Product index
 */
function navigateProduct(index) {
    if (!PRODUCTS || index < 0 || index >= PRODUCTS.length) return;

    currentProductIndex = index;
    const container = document.getElementById('products-container');
    if (container) {
        container.style.transform = `translateX(-${index * 100}%)`;
    }

    renderCarouselDots();
    updateCardPrice(index);
}

/**
 * Update cart badge
 */
function updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;

    const count = typeof getCartTotalQuantity === 'function' ? getCartTotalQuantity() : 0;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

/**
 * Show payment status
 * @param {string} status - Status type ('success', 'error', 'pending')
 * @param {string} message - Status message
 */
function showPaymentStatus(status, message) {
    const statusEl = document.getElementById('payment-status');
    if (!statusEl) return;

    statusEl.className = `payment-status ${status}`;
    statusEl.textContent = message;
    statusEl.style.display = 'block';
}

/**
 * Hide payment status
 */
function hidePaymentStatus() {
    const statusEl = document.getElementById('payment-status');
    if (statusEl) {
        statusEl.style.display = 'none';
    }
}

/**
 * Close modal
 * @param {string} modalId - Modal element ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Update address field based on selection
 * @param {string} type - Address type
 */
function updateAddressField(type) {
    const field = document.getElementById('delivery-address');
    if (!field) return;

    if (type === 'address') {
        field.placeholder = 'Enter your delivery address';
    } else if (type === 'email') {
        field.placeholder = 'Enter your email for digital delivery';
    }
}

/**
 * Format timestamp for display
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted time string
 */
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    }

    // Default to date
    return date.toLocaleDateString();
}

/**
 * Get shipping label
 * @param {string} option - Shipping option
 * @returns {string} Human-readable label
 */
function getShippingLabel(option) {
    const labels = {
        'uk': 'UK Delivery (£5)',
        'eu': 'EU Delivery (£8)',
        'world': 'Worldwide Delivery (£12)'
    };
    return labels[option] || option;
}

/**
 * Wire copy button
 * @param {string} btnId - Button element ID
 * @param {string} textId - Text element ID to copy
 */
function wireCopyBtn(btnId, textId) {
    const btn = document.getElementById(btnId);
    const textEl = document.getElementById(textId);
    if (!btn || !textEl) return;

    btn.addEventListener('click', () => {
        navigator.clipboard.writeText(textEl.textContent).then(() => {
            const originalText = btn.textContent;
            btn.textContent = '✓ Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    });
}

/**
 * Initialize carousel
 */
function initCarousel() {
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentProductIndex > 0) {
                navigateProduct(currentProductIndex - 1);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentProductIndex < PRODUCTS.length - 1) {
                navigateProduct(currentProductIndex + 1);
            }
        });
    }

    // Dots
    const dotsContainer = document.getElementById('carousel-dots');
    if (dotsContainer) {
        dotsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('dot')) {
                const index = parseInt(e.target.dataset.index, 10);
                navigateProduct(index);
            }
        });
    }
}

/**
 * Update card price display
 * @param {number} index - Product index
 */
function updateCardPrice(index) {
    const priceEl = document.getElementById(`price-${index}`);
    if (!priceEl || !PRODUCTS[index]) return;

    const product = PRODUCTS[index];
    priceEl.textContent = `$${product.price.toFixed(2)}`;
}

/**
 * Update size buttons for card
 * @param {number} index - Product index
 * @param {string} selectedSize - Currently selected size
 */
function updateSizeButtonsForCard(index, selectedSize) {
    const card = document.getElementById(`card-${index}`);
    if (!card) return;

    const buttons = card.querySelectorAll('.size-btn');
    buttons.forEach(btn => {
        if (btn.dataset.size === selectedSize) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

/**
 * Setup card event listeners
 * @param {number} index - Product index
 */
function setupCardListeners(index) {
    const card = document.getElementById(`card-${index}`);
    if (!card) return;

    // Size buttons
    const sizeBtns = card.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            updateSizeButtonsForCard(index, btn.dataset.size);
        });
    });

    // Add to cart button
    const addBtn = card.querySelector('.add-to-cart-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const selectedSize = card.querySelector('.size-btn.selected')?.dataset.size || 'M';
            if (typeof addToCartByIndex === 'function') {
                const result = addToCartByIndex(index, selectedSize, 1);
                if (result.success) {
                    updateCartBadge();
                    showPaymentStatus('success', result.message);
                    setTimeout(hidePaymentStatus, 3000);
                }
            }
        });
    }
}

/**
 * Setup modal event listeners
 */
function setupModalListeners() {
    if (modalListenersReady) return;

    // Cart modal
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            if (typeof openCartModal === 'function') openCartModal();
        });
    }

    // Close buttons
    document.querySelectorAll('.modal-close, .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) modal.classList.add('hidden');
        });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    modalListenersReady = true;
}

/**
 * Render shop grid/carousel
 */
function renderShop() {
    const container = document.getElementById('products-container');
    if (!container || !PRODUCTS) return;

    container.innerHTML = PRODUCTS.map((product, index) => {
        const state = getCardState(product);
        return renderCardHTML(product, index, state);
    }).join('');

    // Setup listeners after render
    PRODUCTS.forEach((_, index) => setupCardListeners(index));
}

/**
 * Render card HTML
 * @param {Object} product - Product data
 * @param {number} index - Product index
 * @param {Object} state - Card state
 * @returns {string} HTML string
 */
function renderCardHTML(product, index, state) {
    const sizes = ['S', 'M', 'L', 'XL'];
    const sizeButtons = sizes.map(size =>
        `\u003cbutton class="size-btn ${size === 'M' ? 'selected' : ''}" data-size="${size}"\u003e${size}\u003c/button\u003e`
    ).join('');

    return `
        \u003cdiv class="product-card ${state.inCart ? 'in-cart' : ''}" id="card-${index}"\u003e
            \u003cdiv class="product-image"\u003e
                \u003cimg src="${product.image || 'item.jpg'}" alt="${product.name}"\u003e
                ${state.inCart ? '\u003cdiv class="cart-badge"\u003e' + state.quantity + '\u003c/div\u003e' : ''}
            \u003c/div\u003e
            \u003cdiv class="product-info"\u003e
                \u003ch3\u003e${product.name}\u003c/h3\u003e
                \u003cp class="price" id="price-${index}"\u003e$${product.price.toFixed(2)}\u003c/p\u003e
                \u003cdiv class="size-selector"\u003e
                    ${sizeButtons}
                \u003c/div\u003e
                \u003cbutton class="add-to-cart-btn"\u003eAdd to Cart\u003c/button\u003e
            \u003c/div\u003e
        \u003c/div\u003e
    `;
}

/**
 * Open cart modal
 */
function openCartModal() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;

    const cartItems = document.getElementById('cart-items');
    const cart = typeof getCart === 'function' ? getCart() : [];

    if (cart.length === 0) {
        cartItems.innerHTML = '\u003cp class="empty-cart"\u003eYour cart is empty\u003c/p\u003e';
    } else {
        cartItems.innerHTML = cart.map((item, i) => `
            \u003cdiv class="cart-item"\u003e
                \u003cspan\u003e${item.name} (${item.size}) × ${item.quantity}\u003c/span\u003e
                \u003cspan\u003e$${item.lineTotal.toFixed(2)}\u003c/span\u003e
                \u003cbutton onclick="removeFromCart(${i}); renderShop(); updateCartBadge();"\u003e×\u003c/button\u003e
            \u003c/div\u003e
        `).join('');
    }

    updateCheckoutSummary();
    modal.classList.remove('hidden');
}

/**
 * Close cart modal
 */
function closeCartModal() {
    closeModal('cart-modal');
}

/**
 * Open checkout modal
 */
function openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    updateCheckoutSummary();
    modal.classList.remove('hidden');
}

/**
 * Update checkout summary
 */
function updateCheckoutSummary() {
    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const totalEl = document.getElementById('checkout-total');

    if (subtotalEl) subtotalEl.textContent = `$${(cartItemsSubtotal?.() || 0).toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `$${(cartShippingFee?.() || 0).toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${(cartGrandTotal?.() || 0).toFixed(2)}`;
}

/**
 * Update pay button state
 * @param {boolean} loading - Whether payment is processing
 */
function updatePayButton(loading) {
    const btn = document.getElementById('pay-btn');
    if (!btn) return;

    if (loading) {
        btn.disabled = true;
        btn.textContent = typeof t === 'function' ? t('checkout.processing') : 'Processing...';
    } else {
        btn.disabled = false;
        btn.textContent = typeof t === 'function' ? t('checkout.payWithMinima') : 'Pay with Minima';
    }
}

/**
 * Update all displayed prices
 */
function updateAllPrices() {
    if (PRODUCTS) {
        PRODUCTS.forEach((_, index) => updateCardPrice(index));
    }
}
