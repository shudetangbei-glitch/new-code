# Detailed Art Recovery

## Root Causes Found

- Building downloads used two 10-second attempts and then silently retained
  placeholder boxes for the rest of the page lifetime.
- The lobby announced that 3D was ready before detailed art was ready.
- Detail completion checked only character download, ignoring buildings,
  textures, and environment lighting.
- Retrying the 3D button returned immediately when the engine already existed.

## Change

Detailed assets use the same compressed building kit and animated character on
phones and desktop. Downloads can use the site, jsDelivr, or GitHub raw, with
immutable revision URLs for fallback sources. The winner cancels other requests.
Successful downloads are retained in Cache Storage; cache unavailability does
not block use. Each asset attempt has a 45-second deadline. Raw uncompressed
model retries have been removed. Initial failure triggers one automatic retry;
the lobby and game menu also offer manual retry without resetting the game.

Ready now requires applied buildings, applied characters, all surface textures,
and environment lighting. The engine download allowance is 45 seconds rather
than 12; the playable first map remains available during this work.

## Verified

- `node art-fetch-test.mjs`: stalled primary fallback, cancellation, cache hit,
  bounded total failure, subsequent retry, disabled-cache mode, and HTTP errors.
- Manual browser test at `http://localhost:8772/fault.html`: all art requests
  rejected; lobby correctly listed buildings, characters, textures, and lighting
  as incomplete and offered retry.
- Restored test network and clicked retry in the same page. Detailed buildings,
  animated characters, surface textures, and lighting appeared. DOM diagnostics
  showed downloaded buildings/avatars and ready detail state.
- The local server delayed primary art requests by 20 seconds; alternate sources
  were available during recovery.
- Rolled to a treasure stop, then reloaded with art requests blocked again.
  Cached detailed art loaded successfully. Continuing retained 1600 cash, dice 6,
  and the treasure-stop turn.

These checks used a desktop Chromium-based browser, including 390x844 viewport.
They are NOT physical iPhone/Safari acceptance. Visual density and realism are
unchanged; this repair ensures the intended existing assets can load and recover.
