# Canva Doom

Doom ported to Canva via the Apps SDK

![ ](https://github.com/grubbyplaya/Canva-Doom/raw/main/screenshot.png?raw=true)

# Building
This is a bit tedious, since the old version of Emscripten that's used to compile Doom and the Canva SDK used to compile the app use different versions of Node.js. So bear with me.

Install Emscripten version 1.39.20. Make whatever changes you want to Doom, then build with `emmake make`.
When your JS Doom build is complete, [generate a hello-world example after installing the Canva SDK.](https://www.canva.dev/docs/apps/quickstart/) Copy the contents of this repository into the example's directory, overwriting the example's source files. Run `run.sh` to combine Doom with the app's React code. Finally, run `npm start` to make a debuggable build, or `npm run build` to build a minified build.

# Credits
This port is based off of [doompdf](https://github.com/ading2210/doompdf) and [doomgeneric](https://github.com/ozkl/doomgeneric).