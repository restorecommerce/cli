'use strict';

const uuid = require('uuid');

/**
 Generator of unique IDs to be used as `id` for
 client created resource instances.

 Depends on uuid.js.

 @returns A URL safe random ID
          e. g.: `192abae131be441485aad3ddd98adc62`
*/
exports.gen = function() {
	// TODO: Enhance with random seed
	return uuid.v4().replace(/-/g, '');
};