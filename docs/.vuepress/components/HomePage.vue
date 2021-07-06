<template>
  <div class="container-page">
    <div class="section hero">
      <Hero />
    </div>
    <div class="section features">
      <Features />
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import '../styles/colors.sass'

.container-page
  width: 100%
  max-width: 1400px
  display: flex
  flex-flow: row wrap
  justify-content: space-evenly
  align-items: center
  margin: auto

.section
  padding: calc(min(5vh, 100px)) 0px

.usecases
  background: lighten($blue-grey, 50%)
  min-height: 50vh
  border-radius: 8px

</style>
