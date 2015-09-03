var gulp = require("gulp");
var hbscruncher = require('../index').hbscruncher;
var should = require('chai').should();


describe('single', function() {

  it('single hbs', function(done) {
    //"hello".should.equal('hello');
    gulp.src('./test/*.hbs')
			.pipe(hbscruncher())
			.pipe(gulp.dest("./test/test-out/")).on("end",function(){
				console.log("done");
				done();
			});
  });

});