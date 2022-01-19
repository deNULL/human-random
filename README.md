## human-random

This library is intended to help with generating more "human" random sequences. This is different from "true" randomness (and it's definitely makes random generator less secure), so don't use it for any security-related purposes.

Basically, it just makes it less probable (or impossible) to select same element from a sequence twice in a row.

See the demo to understand it visually.

## Installation

```
npm install --save human-random
```

## Usage

This library exports a single class, `HumanRandom`. Use it in the following way:

```js
const HumanRandom = require('human-random');
const rng = new HumanRandom(['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple'], {
  cooldown: 2,
  recovery: 5,
  multiplier: 1.5,
  normalize: true,
});

for (let i = 0; i < 10; i++) {
  // No color should appear again in the first 2 iterations after its previous appearance (cooldown = 2)
  // Also it should be less probable to appear in the next 5 iterations (recovery = 5)
  console.log(rng.next());
}
```

## Docs

