#!/bin/bash

EDGE_RUNTIME_CONFIG_INSERTION="
import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
  runtime: 'edge',
};
"

NODE_RUNTIME_CONFIG_INSERTION="
import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
  runtime: 'nodejs22.x',
};
"

sed -i "6i $(printf '%s' "$EDGE_RUNTIME_CONFIG_INSERTION" | sed 's/[&/\]/\\&/g')" src/routes/+layout.ts
sed -i "5i $(printf '%s' "$NODE_RUNTIME_CONFIG_INSERTION" | sed 's/[&/\]/\\&/g')" src/routes/\(app\)/pet/objective/+page.server.ts
sed -i "11i $(printf '%s' "$NODE_RUNTIME_CONFIG_INSERTION" | sed 's/[&/\]/\\&/g')" src/routes/\(app\)/pet/subjective/+page.server.ts

sed -i 's/adapter-node/adapter-vercel/g' svelte.config.js
pnpm i -D @sveltejs/adapter-vercel
