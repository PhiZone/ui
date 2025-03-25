#!/bin/bash

TAILWIND_CONFIG_INSERTION="
      backgroundSize: {
        'size-200': '200% 200%',
      },
      backgroundPosition: {
        'pos-0': '2% 2%',
        'pos-100': '98% 98%',
      },
    "

cd .. &&
  git clone https://github.com/PhiZone/player.git &&
  cd player &&
  find src -type f -exec sed -i 's/\$lib/\$lib\/player/g' {} + &&
  find src -type f -exec sed -i 's/\${base}/\/player/g' {} + &&
  find src -type f -exec sed -i 's/{base}/\/player/g' {} + &&
  sed -i '3,4d' src/routes/+layout.svelte &&
  cd ../repo &&
  mkdir -p src/routes/player/\(player\) &&
  cp -r ../player/src/routes/* src/routes/player/\(player\)/ &&
  mkdir src/lib/player &&
  cp -r ../player/src/lib/* src/lib/player/ &&
  mkdir static/player &&
  cp -r ../player/static/* static/player/ &&
  rm -rf static/player/.well-known static/player/ffmpeg &&
  sed -i "11s/\(.\{13\}\)/\1$(printf '%s' "$TAILWIND_CONFIG_INSERTION" | sed 's/[&/\]/\\&/g' | sed ':a;N;$!ba;s/\n/\\n/g')/" tailwind.config.ts &&
  pnpm i -D @capacitor/android @capacitor/app @capacitor/cli @capacitor/core @capacitor/ios @tauri-apps/cli globals terser &&
  pnpm i @awesome-cordova-plugins/android-full-screen @capacitor/clipboard @capacitor/filesystem @capacitor/network @ffmpeg/ffmpeg @ffmpeg/util @fix-webm-duration/fix @sentry/sveltekit @tauri-apps/api @tauri-apps/plugin-deep-link @tauri-apps/plugin-dialog @tauri-apps/plugin-fs @tauri-apps/plugin-opener @tauri-apps/plugin-os @tauri-apps/plugin-upload apng-js bezier-easing context-filter-polyfill cordova-plugin-fullscreen file-type gifuct-js jszip mathjs mime moment notiflix phaser phaser3-rex-plugins send-intent stats-js wavesurfer.js
