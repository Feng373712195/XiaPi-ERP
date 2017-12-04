


'use strict'


/*
*	Option 
*	
*	- `filename`	 Reference resources file-stream-rotator filename option
*	- `frequency`    Reference resources file-stream-rotator frequency option
*	- `verbose`		 Reference resources file-stream-rotator verbose option
*	- `date_format`	 Reference resources file-stream-rotator date_format option
*	- `size` 		 Reference resources file-stream-rotator size option
*	- `max_logs` 	 Reference resources file-stream-rotator max_logs option
*	- `audit_file` 	 Reference resources file-stream-rotator audit_file option
*/


/**
 * Module exports.
 * @public
 */

module.exports = logger();

/**
 * Module dependencies.
 * @private
 */

var fs = require('fs')
var path = require('path')
var fileStreamRotator = require('file-stream-rotator')
var morgan = require('morgan')


/**
 * Create a logger middleware.
 *
 */

function logger(loggerOptions){

	//
	var logDir = loggerOptions.outpath;
	
	return morgan.bind('short',{stream:accessLogStream})

}

function accessLogStream(){

	var 

	return	fileStreamRotator.getStream({
				filename:
				frequency:
				verbose:
				date_format:
				size：
				max_logs：
				audit_file：
			})
};

function existsDir(path){
	fs.existsSync(path) || fs.mkdirSync(path);
}