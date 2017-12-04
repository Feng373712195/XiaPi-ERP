const fs = require('fs'),
	  morgan = require('morgan'),
	  config = require('../config')

let accessLogStream = fs.createWriteStream(path.join(config.rootDir,'access.log'),{flags:'a'});

module.exports = morgan.bind('short',{stream:accessLogStream})
