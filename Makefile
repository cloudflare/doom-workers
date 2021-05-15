#!/usr/bin/env make
include .env
export

default:
	@echo "Available Targets:"
	@echo
	@echo "  publish-site: Publish site to workers (Production)"
	@echo "  publish-router: Publish router to workers (Production)"
	@echo ""
	@echo "  publish: Publish everything to workers (Production)"

.PHONY: node_modules dist wrangler-publish test clean

install:
	npm install

dist:
	cp ../doom-wasm/src/websockets-doom.wasm assets/websockets-doom.wasm
	cp ../doom-wasm/src/websockets-doom.wasm.map assets/websockets-doom.wasm.map
	cp ../doom-wasm/src/websockets-doom.js assets/websockets-doom.js

tail:
	CF_ZONE_ID="$$SITE_CF_ZONE_ID" CF_ACCOUNT_ID="$$SITE_CF_ACCOUNT_ID" wrangler tail --config wrangler-site.toml

publish-site:
	make dist
	CF_ZONE_ID="$$SITE_CF_ZONE_ID" CF_ACCOUNT_ID="$$SITE_CF_ACCOUNT_ID" wrangler publish --config wrangler-site.toml

publish-router:
	CF_ZONE_ID="$$ROUTER_CF_ZONE_ID" CF_ACCOUNT_ID="$$ROUTER_CF_ACCOUNT_ID" wrangler publish --config wrangler-router.toml

publish:
	make publish-site
	make publish-router

