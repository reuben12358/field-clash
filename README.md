# Field Clash

**Play:** https://reuben12358.github.io/field-clash/

Get two random Pokémon Champions teams, drop them onto a random field effect from **Pokémon Reborn**, **Rejuvenation** or **Desolation**, and fight it out.

## Modes

- **6v6 vs AI**: Easy, Normal or Hard trainer.
- **6v6 vs a friend**: create a room and send the code or invite link.
- **1v1v1v1 Free-For-All**: four trainers with six Pokémon each. Empty seats can be filled with AI.

## Fields

63 field states from 54 field families, including Reborn's Electric, Grassy, Misty, Corrosive, Volcanic Top, Glitch, Wasteland, Starlight, New World and more, plus the Rejuvenation and Desolation fields. Each one has its own move boosts, type changes, Nature Power / Camouflage / Mimicry / Secret Power behaviour, seeds and field transformations. You can open the in-game field guide to read the rules for every field.

## How it works on GitHub Pages

GitHub Pages only serves static files, so the whole battle engine runs in your browser:

- The [Pokémon Showdown](https://github.com/smogon/pokemon-showdown) simulator, the AI, and every field effect are bundled into `site/engine.js`.
- AI battles run completely on your machine.
- Online battles use **peer-to-peer** connections ([PeerJS](https://peerjs.com/)). The browser that creates the room runs the battle, and other players connect to it with the room code. **The host has to keep their tab open** until the battle is over. Some very strict networks (certain corporate or school Wi-Fi) block peer-to-peer connections.

## Local development (server mode)

```bash
npm install
npm run dev        # http://localhost:3000 (Express + WebSocket server)
```

Build the static site:

```bash
npm run build:site # writes site/ (uses build/engine-manifest.json)
npm run build:web  # re-traces which engine modules are needed, then builds
```

Project layout:

- `server/`: game rooms, battle wrapper (`game.js`), AI (`ai.js`), transport-agnostic message hub (`hub.js`), and field effects (`fields/`).
- `public/`: the frontend. `js/net.js` switches between WebSocket mode and in-browser + P2P mode.
- `tools/`: static build tooling.
- `research/`: notes on the field mechanics taken from the three fangames.

## Credits

- Battle simulation: [Pokémon Showdown](https://github.com/smogon/pokemon-showdown) (MIT).
- Field effect designs: the Pokémon Reborn, Pokémon Rejuvenation and Pokémon Desolation teams.
- Sprites: Pokémon Showdown sprite repository.

This is a non-commercial fan project and is not affiliated with Nintendo, Game Freak, The Pokémon Company, or the fangame developers. Pokémon is © Nintendo / Creatures Inc. / GAME FREAK inc.
