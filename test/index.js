var gulp = require("gulp");
var hbs = require('../index');
var streamPrecompile = hbs.streamPrecompile;
var precompile = hbs.precompile;

var fs = require("fs");

// TODO: need to check output

describe('stream style', function () {

	it('all hbs', function (done) {
		//"hello".should.equal('hello');
		gulp.src('./test/*.hbs')
			.pipe(streamPrecompile())
			.pipe(gulp.dest("./test/test-out/stream-style/")).on("end", function () {
				done();
			});
	});

});

describe('promise style', function () {

	// should Include
	var shouldHave = "Handlebars.templates['ProjectListNav-list']";

	it('multiple.hbs', function (done) {
		readFile("./test/multiple.hbs", "utf8").then(function (content) {
			return precompile("./test/multiple.hbs", content);
		}).then(function (template) {
			if (!template.includes(shouldHave)) {
				done(`template does not contain ${shouldHave}\nTemplate:\n${template}`);
			} else {
				done();
			}
		}).catch(function (ex) {
			done(ex);
		});
	});

});


function readFile() {
	var args = Array.prototype.slice.call(arguments);

	return new Promise(function (resolve, fail) {
		args.push(function (err, content) {
			resolve(content);
		});
		fs.readFile.apply(fs, args);
	});

}