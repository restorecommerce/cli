'use strict';

const genapikey = require('./genapikey');
const genid 		= require('./genid');
const hashpw 		= require('./hashpw');
const help 			= require('./help');

const Tasks = {
	genapikey: genapikey,
	genid: genid,
	hashpw: hashpw,
	help: help
};


module.exports = Tasks;