"use strict";

/*;
	@module-license:
		The MIT License (MIT)
		@mit-license

		Copyright (@c) 2017 Richeve Siodina Bebedor
		@email: richeve.bebedor@gmail.com

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.
	@end-module-license

	@module-configuration:
		{
			"package": "redsea",
			"path": "redsea/redsea.js",
			"file": "redsea.js",
			"module": "redsea",
			"author": "Richeve S. Bebedor",
			"contributors": [
				"John Lenon Maghanoy <johnlenonmaghanoy@gmail.com>"
			],
			"eMail": "richeve.bebedor@gmail.com",
			"repository": "https://github.com/volkovasystems/redsea.git",
			"test": "redsea-test.js",
			"global": true
		}
	@end-module-configuration

	@module-documentation:
		Creates a pool of error handlers.

		Hard default of 5 handlers, 4 are automatically registered and
			for every emitted event a succeeding handler will be registered.
	@end-module-documentation

	@include:
		{
			"clazof": "clazof",
			"exorcise": "exorcise",
			"falzy": "falzy",
			"harden": "harden",
			"protype": "protype",
			"snapd": "snapd"
		}
	@end-include
*/

const clazof = require( "clazof" );
const exorcise = require( "exorcise" );
const falzy = require( "falzy" );
const harden = require( "harden" );
const protype = require( "protype" );
const snapd = require( "snapd" );

const handler = function handler( logEngine ){
	/*;
		@meta-configuration:
			{
				"logEngine:required": Olivant
			}
		@end-meta-configuration
	*/

	return ( function onError( ){
		snapd( function pushPool( ){
			if( redsea.pool.length < 5 ){
				redsea.pool.push( handler( logEngine ) );
			}

		} )( function registerHandler( ){
			process.once( "error", redsea.pool.pop( ) );
		} );

		logEngine( "bad process", arguments )
			.silence( )
			.report( )
			.prompt( );
	} );
};

const redsea = function redsea( logEngine ){
	/*;
		@meta-configuration:
			{
				"logEngine:required": Olivant
			}
		@end-meta-configuration
	*/

	if( falzy( logEngine ) || !clazof( logEngine, "Olivant" ) ){
		throw new Error( "invalid log engine" );
	}

	if( protype( logEngine, OBJECT ) ){
		logEngine = logEngine.constructor;
	}

	if( redsea.pool.length == 0 ){
		while( redsea.pool.length != 5 ){
			redsea.pool.push( handler( logEngine ) );
		}

		while( redsea.pool.length != 1 ){
			process.once( "error", redsea.pool.pop( ) );
		}
	}

	return logEngine;
};

harden( "pool", redsea.pool || [ ], redsea );

exorcise( function drain( ){
	process.removeAllListeners( "error" );

	while( redsea.pool.length ){
		redsea.pool.pop( );
	}
} );

module.exports = redsea;
