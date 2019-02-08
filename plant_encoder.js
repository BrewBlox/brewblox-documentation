const fs = require('fs');
const path = require('path');
const plantumlEncoder = require('plantuml-encoder');

const urlbase = 'https://www.plantuml.com/plantuml/png/';
let files = fs.readdirSync('docs/uml/');
let urls = {};

files.forEach((f) => {
    let content = fs.readFileSync('docs/uml/' + f, 'utf8');
    urls[path.basename(f)] = urlbase + plantumlEncoder.encode(content);
});

fs.writeFileSync(
    'docs/.vuepress/generated/uml-urls.json',
    JSON.stringify(urls, undefined, 2),
);
