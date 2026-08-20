# NITRO GRIDIRON

Vertical pocket football for phones. Call the play, hike, throw, tackle. Solo vs CPU or pass-and-play with a shared room code.

**Repo:** [github.com/RBiz01/nitro-gridiron](https://github.com/RBiz01/nitro-gridiron)

## Play

- **Play now** — exhibition vs the CPU
- **Versus · Join code** — host creates a six-character code; the other coach enters the same code
- **Touch:** left stick to move · HIKE / THROW / SPRINT / SWITCH · X Y B A to target receivers
- **Keyboard:** WASD move · Space hike/throw · Shift sprint · E switch

Scoring: touchdown 7 (PAT automatic), field goal 3, safety 2. Four 90-second quarters.

P2P is casual play among friends who share a code — there is no ranked ladder.

## Stack

React + TanStack Start + three.js (R3F). WebRTC P2P rooms signaled at `/api/rtc`.

## Run

```sh
npm install
npm run dev
```
