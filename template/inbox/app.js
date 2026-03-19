const MESSAGES_STORAGE_KEY = 'mishop_inbox_messages';

let currentMessages = [];
let selectedMessage = null;
let myAddress = null;
let myPublicKey = null;

function textToHex(text) {
    let hex = '';
    for (let i = 0; i < text.length; i++) {
        hex += text.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return hex;
}

function hexToText(hex) {
    let text = '';
    for (let i = 0; i < hex.length; i += 2) {
        text += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return text;
}

function decryptMessage(encryptedData) {
    return new Promise((resolve) => {
        MDS.cmd('maxmessage action:decrypt data:' + encryptedData, (response) => {
            console.log('Decrypt response:', JSON.stringify(response));
            if (response.status && response.response && response.response.data) {
                try {
                    const hexData = response.response.data;
                    const jsonStr = hexToText(hexData);
                    const data = JSON.parse(jsonStr);
                    resolve(data);
                } catch (e) {
                    console.error('Failed to parse decrypted data:', e);
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    });
}

function saveMessages(messages) {
    const data = JSON.stringify(messages);
    if (typeof MDS !== 'undefined') {
        MDS.file.save(MESSAGES_STORAGE_KEY, data);
    } else {
        localStorage.setItem(MESSAGES_STORAGE_KEY, data);
    }
}

function loadMessages() {
    return new Promise((resolve) => {
        if (typeof MDS !== 'undefined') {
            MDS.file.load(MESSAGES_STORAGE_KEY, (response) => {
                if (response.status && response.response) {
                    try {
                        resolve(JSON.parse(response.response));
                    } catch (e) {
                        resolve([]);
                    }
                } else {
                    resolve([]);
                }
            });
        } else {
            const data = localStorage.getItem(MESSAGES_STORAGE_KEY);
            resolve(data ? JSON.parse(data) : []);
        }
    });
}

function addMessage(message) {
    const exists = currentMessages.find(m => m.ref === message.ref && m.txid === message.txid);
    if (exists) {
        console.log('Message already exists:', message.ref);
        return;
    }
    
    currentMessages.unshift(message);
    currentMessages.sort((a, b) => b.timestamp - a.timestamp);
    saveMessages(currentMessages);
    renderInbox();
    
    if (!message.read) {
        MDS.notify('New Order: ' + message.ref);
    }
}

function processIncomingMessage(coin) {
    if (!coin.state || !coin.state[99]) return;
    
    console.log('Processing incoming message...');
    
    decryptMessage(coin.state[99]).then((decrypted) => {
        if (decrypted) {
            console.log('Decrypted message:', JSON.stringify(decrypted));
            
            const message = {
                id: Date.now().toString(),
                ref: decrypted.ref || '',
                type: decrypted.type || 'ORDER',
                product: decrypted.product || '',
                size: decrypted.size || '',
                amount: decrypted.amount || '',
                currency: decrypted.currency || '',
                delivery: decrypted.delivery || '',
                shipping: decrypted.shipping || '',
                timestamp: decrypted.timestamp || Date.now(),
                txid: coin.txid || coin.txnhash || '',
                read: false
            };
            
            addMessage(message);
        } else {
            console.log('Could not decrypt message (might not be for us)');
        }
    });
}

function getMyAddress(callback) {
    MDS.cmd('address', (response) => {
        if (response.status && response.response && response.response.address) {
            myAddress = response.response.address;
            callback(myAddress);
        } else {
            callback(null);
        }
    });
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    
    return date.toLocaleDateString();
}

function getShippingLabel(shipping) {
    const labels = {
        'uk': 'UK Domestic ($5)',
        'intl': 'International ($20)',
        'digital': 'Electronic Delivery (Free)'
    };
    return labels[shipping] || shipping;
}

let currentView = 'inbox';

function renderInbox() {
    const inboxList = document.getElementById('inbox-list');
    const unreadCount = currentMessages.filter(m => !m.read).length;
    const totalCount = currentMessages.length;
    
    document.getElementById('unread-count').textContent = unreadCount;
    document.getElementById('total-count').textContent = totalCount;
    
    let messages = currentMessages;
    if (currentView === 'inbox') {
        messages = currentMessages.filter(m => !m.read);
    }
    
    if (messages.length === 0) {
        inboxList.innerHTML = `
            <div class="empty-inbox">
                <div class="empty-icon">${currentView === 'inbox' ? '📭' : '✅'}</div>
                <p>${currentView === 'inbox' ? 'No unread orders' : 'No orders yet'}</p>
                <p class="empty-hint">Orders from your shops will appear here</p>
            </div>
        `;
        return;
    }
    
    inboxList.innerHTML = messages.map(msg => `
        <div class="message-item ${!msg.read ? 'unread' : ''}" data-id="${msg.id}">
            <div class="message-icon">${msg.read ? '📧' : '📨'}</div>
            <div class="message-preview">
                <div class="message-ref">${msg.ref}</div>
                <div class="message-product">${msg.product}</div>
                <div class="message-meta">
                    <span class="message-size">${msg.size}</span>
                    <span class="message-amount">$${msg.amount} ${msg.currency}</span>
                </div>
            </div>
            <div class="message-time">${formatTime(msg.timestamp)}</div>
        </div>
    `).join('');
    
    setupMessageListeners();
}

function setupMessageListeners() {
    document.querySelectorAll('.message-item').forEach(item => {
        item.addEventListener('click', () => {
            const msgId = item.dataset.id;
            selectedMessage = currentMessages.find(m => m.id === msgId);
            showMessageDetail(selectedMessage);
        });
    });
}

function showMessageDetail(msg) {
    if (!msg) return;
    
    const modal = document.getElementById('message-modal');
    
    document.getElementById('modal-title').textContent = 'Order: ' + msg.ref;
    document.getElementById('modal-direction').textContent = !msg.read ? '📨 Unread' : '📧 Read';
    document.getElementById('modal-txid').textContent = msg.txid ? msg.txid.substring(0, 30) + '...' : '-';
    
    document.getElementById('modal-info').innerHTML = `
        <div class="info-row">
            <span class="info-label">Product:</span>
            <span class="info-value">${msg.product}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Size:</span>
            <span class="info-value">${msg.size}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Amount:</span>
            <span class="info-value highlight">$${msg.amount} ${msg.currency}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Shipping:</span>
            <span class="info-value">${getShippingLabel(msg.shipping)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Time:</span>
            <span class="info-value">${new Date(msg.timestamp).toLocaleString()}</span>
        </div>
        <div class="info-row delivery">
            <span class="info-label">Delivery Address:</span>
            <span class="info-value delivery-address">${msg.delivery}</span>
        </div>
    `;
    
    const copyBtn = document.getElementById('copy-address-btn');
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(msg.delivery).then(() => {
            copyBtn.textContent = '✓ Copied!';
            setTimeout(() => {
                copyBtn.textContent = '📋 Copy Delivery Address';
            }, 2000);
        });
    };
    
    const markReadBtn = document.getElementById('mark-read-btn');
    if (msg.read) {
        markReadBtn.style.display = 'none';
    } else {
        markReadBtn.style.display = 'block';
        markReadBtn.onclick = () => {
            msg.read = true;
            saveMessages(currentMessages);
            renderInbox();
            markReadBtn.style.display = 'none';
        };
    }
    
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('message-modal').classList.add('hidden');
}

function setupEventListeners() {
    document.querySelectorAll('.inbox-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            currentView = tab.dataset.view;
            document.querySelectorAll('.inbox-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderInbox();
        });
    });
    
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    
    document.getElementById('message-modal').addEventListener('click', (e) => {
        if (e.target.id === 'message-modal') closeModal();
    });
}

MDS.init(async (msg) => {
    console.log('MDS event:', msg.event);
    
    if (msg.event === 'inited') {
        console.log('MDS initialized, setting up inbox...');
        
        currentMessages = await loadMessages();
        renderInbox();
        
        getMyAddress((address) => {
            if (address) {
                const shortAddr = address.substring(0, 10) + '...' + address.substring(address.length - 8);
                document.getElementById('vendor-address').textContent = shortAddr;
                document.getElementById('vendor-address').title = address;
                
                MDS.cmd('coinnotify action:add address:' + address, (resp) => {
                    console.log('Coin notify registered:', resp);
                });
            }
        });
        
        setupEventListeners();
        
    } else if (msg.event === 'NOTIFYCOIN') {
        console.log('NOTIFYCOIN event:', JSON.stringify(msg.data));
        if (msg.data && msg.data.address === myAddress) {
            processIncomingMessage(msg.data.coin);
        }
    }
});
