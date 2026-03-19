# miShop - MiniDapp Generator for Minima

Generate MiniDapps for the Minima blockchain that function as storefronts for selling products, with built-in encrypted messaging.

## Features

- **Dual Sales Modes**: Sell by weight or by unit quantity
- **Multi-Currency Payments**: Accept USDT or Minima
- **Live Price Fetching**: CoinGecko, CoinMarketCap, or Minima node fallback
- **Encrypted Messaging**: Orders encrypted via Maxima, sent off-chain to your inbox
- **Universal Inbox**: One inbox receives orders from ALL your shops
- **Shipping Options**: UK, International, and Electronic Delivery

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VENDOR SETUP                             │
│                                                              │
│  1. Run setup.js → creates vendor.config.json               │
│                                                              │
│  2. Run generator.js → creates both MiniDapps:               │
│                                                              │
│     ┌─────────────────┐     ┌─────────────────┐             │
│     │   SHOP          │     │   INBOX         │             │
│     │  MiniDapp       │ ──► │  MiniDapp       │             │
│     │  (for buyers)   │ enc │  (for vendor)   │             │
│     │                 │     │                 │             │
│     │ • Product UI    │     │ • Order inbox   │             │
│     │ • Encrypt order │     │ • Decrypt view  │             │
│     │ • Send to vendor│     │ • All shops     │             │
│     └─────────────────┘     └─────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### First Time Setup

```bash
node setup.js <your-minima-address> <cmc-api-key> <chainmail-public-key>
```

### Generate Shop + Inbox

**Weight Mode** (by gram):
```bash
node generator.js -n "Organic Barley" -m weight -p 5 -w 1000 -d "Premium malting barley"
```

**Units Mode** (by quantity):
```bash
node generator.js -n "Rolled Oats" -m units -p 25 -u 100 -d "Organic rolled oats"
```

### Generate Inbox Only

```bash
node generator.js --inbox-only
```

### Options

| Flag | Description | Example |
|------|-------------|---------|
| `-n, --name` | Product name | `"Organic Barley"` |
| `-m, --mode` | Sales mode: `weight` or `units` | `weight` |
| `-p, --price` | Price per gram or per unit | `10` |
| `-w, --weight` | Total weight in grams (weight mode) | `1000` |
| `-u, --units` | Max units (units mode) | `100` |
| `-d, --desc` | Product description | `"Premium malting barley"` |
| `-i, --image` | Path to product image | `./photo.jpg` |
| `--inbox-only` | Generate only the inbox MiniDapp | - |

## How It Works

### Order Flow

1. **Buyer** purchases from Shop MiniDapp
2. **Delivery address** is encrypted with vendor's public key
3. **Encrypted message** sent via Minima P2P network to vendor's address
4. **Payment** sent separately (on-chain)
5. **Vendor** opens Inbox MiniDapp to see decrypted orders

### Privacy

- Delivery addresses are **encrypted** using Maxima encryption
- Messages are **off-chain** (sent via P2P, not on blockchain)
- Only the vendor can decrypt their orders
- Order references are **on-chain** (public), delivery details are **private**

### Universal Inbox

The Inbox MiniDapp receives ALL orders sent to your vendor address, regardless of which shop they came from. This means:

- Add new shops without reinstalling inbox
- All orders aggregated in one place
- Each order shows which product it came from

## Output

Generated MiniDapps are saved to `dist/`:

```
dist/
├── miniShop_Organic_Barley.mds.zip   ← Shop (distribute to buyers)
├── miniShop_Rolled_Oats.mds.zip      ← Shop (distribute to buyers)
└── miShopInbox.mds.zip              ← Inbox (KEEP for yourself)
```

## Payment Calculations

- **USDT**: `totalUSD` (no conversion)
- **Minima**: `totalUSD / minimaPrice * 1.10` (10% slippage)

## Powered by Minima

Built for the Minima blockchain - the embedded blockchain empowering edge devices with full decentralization.
