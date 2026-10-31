# Mobile Startup - 2026-10-31

## Controlled Cold-Start Comparison

Chrome mobile emulation, 390x844, cache disabled, 150ms latency, 128000 bytes/sec
download bandwidth (about 1Mbps), and 4x CPU throttling. Both measurements use the
same local static server, which does not apply HTTP compression to JavaScript.
Supabase connectivity probing is mocked so its latency does not affect the result.

| Milestone | Before | After |
| --- | ---: | ---: |
| Interactive lobby | 41.114s | 0.944s |
| Initial 3D city | 41.391s | 12.984s |

The initial city includes the actual Blender architecture, roads, scenery and
animated built-in people. Detailed rigged characters, surface maps and sky lighting
upgrade after the first rendered frame. These timings do not represent completion
of all optional visual assets and are not physical iPhone measurements.

## Changes

- The application shell no longer waits for the 3D module or asset downloads.
- Module preloads shorten the engine import waterfall after the lobby appears.
- Removed blocking sequential texture, character, environment and HDR stages.
- Building delivery: 580087 to 386644 compressed bytes, preserving the original kit.
- Mobile sky: 1173154-byte HDR replaced with a 28207-byte JPEG derivative.
- Local icon bundle: 5557 bytes, only the used icons, async and no external CDN.
- Mobile loads one detailed character, rather than racing two downloads.
- Unused material families are not downloaded. Diffuse maps arrive before normal
  and roughness maps; all used surface detail is retained in the background.
- Character upgrades preserve actor identity, position, movement path and game state.

## Verification

- `startup-perf.cjs`: reproducible before/after network and CPU profile.
- `progressive-startup-test.cjs`: WebKit tests a detailed-character upgrade during
  pause and an already-started game whose 3D scene arrives later.
- `interaction-regression.cjs`: Chrome/WebKit purchase, upgrade, rent, pause,
  exploration, clean new game, six viewport layouts and stale-poll protection.
- `weaknet-test.cjs`: WebKit normal background loading and aborted-character fallback.

Real public-site performance still depends on the device and its route to GitHub Pages.
