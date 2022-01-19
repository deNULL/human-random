const HumanRandom = require('./index');
const rng = new HumanRandom(['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple'], {
  cooldown: 2,
  recovery: 5,
  multiplier: 1.5,
  normalize: true,
});

for (let i = 0; i < 20; i++) {
  // No color should appear again in the first 2 iterations after its previous appearance (cooldown = 2)
  // Also it should be less probable to appear in the next 5 iterations (recovery = 5)
  console.log(rng.next());
}