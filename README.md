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

`HumanRandom` constructor accepts three params: the items array (or simply a number of elements to choose from), the options object and previously stored state (an array of numbers, optional).

Supported options are:

* `cooldown` (Number) For this number of picks the same element won't be picked at all; should be less than number of items
* `recovery` (Number) Period of exponential "recovery" (after the cooldown)
* `multiplier` (Number) For each step of "recovery", the probability will be multiplied by this value (1.5 by default)
* `normalize` (Boolean) If true, scale the recovery curve, so the initial probability is 0 (with multiplier = 1 makes recovery linear)
* `weights` (Number[]) Extra weight coefficients for each element (by default, all weights are equal to 1, so all items are equiprobable)
* `random` (Function) Custom random function, should return a number in 0..1 range (Math.random by default)

The constructed object has following methods:

* `next(ignoreState)` Return the next random element (or its index, if only the number of elements was provided)
* `peek(ignoreState)` Return the next element, but don't update any state (so the repeating call always return the same value)
* `nextIndex(ignoreState)` Return the index of next random element
* `peekIndex(ignoreState)` Return the index of next random element without updating the state
* `reset()` Reset internal state, so all items are equiprobable

You can use `ignoreState` flag to temporarily ignore internal state (but selecting an element will still update it).