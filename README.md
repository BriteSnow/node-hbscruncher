## About

Simple gulp frienly node module to precompile handlebars File. Compared to the standard Handlebars node module precompile, it does support multiple templates per file (with the ```<script id="template_name">....</script>```. 

NOTE: Still experimental, not as a npm module yet. 

## Install

```js
npm install 
```



## Usage

```js
gulp.task('hbs', function() {
    gulp.src('*.hbs')
    .pipe(hbsCruncher())
    .pipe(gulp.dest("./js/"));
});
```

