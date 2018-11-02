These docs are built with vuepress and written in markdown.

# Editing
For editing the docs Visual Studio Code with the "Markdown All in One" plugin works great.

You might want to add these lines to your user Settings:

```
"markdown.extension.toc.githubCompatibility": true,
"markdown.extension.preview.autoShowPreviewToSide": true,
"markdown.extension.print.absoluteImgPath": false
```

# Building
In the root of this repo, run:

```
npm install
```

To build the docs with hot reloading:

```
npm run dev
```

The docs will be served at http://localhost:8080


