#!/bin/bash

sed -i 's/adapter-node/adapter-cloudflare/g' svelte.config.js
pnpm i -D @sveltejs/adapter-cloudflare
