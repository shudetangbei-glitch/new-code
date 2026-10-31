# Startup Resilience - 2026-11-01

The prior speed optimization still awaited the building GLB without a timeout.
It also relied on a multi-file engine import waterfall. A hung request could leave
the lobby available but the city absent indefinitely. Limited-bandwidth tests did
not reproduce that failure, so they were not sufficient acceptance evidence.

## Current Startup

- The complete game shell, icon code and playable lightweight canvas are in the HTML.
  No separate JavaScript file must download before game controls become usable.
- The 3D runtime is one self-contained module. The primary URL and two staggered
  mirrors race under one 12-second download deadline. SHA-256 verifies each candidate.
- A failed 3D connection leaves the lightweight game usable and exposes a retry button
  in the lobby and game menu. It does not reload the page or discard the game state.
- Native 3D buildings and avatars are embedded in that runtime. They need no GLB,
  image, HDR or texture request before the first city frame.
- Detailed Blender buildings, rigged avatars, textures and sky upgrade in background.
  Building requests now time out. Failed details retain the native city.

## Build

Run `node build-web.mjs`. The shell template is `wonder-estate.shell.html`.
It generates the self-contained runtime, its integrity metadata, the icon bundle,
and the HTML with its inline bootstrap. Do not manually edit the generated HTML.
The standalone source module remains browser-compatible for older cached shells.

## Verification

`boot-resilience-test.cjs` passed in Chrome and WebKit:

- Stall all three runtime hosts: lobby usable within 5 seconds; explicit fallback
  observed within 16 seconds (12-second network deadline plus test/render overhead).
- Create a local game, roll and pause while runtime requests remain stalled.
- Retry into native 3D while every art request remains stalled; pause and save unchanged.
- Delay detailed buildings, then verify background replacement and nonblank canvas.

The existing purchase, upgrade, rent, pause, exploration, new-game, responsive-layout
and stale-polling regression suite also passed in both browsers.

On the previous 1Mbps/150ms/4x-CPU local profile, the new lobby appeared in 1.654s
and native 3D in 10.122s. These are simulated timings, not an iPhone guarantee.
The important acceptance condition is bounded waiting even when requests never return.
