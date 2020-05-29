const umlEncoder = require('plantuml-encoder');
const fs = require('fs');
const path = require('path');
const axios = require('axios');


const hashCode = s =>
    s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0)) | 0, 0);

const download = async (encoded, dest) => {
    const url = `https://www.plantuml.com/plantuml/png/${encoded}`;
    const writer = fs.createWriteStream(path.resolve(__dirname, 'public', dest));
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    });
}

const umlTitle = src => {
    const match = src.match(/@startuml (.*)/);
    return match && match[1]
        ? match[1].trim()
        : 'Diagram';
}

const highlight = (str, lang) => {
    // Intercept handling for 'plantuml' code blocks
    // We don't want to show the code, but the rendered result
    if (lang.trim() === 'plantuml') {
        const encoded = umlEncoder.encode(str);
        const title = umlTitle(str);
        const urlTitle = title.replace(/[^a-zA-Z0-9-_]/g, '_');
        const fname = `uml/${urlTitle}_${hashCode(encoded)}.png`;
        download(encoded, fname);
        return `<p><img src="/${fname}" title="${title}" alt="${title}"></img></p>`;
    }
    return '';
}

module.exports = {
    highlight
}