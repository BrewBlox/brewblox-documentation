# Brewblox Documentation

## View the documentation at [https://brewblox.netlify.com](https://brewblox.netlify.com)

This is the code repository for the Brewblox documentation website. These docs are built with vuepress and written in markdown.


## Editing

Recommended tools:
- Visual Studio Code
- [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one) plugin.

You might want to add these lines to your user Settings:

```
"markdown.extension.toc.githubCompatibility": true,
"markdown.extension.preview.autoShowPreviewToSide": true,
"markdown.extension.print.absoluteImgPath": false
```

## Building

In the root of this repo, run:

```
npm install
```

To build the docs with hot reloading:

```
npm run dev
```

The docs will be served at `http://localhost:8080`
