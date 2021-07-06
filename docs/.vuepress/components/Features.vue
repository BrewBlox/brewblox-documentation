<script>
import mdiChartBellCurveCumulative from 'vue-material-design-icons/ChartBellCurveCumulative.vue';
import mdiCloudOffOutline from 'vue-material-design-icons/CloudOffOutline.vue';
import mdiHexagonMultipleOutline from 'vue-material-design-icons/HexagonMultipleOutline.vue';
import mdiMonitorDashboard from 'vue-material-design-icons/MonitorDashboard.vue';
import mdiOpenSourceInitiative from 'vue-material-design-icons/OpenSourceInitiative.vue';
import mdiViewGridPlus from 'vue-material-design-icons/ViewGridPlus.vue';

export default {
  name: 'Features',
  components: {
    mdiChartBellCurveCumulative,
    mdiCloudOffOutline,
    mdiHexagonMultipleOutline,
    mdiMonitorDashboard,
    mdiOpenSourceInitiative,
    mdiViewGridPlus,
  },
};
</script>

<template>
  <div class="container">
    <div class="feature-card text-center">
      <mdiViewGridPlus class="icon" :size="80" />
      <div class="card-title pt-none">
        Flexible
      </div>
      <div class="card-text pt-none">
        BrewBlox lets you combine building blocks to fit it to your brewery.
        As your brewery evolves, Brewblox will change with it.
      </div>
    </div>
    <div class="feature-card text-center">
      <div>
        <mdiHexagonMultipleOutline class="icon" :size="80" />
      </div>
      <div class="card-title pt-none">
        Multiple processes
      </div>
      <div class="card-text pt-none">
        Multiple PIDs can be created on the BrewPi Spark, so it can replace multiple temperature controllers.
        The processes can be independent or linked.
      </div>
    </div>
    <div class="feature-card text-center">
      <div>
        <mdiMonitorDashboard class="icon" :size="80" />
      </div>
      <div class="card-title pt-none">
        One dashboard
      </div>
      <div class="card-text pt-none">
        All your brewing processes are managed through a central UI.
        You can create custom dashboards with process diagrams, graphs and notes.
      </div>
    </div>
    <div class="feature-card text-center">
      <div>
        <mdiChartBellCurveCumulative class="icon" :size="80" />
      </div>
      <div class="card-title pt-none">
        Charts of everything
      </div>

      <div class="card-text pt-none">
        Look back at mash and fermentation temperatures when you taste your beer. <br>
        With measurments off the entire process, you can perfect your recipes.
      </div>
    </div>
    <div class="feature-card text-center">
      <div>
        <mdiOpenSourceInitiative class="icon" :size="80" />
      </div>
      <div class="card-title pt-none">
        Open Source
      </div>

      <div class="card-text pt-none">
        Our code is open source and our platform is designed to easily integrate third-party functionality.
      </div>
    </div>
    <div class="feature-card text-center">
      <div>
        <mdiCloudOffOutline class="icon" :size="80" />
      </div>
      <div class="card-title pt-none">
        No cloud
      </div>

      <div class="card-text pt-none">
        Brewblox runs on a local webserver in your brewery.
        We think your brewery should not depend on a cloud service to run.
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
@import '../styles/colors.sass'

.container
  display: flex
  flex-flow: row wrap
  justify-content: center
  align-items: start
  margin: auto

.feature-card
  width: 300px
  margin: 30px

.icon
  color: $blue-grey-4
  margin: 20px

.card-title
  padding: 5px
  color: $grey-11
  font-weight: 450
  font-size: 1.4rem

.card-text
  font-size: 1rem
  font-weight: 300
  line-height: 1.5rem
  letter-spacing: 0.03125em

.pt-none
  padding-top: 0

.text-center
  text-align: center
</style>
