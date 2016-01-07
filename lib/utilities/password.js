'use strict';

const bcrypt = require('bcryptjs');

exports.hash = function(password) {
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(password, salt);
	return hash;
};

exports.verify = function(passwordHash, password) {
	const verification = bcrypt.compareSync(password, passwordHash);
	return verification;
};