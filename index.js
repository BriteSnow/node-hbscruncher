var gulp = require("gulp");
var path = require("path");
var through = require("through2");
var handlebars = require('handlebars');
var StringDecoder = require('string_decoder').StringDecoder;
var htmlparser = require("htmlparser2");
var gutil = require('gulp-util');

var ut8decoder = new StringDecoder('utf8');


module.exports = {
	precompile: hbspPrecompile
};

// --------- hbs plugin --------- //
function hbspPrecompile(){
	return through.obj(function(inFile, enc, cb){
		
		// get the string content
		var content = ut8decoder.write(inFile.contents).toString();

		// get the parts (i.e. {name,content})
		var parts = parseParts(inFile.path,content);

		// for each part, precompile and build the varLine
		var part;
		var resultContent = "";
		for (var i = 0; i < parts.length; i++){
			part = parts[i];
			var precompiledFunc = handlebars.precompile(part.content);	
			var varLine = buildVarLine(part.name, precompiledFunc);
			resultContent += varLine;
		}

		var file = new gutil.File({
		  cwd: inFile.cwd,
		  base: inFile.base,
		  path: gutil.replaceExtension(inFile.path, '.js'),
		  contents: new Buffer(resultContent)
		});

		// call the callback for the next step
		cb(null, file);
	});
}


function buildVarLine(name,precompiledFunc){
		var varLine = "Handlebars.templates['" + name + "']  = Handlebars.template(";
		varLine += precompiledFunc;
		varLine += ");\n\n";	
		return varLine;
}

// parse a file content and return a [{name,content}] array of parts
//  - Single element if no <script tag with the name of the file
//  - Multiple elements, one per <script tag with the id as name.
function parseParts(filepath, content){
	var name = path.basename(filepath,path.extname(filepath));

	// if the content does contain a <script tag, then, just return the content
	// TODO: probably need to widen the match
	if (content.indexOf("<script") == -1){
		return [{name: name,content:content}];
	}

	var parts = [];
	var currentPart = null;

	var parser = new htmlparser.Parser({
    onopentag: function(tagname, attribs){    		
        if(tagname === "script"){
            currentPart = {name:attribs.id, content:""};
        }
    },

    ontext: function(text){
    	if (currentPart){
    		currentPart.content += text;
    	}
    },

    onclosetag: function(tagname){  		
      if(tagname === "script" && currentPart){
      	currentPart.content = currentPart.content.trim();
      	parts.push(currentPart);
      	currentPart = null;
      }
    }
	}, {decodeEntities: true});

	parser.write(content);

	return parts;
}
// --------- /hbs plugin --------- //