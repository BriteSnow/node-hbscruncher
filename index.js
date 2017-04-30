var path = require("path");
var through = require("through2");
var handlebars = require('handlebars');
var StringDecoder = require('string_decoder').StringDecoder;
var htmlparser = require("htmlparser2");
var File = require("vinyl");
var ut8decoder = new StringDecoder('utf8');


module.exports = {
	precompile, // to use promise style
	streamPrecompile // to use stream style (.e.g, in gulp pipe)
};

// --------- hbs plugin --------- //

// To use stream style, in a gulp.pipe chain for example. 
//
// gulp.src(path.join(webappDir,"src/view/**/*.tmpl"))
// 	.pipe(hbsPrecompile())
// 	.pipe(concat("templates.js"))
// 	.pipe(gulp.dest(jsDir));
function streamPrecompile(){
	return through.obj(function(inFile, enc, cb){
		
		var inFilePathInfo = path.parse(inFile.path);
		var filePath = path.join(inFilePathInfo.dir, inFilePathInfo.name + ".js");		

		// get the string content
		var content = ut8decoder.write(inFile.contents).toString();

		// get the parts (i.e. {name,content})

		precompile(filePath, content).then(function(resultContent){
			var file = new File({
				cwd: inFile.cwd,
				base: inFile.base,
				path: filePath,
				contents: new Buffer(resultContent)
			});

			// call the callback for the next step
			cb(null, file);			
		}).catch(function(ex){
			cb(ex, null);
		});

	});
}

// To use in a promise style (pure JS, async/await)
function precompile(filePath, content){
	return new Promise(function(resolve, fail){
		var parts = parseParts(filePath,content);

		// for each part, precompile and build the varLine
		var part;
		var resultContent = "";
		for (var i = 0; i < parts.length; i++){
			part = parts[i];
			var precompiledFunc = handlebars.precompile(part.content);	
			var varLine = buildVarLine(part.name, precompiledFunc);
			resultContent += varLine;
		}

		resolve(resultContent);
	});
}
// --------- /hbs plugin --------- //


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
