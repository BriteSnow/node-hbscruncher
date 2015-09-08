## About

Simple gulp frienly node module to precompile handlebars File. Compared to the standard Handlebars node module precompile, it does support multiple templates per file (with the ```<script id="template_name">....</script>```. 

NOTE: Still experimental, not as a npm module yet. 

## Install

```js
npm install hbsp
```



## Usage

```js
var hbsPrecompile = require("hbs").precompile;

gulp.task('hbs', function() {
    gulp.src('*.hbs')
    .pipe(hbsPrecompile())
    .pipe(concat("templates.js"))
    .pipe(gulp.dest("./js/"));
});
```

*single.hbs*
```html
<p>Hello {{name}}</p>
```

*multiple.hbs*
```html
<script id="ProjectListNav" type="text/handlebars">
  <div class="ProjectListNav">
    <h2>Projects</h2>
    <div class="list-container">

    </div>
  </div>
</script>

<script id="ProjectListNav-list" type="text/handlebars">
  <ul>
    {{#each projects}}
    <li data-entity="Project" data-entity-id="{{id}}"><i class="icon-folder-close"></i>{{title}}</li>
    {{/each}}
  </ul>  
</script>
```


When including the *templates.js* you will get the following variables set as handlebars precompiled function: 

```js
Handlebars.templates['single']
Handlebars.templates['ProjectListNav']
Handlebars.templates['ProjectListNav-list'] 
```

Typically we have the following javascript before the templates.js

*1_render.js*
```js
// --------- Render --------- //
// Just a little indirection to render a template using handlebars.
// This simple indirection allows much flexibility later one, 
// when using pre-compiling or other templating engine are needed.

// The node.js hbsp process will put the precompile function in the Handlebars.templates
Handlebars.templates = Handlebars.templates || {};

$(function(){
    // Make all templates partials (no reason why they should not)
    // Note: We put this in a jQuery.ready to make sure the Handlebars.templates where loaded (as they should be loaded
    //       in the head). 
    //       This assumes the "templates.js" is loaded in the <head></head> (which is the case in our best practice)
    Handlebars.partials =  Handlebars.templates;    
});

// Global scope is acceptable for this very generic function (could be namespaced if it is the developer preference)
function render(templateName,data){
    var tmpl = Handlebars.templates[templateName];

    // if not found, try to get it from the DOM and assume the full handlebars
    if (!tmpl){
        var html = $("#" + templateName).html();
        if (!html){
            throw "Not template found in pre-compiled and in DOM for " + templateName;
        }
        tmpl = Handlebars.compile(html);
        Handlebars.templates[templateName] = tmpl;
    }

    // call the function and return the result
    return tmpl(data);
}
// --------- /Render --------- //
```
