#! /bin/bash
set -e

# See: https://github.com/vuejs/vuepress/issues/2254

sed -i \
  's=^\([[:space:]]*\)fs\.emptyDirSync(tempPath)$=\1// fs\.emptyDirSync(tempPath)=g' \
  node_modules/@vuepress/core/lib/node/createTemp.js

# echo "Result:"
grep "fs.emptyDirSync" node_modules/@vuepress/core/lib/node/createTemp.js
