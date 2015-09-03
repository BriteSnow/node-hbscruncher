var gulp = require("gulp");
var hbsPrecompile = require('../index').precompile;
var should = require('chai').should();


describe('single', function() {

  it('single hbs', function(done) {
    //"hello".should.equal('hello');
    gulp.src('./test/*.hbs')
			.pipe(hbsPrecompile())
			.pipe(gulp.dest("./test/test-out/")).on("end",function(){
				console.log("done");
				done();
			});
  });

});