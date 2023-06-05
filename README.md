# Multiplayer Doom Workers

This repo contains two Workers

- Website for https://silentspacemarine.com/ in [Cloudflare Pages][3]
- Wasm Doom message router, using [WebSockets][1] and [Durable Objects][2]

## Website

Assets are in [./assets][8]

Worker code is in [site/index.js][9]

**You need the following files in ```./assets``` (not included in this repo)**:

 * [doom1.wad][15] (md5sum: f0cefca49926d00903cf57551d901abe)
 * [websockets-doom.js][16] - get it from doom-wasm src directory after compilation
 * [websockets-doom.wasm][16] - get it from doom-wasm src directory after compilation
 * [websockets-doom.wasm.map][16] - get it from doom-wasm src directory after compilation

### To publish:

```
npm install -g @cloudflare/wrangler@beta
wrangler login
wrangler publish --config wrangler-site.toml
```

Adjust [wrangler-site.toml][4] to your ```account_id``` and ```zone_id```.

## Wasm Doom message router

Our message router has the following requirements:

- Accept Wasm Doom WebSocket connections and build a routing table
- Receive and parse the incoming messages
- Broadcast the messages to the corresponding clients
- Handle some REST APIs to create and validate Doom rooms (sessions)

Just supports the network multiplayer in our [Silent Space Marine][6] showcase project.

Read more about it in our [blog post here][5].

The router source code is at [router/index.mjs][7]

### To publish:

First make sure you have [Durable Objects][10] enabled in your account.

Make sure you have the Durable Objects wrangler (beta) installed:

```
npm install -g @cloudflare/wrangler@beta
```

Adjust [wrangler-router.toml][11] to your ```account_id``` and ```zone_id``` or use the ```CF_ACCOUNT_ID``` and ```CF_ZONE_ID``` environment [variables][14].

Run this command just [once][12]

```
wrangler login
wrangler publish --config wrangler-router.toml --new-class Router
```

Later updates use:

```
wrangler login
wrangler publish --config wrangler-router.toml
```

### Makefile

You can use ```make``` to deploy the workers.

Create an ```.env``` file with your account and zone ids:

```
ROUTER_CF_ZONE_ID = 72...........91
ROUTER_CF_ACCOUNT_ID = 0a...............2f
SITE_CF_ZONE_ID = 13....................a0
SITE_CF_ACCOUNT_ID = 07.................4f
```

Run ```make```:

```
make publish
```

## Running Multiplayer Doom locally

You can run the Website, Wasm Doom and Multiplayer locally, in your computer, using a NodeJS WebSocket router implementation.

First install [NodeJS][13] and npm. Then:

```
cd scripts
npm install
./router.js
```

Point your browser to http://0.0.0.0:8000

Read more about Multiplayer Doom on Cloudflare Workers in our [blog post here][5].

[1]: https://developers.cloudflare.com/workers/runtime-apis/websockets
[2]: https://developers.cloudflare.com/workers/runtime-apis/durable-objects
[3]: https://developers.cloudflare.com/pages/
[4]: wrangler-site.toml
[5]: https://blog.cloudflare.com/doom-multiplayer-workers
[6]: https://silentspacemarine.com/
[7]: router/index.mjs
[8]: assets
[9]: site/index.js
[10]: https://developers.cloudflare.com/workers/learning/using-durable-objects
[11]: wrangler-router.toml
[12]: https://developers.cloudflare.com/workers/learning/using-durable-objects#publishing-durable-object-classes
[13]: https://github.com/nvm-sh/nvm#installing-and-updating
[14]: https://developers.cloudflare.com/workers/cli-wrangler/configuration
[15]: https://doomwiki.org/wiki/DOOM1.WAD
[16]: https://github.com/cloudflare/doom-wasm
