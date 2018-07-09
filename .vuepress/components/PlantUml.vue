<template>
<p>
    <img :src="url" :alt="title" :title="title">
</p>
</template>

<script>
const plantumlEncoder = require('plantuml-encoder')

module.exports = {
    props: {
        src: String,
        title: String,
    },
    computed: {
        url: function() {
            // console.log(this.src)
            if(this.src){
                const sourceFile = require("../../" + this.src);
                console.log(sourceFile)
                const encoded = plantumlEncoder.encode(sourceFile);
                console.log(encoded) 
                return "http://www.plantuml.com/plantuml/png/" + encoded;
            }
            else {
                return "";
            }
        }
    }
}
</script>
