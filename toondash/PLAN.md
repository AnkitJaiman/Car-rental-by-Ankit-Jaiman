# ToonDash — 2D Endless Game (Plan)

Status: **planned, not built yet.** Waiting for the go-ahead.

## Idea
An endless 2D browser game. The player picks a character, can put a cartoonised
photo face on it for 24 hours, and plays two alternating tasks forever.

## Features
1. **Characters (skins):** 5 original characters to choose from.
2. **Photo face:** user uploads a photo → turned into a 2D cartoon → placed as the
   chosen character's face. Lasts **24 hours**, then it is deleted automatically
   and the original character comes back (a countdown is shown).
3. **Task 1 — Run:** endless runner phase (jump, slide, switch lanes, dodge
   obstacles, collect coins).
4. **Task 2 — Hit:** aim at moving / small targets.
5. Run → Hit → Run → Hit … forever; speed and score keep increasing.
6. **Targets with a face or name:** user can give targets a cartoon photo face
   or a name, also for **24 hours**.

## Decisions proposed (to confirm)
| Question | Suggested |
| --- | --- |
| Name | ToonDash (alternatives: FaceRush, Chehra Run) |
| Cartoon style | Free in-browser filter (posterise + outlines); photo never leaves the device. AI cartoon (paid API) can be added later. |
| Location | This repo, `toondash/` folder |
| Hit style | Playful: water balloons / pies / splash — no violence |

## Tech
- HTML5 Canvas + plain JavaScript, no install; works on phone and computer.
- Controls: swipe/tap on phone, keyboard/mouse on computer.
- 24-hour rule: photo + timestamp saved in browser storage, auto-removed after 24 h.

## Safety
- Photos stay on the device only; no share/upload button.
- Consent note on upload: "Only use photos of people who have agreed."
- Hits are playful splashes, nothing harmful.

## Needs from the owner
- Claude GitHub App installed on the repo (pushing currently fails with 403).
- For real AI cartoons: an AI service account + API key.
- For app stores: Google Play ($25) / Apple ($99/yr) developer accounts.

## Next step
Say "start ToonDash" (or change any decision above) and the build begins.
