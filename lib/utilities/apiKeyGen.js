'use strict';

let crypto = require('crypto');

/**
 * Generates api key
 *  @returns cryptographically strong pseudo-random data.
 *           e. g.: `2020b5f483daa5ff344c0b574f5f9e6a9fae7fac`
 */
exports.gen = function() {
	return crypto.randomBytes(20).toString('hex');
};