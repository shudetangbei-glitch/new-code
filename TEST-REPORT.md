# Wonder Estate Interaction Audit - 2026-10-31

## Confirmed Issues And Fixes

- The menu overflowed the 320px mobile viewport. Mobile tools now use two rows.
- Actions could end a turn while its avatar was still walking. Investment, puzzle,
  rolling and end-turn actions now wait for movement to finish; pause remains usable.
- A paused saved game prevented lobby exploration from moving. Exploration now has
  independent visitor movement while the actual game remains paused.
- Returning from exploration through the menu kept game controls hidden. Entering a
  game or lobby now leaves exploration explicitly, and lobby preview returns to lobby.
- Starting a new game reused old avatar positions and paths. Entry now resets the
  visual state from the authoritative saved or newly created game state.
- Out-of-order polling responses could overwrite newer action results. Polls are
  serialized and older versions or results from another session are ignored.
- A failed connectivity probe permanently disabled online buttons. Users may now
  retry creating or joining a room after a transient connection failure.
- Four avatars overlapped and the fourth roster entry was clipped in landscape.
  Avatar lane spacing and compact landscape layout have been corrected.

## Verification

- `journey-audit.cjs`: two isolated mobile browser sessions against real Supabase;
  create/join, start, roll, property purchase, turn synchronization, shared pause,
  refresh identity, paused lobby walking and return to saved game.
- Before the fixes, the public-site audit reproduced toolbar overflow, premature
  end-turn controls, frozen paused-lobby walking and hidden resumed game controls.
- The same audit on the repaired app with the real online service reported no issues.
- `interaction-regression.cjs`: Chrome and WebKit; deterministic purchase, two
  upgrades, rent, animation action locks, pause/resume, lobby preview, game restore,
  clean four-player new game, and delayed old polling responses.
- Layout and nonblank WebGL pixel checks: 320x812, 375x812, 390x844, 568x320,
  844x390 and 1440x900. Toolbar bounds, roster clipping and roster/action-panel
  overlap are asserted. Screenshots were also visually inspected.
- `backend-test.mjs`: PostgreSQL-compatible PGlite verifies the unchanged SQL's
  token isolation, turn checks, version conflicts, pause/resume, puzzles, persistence
  and all 12 rounds.

These are browser automation and local database checks, not physical iPhone Safari
acceptance. The original 18-second character-download abort fix remains in place.
No production SQL, existing user rooms, or other games were modified by this repair.
