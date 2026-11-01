# Touch And Viewport Review

## Changes

- Form inputs/selects use 16px instead of inheriting 14px.
- Lock root page overflow, disable overscroll, and set text-size-adjust to 100%.
- Use touch-action: manipulation on the page; keep touch-action: none on the
  canvas and direction pad. Dialog content remains scrollable and pinch zoom is
  not globally disabled with user-scalable=no.
- Increase direction targets from 46 to 54 CSS pixels with pressed feedback.
- Capture pointers on the whole pad, use hit-testing while sliding, and track
  multiple pointers independently. Release on up/cancel/lost capture.
- Clear movement on blur, visibility change, resize, leaving exploration, or
  opening a dialog. Keyboard and touch movement state are independent.
- Add vertical scene drag for pitch, with bounds; camera reset restores pitch.

## Verification

`node touch-controls-test.mjs` passes hold/slide/outside/multitouch/cancel/
lost-capture/release/reset/context-menu cases using synthetic event inputs.

Manual desktop browser operations at 390x844:

- Held forward: character moved from (-22.07,1.00) to (-22.07,5.63).
- Released: position stayed (-22.07,5.63) at the next observation.
- Held backward: moved to (-22.07,3.02).
- Dragged vertically 130px: pitch changed from 0 to 0.520 and the rendered
  camera angle visibly changed; character position was unchanged.
- Slid from forward to backward and released: no pressed state remained.
- Verified all direction targets are 54x54 and pad touch-action is none.
- Verified input computed font is 16px, document scrollHeight/clientHeight are
  both 844, root overflow is hidden, touch-action is manipulation.
- At 568x320 the lobby remains scrollable inside its modal.

This is NOT iPhone Safari hardware acceptance. The Safari auto-zoom mitigation
has been applied but cannot be claimed as verified on the user's device.
