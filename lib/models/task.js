'use strict';

const CoreObject = require('core-object');

module.exports = CoreObject.extend({
	run: function() {
		throw new Error('Task doesn\'t have a "run()" method.');
	}
});