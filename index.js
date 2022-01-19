// human-random library
//
// Implements more "human-like" random for picking an element from a list
// This means preventing repeating elements from being picked twice in short period of time
//
// Author: Denis Olshin (me@denull.ru)
// Created on 19/01/2022

/**
 * Creates an instance of a "human"-like random generator.
 * 
 * @constructor
 * @param {Array|Number} items Either a list of items to choose from, or just a number of items. In latter case, next() and peek() functions will return indexes instead of actual elements (nextIndex() and peekIndex() always return indexes).
 * @param {Object} options Configurable options
 * @param {Number} options.cooldown For this number of picks the same element won't be picked at all; should be less than number of items
 * @param {Number} options.recovery Period of exponential "recovery" (after the cooldown)
 * @param {Number} options.multiplier For each step of "recovery", the probability will be multiplied by this value
 * @param {Boolean} options.normalize If true, scale the recovery curve, so the initial probability is 0 (with multiplier = 1 makes recovery linear)
 * @param {Number[]} options.weights Extra weight coefficients for each element (by default, all weights are equal to 1, so all items are equiprobable)
 * @param {Function} options.random Custom random function, should return a number in 0..1 range (Math.random by default)
 * @param {Number[]} state Previous state of this generator. Can be used to persist state to DB, for example.
 */
function HumanRandom(items, options, state) {
  options = options || {};
  if (typeof items === 'number' ? items <= 0 : !items.length) {
    throw new Error('The first argument should be a non-empty array or a positive number');
  }
  this.items = items;
  this._count = typeof items === 'number' ? items : items.length;

  this.cooldown = Math.min('cooldown' in options ? options.cooldown : Math.floor(this._count / 5), this._count - 1);
  this.recovery = 'recovery' in options ? options.recovery : Math.floor(this._count / 3);
  this.multiplier = 'multiplier' in options ? options.multiplier : 1.3;
  this.normalize = 'normalize' in options ? options.normalize : true;
  this.weights = options.weights;
  this.random = 'random' in options ? options.random : Math.random;

  this._step = this.normalize && this.recovery ? Math.pow(this.multiplier, -this.recovery) / this.recovery : 0;
  this._rand = this.random(); // For peeking

  if (state) {
    this.state = state;
  } else {
    this.state = new Array(this._count);
    this.reset();
  }
}

/**
 * Allows to get the next index without actually advancing PRNG (consecutive calls will always return the same value)
 * 
 * @param {Boolean} ignoreState Ignore the internal state, select only using weights (if present)
 * @returns {Number} Index of the next random element from the collection.
 */
HumanRandom.prototype.peekIndex = function(ignoreState) {
  var sum = 0;
  for (var i = 0; i < this._count; i++) {
    var state = ignoreState ? 0 : this.state[i];
    if (state > this.recovery) { // Cooldown, skip
      continue;
    }
    var prob = Math.pow(this.multiplier, -state) + this._step * state;
    prob *= this.weights ? this.weights[i] : 1.0;
    sum += prob;
  }
  var value = this._rand * sum;
  sum = 0;
  for (var i = 0; i < this._count; i++) {
    var state = ignoreState ? 0 : this.state[i];
    if (state > this.recovery) { // Cooldown, skip
      continue;
    }
    var prob = Math.pow(this.multiplier, -state) + this._step * state;
    prob *= this.weights ? this.weights[i] : 1.0;
    if (value >= sum && value < sum + prob) {
      return i;
    }
    sum += prob;
  }
  // Should never happen, but just in case (ignore both state and weights)
  return ~~(this._rand * this._count);
}

/**
 * Returns the next random index and updates the internal state.
 * 
 * @param {Boolean} ignoreState Ignore (but still update) the internal state, select only using weights (if present)
 * @returns {Number} Index of the next random element from the collection.
 */
HumanRandom.prototype.nextIndex = function(ignoreState) {
  var index = this.peekIndex(ignoreState);
  
  for (var i = 0; i < this._count; i++) {
    this.state[i] = Math.max(this.state[i] - 1, 0);
  }
  this.state[index] = this.cooldown + this.recovery;

  this._rand = this.random();
  return index;
}

/**
 * Allows to get the element without actually advancing PRNG (consecutive calls will always return the same value).
 * If this generator was constructed only with number of elements, will return the same value as peekIndex().
 * 
 * @param {Boolean} ignoreState Ignore the internal state, select only using weights (if present)
 * @returns {*} The next random element
 */
HumanRandom.prototype.peek = function(ignoreState) {
  var index = this.peekIndex(ignoreState);
  return typeof this.items === 'number' ? index : this.items[index];
}

/**
 * Returns the next random element and updates the internal state.
 * If this generator was constructed only with number of elements, will return the same value as nextIndex().
 * 
 * @param {Boolean} ignoreState Ignore (but still update) the internal state, select only using weights (if present)
 * @returns {*} The next random element
 */
HumanRandom.prototype.next = function(ignoreState) {
  var index = this.nextIndex(ignoreState);
  return typeof this.items === 'number' ? index : this.items[index];
}

/**
 * Resets the internal state.
 */
HumanRandom.prototype.reset = function() {
  for (var i = 0; i < this._count; i++) {
    this.state[i] = 0;
  }
}

// Export the HumanRandom class (in browsers it's already available)
if (typeof define !== 'undefined' && define.amd) {
  define([], function () { return HumanRandom })
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = HumanRandom
}