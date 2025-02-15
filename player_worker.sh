#!/bin/bash
cd .. &&
    git clone https://github.com/PhiZone/player.git &&
    cd player &&
    find src -type f -exec sed -i 's/\$lib/\$lib\/player/g' {} + && find src -type f -exec sed -i 's/\$\{base\}/player/g' {} + && find src -type f -exec sed -i 's/\{base\}/player/g' {} + && cd ../ui &&
    mkdir src/routes/\(player\) &&
    mkdir src/routes/\(player\)/player &&
    cp -r ../player/src/routes/* src/routes/\(player\)/player/ &&
    mkdir src/lib/player &&
    cp -r ../player/src/lib/* src/lib/player/ &&
    mkdir static/player &&
    cp -r ../player/static/* static/player/
