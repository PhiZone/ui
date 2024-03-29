# PhiZone UI

Based on SvelteKit.

## Configuration

A template for `.env` is as follows.

```
PUBLIC_API_BASE = 'http://localhost:33356'
PUBLIC_AVATAR = 'https://res.phizone.cn/akFOXszKg7n9DQXWDBFA4AEJ39MtdCWo/Transparent_Akkarin.webp'
PUBLIC_DEDICATED_PLAYER_ENDPOINT = 'https://phitogether.fun/#/playChart'

CLIENT_ID = 'regular'
CLIENT_SECRET = 'c29b1587-80f9-475f-b97b-dca1884eb0e3'

REDIS_CONNECTION = 'redis://default@localhost:6379'
OFFICIAL_SECTOKEN = 'token'
FANMADE_SECTOKEN = 'token'
```

## Scripts

- `deploy.sh` - Builds and serves production build.
- `deploy-dev.sh` - Builds and previews production build.
- `translation-helper.cjs` - Tool for organizing translations. Prints unused translations, differences between languages, and duplicate translations (used more than twice)
  - `mc [source] [target]` - Makes translation keys of the target language (or all but the source language, if unspecified) consistent with that of the source language (default `zh-CN`)
  - `s` - Sorts all translation files alphabetically