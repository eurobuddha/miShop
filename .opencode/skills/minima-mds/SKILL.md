---
name: minima-mds
description: Build MiniDapps on the Minima blockchain using the MDS (MiniDapp System) API. Includes mds.js, TypeScript SDK (@minima-global/mds), SQL databases, file operations, inter-MiniDapp communication, and all terminal commands.
license: MIT
compatibility: opencode
metadata:
  audience: developers
  blockchain: minima
  language: javascript-typescript
---

# Minima MDS Developer Guide

You are a Minima blockchain developer specializing in MiniDapp development using MDS. When working on Minima projects:

## Key Resources
- **Documentation**: https://docs.minima.global
- **MDS Library**: `@minima-global/mds` (npm)
- **mds.js Source**: https://github.com/minima-global/Minima/blob/master/mds/mds.js
- **Build Portal**: https://build.minima.global

## Essential Setup

### JavaScript (mds.js)
```html
<script type="text/javascript" src="mds.js"></script>
```

### TypeScript
```bash
npm install @minima-global/mds
```
```typescript
import { MDS, MinimaEvents } from "@minima-global/mds";
```

## Initialization Pattern
```javascript
MDS.init(function(msg) {
    if (msg.event == "inited") {
        // MDS is ready - run commands here
        MDS.cmd("balance", function(res) {
            console.log(res);
        });
    }
});
```

## Events to Handle
- `inited` - MDS initialized
- `NEWBLOCK` - New block added
- `NEWBALANCE` - User balance changed
- `MINING` - Mining event
- `MINIMALOG` - Log message
- `MDSAPI` - API message from another MiniDapp
- `MDSFAIL` - Command failed

## Common Commands

### Get Balance
```javascript
MDS.cmd("balance", function(res) {
    // res.response: { token, confirmed, unconfirmed, sendable, coins, total }
});
```

### Get Address
```javascript
MDS.cmd("getaddress", function(res) {
    // res.response.address
});
```

### Send Transaction
```javascript
MDS.cmd("send amount:100 address:0xABC123", function(res) {
    // Transaction result
});
```

### Get Block Info
```javascript
MDS.cmd("status", function(res) {
    // res.response.chain.block - current block height
    // res.response.chain.weight - chain weight
});
```

## Database (H2)
```javascript
MDS.sql("CREATE TABLE IF NOT EXISTS USERS (id INT, name VARCHAR)", cb);
MDS.sql("INSERT INTO USERS VALUES (1, 'Alice')", cb);
MDS.sql("SELECT * FROM USERS", cb);
```

## File Operations
```javascript
MDS.file.save("data.json", JSON.stringify(obj), cb);
MDS.file.load("data.json", cb);
MDS.file.list("/", cb);
```

## Network Requests
```javascript
MDS.net.GET("https://api.example.com/data", cb);
MDS.net.POST("https://api.example.com/post", "data=value", cb);
```

## Key-Value Storage
```javascript
MDS.keypair.set("username", "alice", cb);
MDS.keypair.get("username", cb);
```

## Inter-MiniDapp Communication
```javascript
MDS.comms.broadcast("Hello all MiniDapps!");
MDS.comms.solo("Private message");
MDS.api.call("OtherDappName", data, cb);
```

## MiniDapp Structure
```
myminidapp/
├── dapp.conf        # Config (name, version, category)
├── favicon.ico      # Icon
├── index.html       # Main page
├── service.js       # Background service (optional)
├── styles.css       # Styles
└── mds.js          # MDS library
```

## dapp.conf Format
```json
{
    "name": "MyMiniDapp",
    "version": "0.1.0",
    "headline": "A brief description",
    "description": "Detailed description",
    "category": "Finance"
}
```

## Packaging & Installation
```bash
zip -r mydapp.mds.zip *
# Install via MiniHub UI at https://127.0.0.1:9003
# Or: mds action:install file:/path/to/mydapp.mds.zip
```

## Debug Mode
Set in mds.js for local development:
```javascript
DEBUG_HOST: "127.0.0.1",
DEBUG_PORT: 9003,
DEBUG_MINIDAPPID: "your-uid-from-url"
```

## Best Practices
1. Always initialize MDS before running commands
2. Handle all event types in init callback
3. Use SQL for persistent data storage
4. Use keypair for simple key-value settings
5. Handle errors via MDSFAIL event
6. Test on local node before deployment
7. Include service.js for background operations

## Common Issues
- **CORS errors**: External HTTP requests may be blocked
- **Balance shows 0**: Check for unconfirmed transactions
- **Commands fail**: Verify MDS password is set
- **SQL errors**: H2 may have minor MySQL differences
