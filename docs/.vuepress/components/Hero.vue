
<template>
  <div class="container">
    <div class="subcontainer">
      <div class="hero-card">
        <img
          :src="$withBase('/logo/logo-wordmark-light.svg')"
          class="logo my-lg"
        >
        <h2 class="hero-tagline">
          With Brewblox, <span class="you">you</span> are in control of your brewery.
        </h2>
        <div class="my-sm hero-text">
          BrewBlox is a platform to manage brewing processes in small and medium size breweries.
          We develop both software and hardware to help you build
          <span class="your">your</span> brewery <span class="your">your</span> way.
        </div>
      </div>
    </div>
    <div class="subcontainer">
      <img
        class="hero-img"
        src="../../images/conical-brewblox-screen.jpg"
      >
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import '../styles/colors.sass'

.container
  display: flex
  flex-flow: row wrap
  justify-content: center
  align-items: center
  margin: auto

.subcontainer
  padding-left: 24px
  padding-right: 24px

.hero-card
  width: 100%
  max-width: 640px
  min-width: 480px

.logo
  width: 100%
  max-width: 300px !important

.hero-img
  width: 640px
  max-width: 90vw
  max-height: 72vw

.hero-tagline
  font-size: 2rem

.hero-text
  color: $grey-13
  font-size: 1.1rem
  font-weight: 300
  line-height: 1.5rem
  letter-spacing: 0.03125em

.my-sm
  margin-top: 8px
  margin-bottom: 8px

.my-lg
  margin-top: 24px
  margin-bottom: 24px

.you
  font-weight: 700
  color: $blue-8

.your
  font-weight: 600
</style>
