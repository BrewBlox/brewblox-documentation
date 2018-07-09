const fs = require('fs');
const path = require('path');
const plantumlEncoder = require('plantuml-encoder');

const urlbase = 'http://www.plantuml.com/plantuml/png/';
let files = fs.readdirSync('uml/');
let urls = {};

files.forEach((f) => {
    let content = fs.readFileSync('uml/' + f, 'utf8');
    urls[path.basename(f)] = urlbase + plantumlEncoder.encode(content);
});

fs.writeFileSync(
    '.vuepress/generated/uml-urls.json',
    JSON.stringify(urls)
);
