const { promisify } = require('util');
const { precompile } = require('../index');
const assert = require('assert');
const fs = require("fs");


const readFile = promisify(fs.readFile);


describe('simple', async function () {

	// should Include
	const shouldHave = "Handlebars.templates['ProjectListNav-list']";

	const filePath = './test/multiple.hbs';
	const content = await readFile("./test/multiple.hbs", "utf8");
	const tmpl = await precompile(filePath, content);

	// check
	assert.strict(tmpl.includes(shouldHave), "Does not contain right template code");

});
