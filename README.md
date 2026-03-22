# miniMerch

**Sell anything on the Minima blockchain — no server, no payment processor, no middlemen.**

[![Release](https://img.shields.io/github/v/release/eurobuddha/miniMerch?style=flat-square)](https://github.com/eurobuddha/miniMerch/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square)](https://nodejs.org)

miniMerch generates **MiniDapps** for the Minima blockchain — self-contained shop bundles that buyers install on their Minima nodes. Payments land in your wallet. Delivery addresses arrive encrypted in your private inbox. Nothing is stored on a server. Everything is peer-to-peer.

---

## Download

| Platform | File | Size |
|---|---|---|
| **macOS** (Apple Silicon + Intel via Rosetta) | [miniMerch-Studio-0.2.0.dmg](https://github.com/eurobuddha/miniMerch/releases/download/v0.2.0/miniMerch-Studio-0.2.0.dmg) | 28 MB |
| **Windows** (x64) | [miniMerch-Studio-0.2.0-Setup.exe](https://github.com/eurobuddha/miniMerch/releases/download/v0.2.0/miniMerch-Studio-0.2.0-Setup.exe) | 21 MB |
| **All releases** | [github.com/eurobuddha/miniMerch/releases](https://github.com/eurobuddha/miniMerch/releases) | |

> No Node.js required for the desktop app — it's bundled.

---

## Table of Contents

1. [What is miniMerch?](#what-is-minimerch)
2. [miniMerch Studio — Desktop App](#minimerch-studio--desktop-app)
3. [Prerequisites](#prerequisites)
4. [CLI Installation](#cli-installation)
5. [One-Time Setup](#one-time-setup)
6. [Generating Shops](#generating-shops)
7. [Shopping Cart](#shopping-cart)
8. [What Gets Generated](#what-gets-generated)
9. [Deploying Your Shop](#deploying-your-shop)
10. [How the Order Flow Works](#how-the-order-flow-works)
11. [Privacy & Security](#privacy--security)
12. [Command Reference](#command-reference)
13. [Troubleshooting](#troubleshooting)
14. [Uninstalling](#uninstalling)

---

## What is miniMerch?

miniMerch is a shop builder for the Minima blockchain. It creates two MiniDapps:

| MiniDapp | Who uses it | What it does |
|---|---|---|
| **miniMerch Shop** | Your buyers | Browse products, add to cart, pay with Minima or USDT |
| **miniMerchInbox** | You (vendor) | Receive encrypted orders, read delivery addresses, manage orders |

**Key features:**
- Up to **8 products per shop** with images, descriptions, and prices
- **Shopping cart** — buyers add multiple items, single combined checkout
- **Responsive layout** — grid on desktop, swipeable carousel on mobile
- **Encrypted orders** — delivery addresses never touch the blockchain
- **Live Minima pricing** via CoinMarketCap or CoinGecko
- **Vendor-configurable Minima slippage** buffer at checkout
- **One inbox for all your shops** — manage everything in one place

---

## miniMerch Studio — Desktop App

miniMerch Studio is a visual shop builder — no terminal, no npm, no command line. Download it, install it, open your browser.

### Install on macOS

1. Download [miniMerch-Studio-0.2.0.dmg](https://github.com/eurobuddha/miniMerch/releases/download/v0.2.0/miniMerch-Studio-0.2.0.dmg)
2. Open the DMG and drag **miniMerch Studio** to your Applications folder
3. **First launch only:** right-click the app → **Open** → click **Open** again in the dialog (bypasses Gatekeeper for unsigned apps)
4. Your browser opens at `http://localhost:3456`
5. Future launches: double-click normally

> To stop: right-click the app in the Dock → Quit

### Install on Windows

1. Download [miniMerch-Studio-0.2.0-Setup.exe](https://github.com/eurobuddha/miniMerch/releases/download/v0.2.0/miniMerch-Studio-0.2.0-Setup.exe)
2. Double-click the installer
3. **SmartScreen warning:** click **More info** → **Run anyway** (unsigned app, one-time only)
4. One-click install — no admin rights needed
5. Use the **miniMerch Studio** shortcut on your desktop
6. Your browser opens at `http://localhost:3456`

> To stop: open Task Manager and end the `node.exe` process

### Using Studio

Once the browser is open:

**Vendor Setup tab** — complete once:
- Enter your Minima address (`0x...` from Wallet MiniDapp → Receive)
- Enter your Maxima public key (`Mx...` from Terminal MiniDapp → `maxima`)
- Optional: CoinMarketCap API key for live pricing

**Build Shop tab:**
1. Enter a shop name and Minima slippage % (default 10%)
2. Click **+ Add Product** — fill in name, mode, price, quantity, description, drop an image
3. Drag the ⠿ handle to reorder products (up to 8)
4. Click **Build Shop**
5. Download the Shop ZIP (give to buyers) and Inbox ZIP (keep for yourself)

Generated files are saved to `~/Documents/miniMerch/dist/`

---

## Prerequisites

### A Minima Node (required)

miniMerch shops run inside the Minima network. You need a running node to:
- Install your vendor inbox (to receive orders)
- Optionally host your shop for buyers

Download from [minima.global](https://minima.global/). See the [platform guides](https://minimerch.info/guides/) for step-by-step setup.

### Your Minima Receiving Address (required)

This is where payments go. Find it in the Minima **Wallet MiniDapp** → **Receive**. It starts with `0x` and is 66 characters long.

### Your Maxima Public Key (required)

Used to encrypt buyer order messages. To find it:
1. Open the **Terminal MiniDapp** in Minima
2. Type `maxima` and press Enter
3. Copy the `mxpublickey` value — it starts with `Mx` and is very long

### CoinMarketCap API Key (optional)

For live Minima → USD pricing. Get a free key at [coinmarketcap.com/api](https://coinmarketcap.com/api/). miniMerch falls back to CoinGecko if this isn't set.

---

## CLI Installation

If you prefer the command line over the Studio desktop app:

```bash
npm install -g @eurobuddha/mini-merch
```

Verify:
```bash
mini-merch --version
```

Update:
```bash
npm update -g @eurobuddha/mini-merch
```

---

## One-Time Setup

Run this once to save your vendor details locally. You can also do this in the Studio's **Vendor Setup** tab.

```bash
mini-merch setup <minima-address> <cmc-api-key> <mxpublickey>
```

Example:
```bash
mini-merch setup \
  0x465CA86A9B5756F45DEB667A69B3DBEC1B82B211 \
  a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  MxG18HGG6FJ038614Y8CW46US6G20810K0070CD00Z83282...
```

| Argument | Where to find it |
|---|---|
| `minima-address` | Wallet MiniDapp → Receive (starts with `0x`) |
| `cmc-api-key` | coinmarketcap.com/api (optional — pass empty string `""` to skip) |
| `mxpublickey` | Terminal MiniDapp → type `maxima` → copy `mxpublickey` |

Config is saved to `~/.mini-merch/config.json`.

---

## Generating Shops

### Single-product shop

```bash
mini-merch generate -n "My Product" -m units -p 25 -u 50 -d "Description" --slippage 5
```

| Flag | Short | Description |
|---|---|---|
| `--name` | `-n` | Product name |
| `--mode` | `-m` | `weight` or `units` |
| `--price` | `-p` | Price per gram (weight) or per unit (units), in USD |
| `--weight` | `-w` | Max batch weight in grams (weight mode) |
| `--units` | `-u` | Max units available (units mode) |
| `--desc` | `-d` | Product description |
| `--image` | `-i` | Path to product image (JPG, PNG, WebP) |
| `--slippage` | | Minima slippage % at checkout (default: 10) |

**Weight mode** — buyer sees Full / Half / Quarter / Eighth options with prices calculated automatically:
```bash
mini-merch generate -n "Artisan Coffee" -m weight -p 0.05 -w 500 -d "Single-origin Ethiopian"
```

**Units mode** — buyer picks a quantity:
```bash
mini-merch generate -n "Digital Guide" -m units -p 12 -u 100 -d "PDF bundle" --slippage 5
```

---

### Multi-product shop (up to 8 products)

Use the interactive wizard — it prompts you for each product one by one:

```bash
mini-merch generate-multi
```

Or open the visual Studio UI:

```bash
mini-merch studio
```

**What the wizard asks for each product:**
- Name
- Mode (`weight` or `units`) — press Enter for weight
- Price (USD per gram or per unit)
- Max weight (grams) or Max units
- Description (optional)
- Image path (optional)

After all products, it asks for the **Minima slippage %** for the whole shop (default 10%). Then it generates both zip files automatically.

Multi-product shops output as `miniMerch_ShopName.mds.zip`.

---

### Slippage

The slippage % is a buffer added to the Minima price shown at checkout, to protect against price movement between the time the buyer sees the price and when the transaction confirms. Set it per-shop at build time.

```bash
# 5% slippage
mini-merch generate -n "My Item" -m units -p 10 -u 20 --slippage 5

# Default 10% slippage
mini-merch generate-multi
# wizard will ask: "Slippage % for Minima payments (default 10):"
```

---

## Shopping Cart

Buyers can add multiple products to a cart before checking out:

1. **Browse** — products shown as a grid on desktop, swipeable carousel on mobile
2. **Add to Cart** — each product card has an Add to Cart button; same product + size increments quantity
3. **Cart** — tap the cart icon in the header to review items, update quantities, or remove items
4. **Checkout** — one shipping choice, one delivery address, one payment for everything in the cart
5. **Order sent** — a single encrypted ORDER message (containing all cart items) is sent to your inbox, followed by one payment transaction for the combined total

---

## What Gets Generated

After running any generate command, a `dist/` folder is created:

```
dist/
├── miniMerch_ProductName.mds.zip    ← Single-product shop (give to buyers)
├── miniMerch_ShopName.mds.zip       ← Multi-product shop (give to buyers)
└── miniMerchInbox.mds.zip           ← Your inbox (install on your node)
```

When running as the Studio desktop app, files go to `~/Documents/miniMerch/dist/`.

Both shop and inbox are **complete, self-contained MiniDapps** — no server, database, or hosting needed beyond the file itself.

---

## Deploying Your Shop

### Share the shop with buyers

Buyers install the `.mds.zip` on their own Minima node. Share it via:

- **Direct file** — email, Dropbox, Google Drive, WeTransfer
- **Your website** — host the file and link to it
- **IPFS** — permanent decentralized hosting

### Install your inbox

1. Open your Minima node at `https://127.0.0.1:9003`
2. Click **+** to add a MiniDapp
3. Select `miniMerchInbox.mds.zip` from your `dist/` folder
4. The inbox appears — pin it to your dashboard

Your inbox needs your Minima node to be online to receive orders. If the node is offline, orders queue and arrive when it comes back up.

---

## How the Order Flow Works

```
1. BUYER OPENS SHOP
   └─ MiniDapp fetches live Minima ↔ USD price

2. BUYER BROWSES AND ADDS TO CART
   └─ Grid view on desktop, swipeable carousel on mobile
   └─ Add to Cart button on each product card
   └─ Cart shows combined total + one shipping option

3. BUYER ENTERS DELIVERY DETAILS
   └─ Postal address (physical) or email (digital)
   └─ Details encrypted with YOUR public key before leaving their device

4. BUYER PAYS
   └─ One encrypted ORDER message sent (contains all cart items)
   └─ One payment transaction for the combined total
   └─ Nothing stored on-chain except the payment itself

5. VENDOR RECEIVES ORDER (in your inbox)
   └─ miniMerchInbox decrypts the order message
   └─ You see: all items, amounts, delivery address, transaction ID
   └─ Transaction ID is copyable for verification
```

**Public (on-chain):** payment transaction ID, amount paid, your vendor address

**Private (encrypted, off-chain):** delivery address, email, order details, buyer identity

---

## Privacy & Security

### Encryption

All order details are encrypted using **Maxima encryption** — the same protocol used across the Minima network. The buyer's delivery address is encrypted with your public key before leaving their device. It travels through the Minima P2P network — not the blockchain. Only your inbox MiniDapp can decrypt it.

### On-chain vs off-chain

| | Public (on-chain) | Private (off-chain, encrypted) |
|---|---|---|
| Transaction ID | ✅ | |
| Payment amount | ✅ | |
| Vendor address | ✅ | |
| Delivery address | | ✅ |
| Email address | | ✅ |
| Order items + quantities | | ✅ |
| Buyer contact info | | ✅ |

### Config security

Your `~/.mini-merch/config.json` contains obfuscated values. Treat it like a password file — don't share it or commit it to version control.

---

## Command Reference

### `mini-merch setup`

```bash
mini-merch setup <minima-address> <cmc-api-key> <mxpublickey>
```

Saves vendor config to `~/.mini-merch/config.json`. Run once. The Studio's Vendor Setup tab does the same thing.

---

### `mini-merch generate`

Single-product shop generator.

```bash
mini-merch generate [options]
```

| Flag | Short | Required | Description |
|---|---|---|---|
| `--name` | `-n` | Yes | Product name |
| `--mode` | `-m` | Yes | `weight` or `units` |
| `--price` | `-p` | Yes | USD price per gram or per unit |
| `--weight` | `-w` | weight mode | Max batch weight in grams |
| `--units` | `-u` | units mode | Max units available |
| `--desc` | `-d` | No | Product description |
| `--image` | `-i` | No | Path to product image |
| `--slippage` | | No | Minima slippage % (default: 10) |

---

### `mini-merch generate-multi`

Interactive wizard for multi-product shops (up to 8 products).

```bash
mini-merch generate-multi
```

Prompts for each product, then asks for slippage %. Generates both shop and inbox zips.

---

### `mini-merch studio`

Opens miniMerch Studio in your browser at `http://localhost:3456`.

```bash
mini-merch studio
```

Same as running the desktop app, but launched from the CLI. Press Ctrl+C to stop.

---

### `mini-merch config`

```bash
mini-merch config --show    # Display current config (values masked)
mini-merch config --reset   # Delete stored config
```

---

## Troubleshooting

### "Config file not found"

```
❌ Error: Vendor config not found. Run "mini-merch setup" first.
```

Run: `mini-merch setup <address> <apikey> <pubkey>`  
Or use the **Vendor Setup** tab in miniMerch Studio.

---

### Studio: "Can't be opened" on macOS

This is Gatekeeper blocking an unsigned app. Fix: **right-click → Open** instead of double-clicking. You only need to do this once.

---

### Studio: nothing happens on Windows when launching

Ensure the installer completed successfully. Try right-clicking the shortcut and running as the current user. Check Task Manager for a running `node.exe` process. If it's there, visit `http://localhost:3456` in your browser manually.

---

### Port 3456 already in use

Another instance of Studio is running. Either close it (Task Manager on Windows, kill the process on macOS) or visit `http://localhost:3456` — it may already be running.

---

### "Invalid Minima address format"

The address must start with `0x` and be exactly 66 characters. Copy it exactly from Wallet MiniDapp → Receive.

---

### "Invalid vendor public key format"

The key must start with `Mx`. Get it from Terminal MiniDapp → type `maxima` → copy the `mxpublickey` value. Copy the full value including the `Mx` prefix.

---

### Prices not loading / showing default

Either your CoinMarketCap API key has hit its monthly limit, or the key wasn't set. miniMerch automatically falls back to CoinGecko. If both fail, it uses the default fallback price baked in at build time. Update `DEFAULT_MINIMA_PRICE` in `src/studio.js` if the fallback is stale.

---

### Order not appearing in inbox

Orders travel over Minima's P2P network (not the blockchain). Allow up to 5 minutes. Make sure your Minima node is online. If your node was offline, orders will arrive when it comes back up — nothing is lost.

---

## Uninstalling

### Remove the CLI
```bash
npm uninstall -g @eurobuddha/mini-merch
```

### Remove stored config
```bash
mini-merch config --reset
# or
rm ~/.mini-merch/config.json
```

### Remove Studio (macOS)
Drag `miniMerch Studio.app` from Applications to Trash.

### Remove Studio (Windows)
Settings → Apps → miniMerch Studio → Uninstall.

### Remove generated files
```bash
rm -rf ./dist
# or macOS/Windows app output:
rm -rf ~/Documents/miniMerch/dist
```

---

## How to Get Help

- **Issues:** [github.com/eurobuddha/miniMerch/issues](https://github.com/eurobuddha/miniMerch/issues)
- **Docs & guides:** [minimerch.info](https://minimerch.info)
- **Minima community:** [discord.gg/minima](https://discord.gg/minima)

---

## License

MIT — do whatever you want with it.
