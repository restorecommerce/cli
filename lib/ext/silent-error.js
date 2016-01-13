'use strict';

const Promise 	= require('bluebird');
var SilentError = require('silent-error');

SilentError.prototype.returnMessage = function (message) {
	return new SilentError(message);
};

SilentError.prototype.rejectPromise = function (message) {
	return new Promise.reject(this.returnMessage(message));
};

module.exports = SilentError;