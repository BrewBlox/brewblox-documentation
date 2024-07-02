import { defineConfig } from 'vitepress';
import { SearchPlugin } from 'vitepress-plugin-search';
import { wrapHighlight } from './plantuml.mjs';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Brewblox',
  description: 'Build your brewery, your way',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/favicon-96x96.png',
    nav: [
      { text: 'Blog', link: '/blog/2021-06-30-this-is-the-brewblox-spark-4/' },
      { text: 'User guides', link: '/user/startup' },
      { text: 'Developer docs', link: '/dev/' },
      { text: 'Store', link: 'https://store.brewpi.com' },
      // Hardware section commented out for update / review Elco
      // { text: 'Hardware', link: '/hardware/' },
      // { text: 'BrewPi', link: 'https://www.brewpi.com/' },
    ],
    sidebar: {
      '/user/': [
        { text: 'Getting Started', link: '/user/startup' },
        {
          text: 'Fermentation Fridge',
          link: '/user/ferment_guide',
        },
        { text: 'Brewery Builder', link: '/user/brewery_builder' },
        { text: 'Control Chains', link: '/user/control_chains' },
        { text: 'Widgets', link: '/user/all_widgets' },
        { text: 'Blocks', link: '/user/all_blocks' },
        {
          text: 'Services',
          link: '/user/services/index',
          items: [
            { text: 'Brewblox Spark', link: '/user/services/spark' },
            {
              text: 'Brewblox Spark (Simulator)',
              link: '/user/services/spark_sim',
            },
            { text: 'Tilt Hydrometer', link: '/user/services/tilt' },
            { text: 'Plaato Digital Airlock', link: '/user/services/plaato' },
            { text: 'Grafana', link: '/user/services/grafana' },
          ],
        },
        { text: 'Blocks in Brewblox', link: '/user/blocks_architecture' },
        { text: 'Configuration Backups', link: '/user/backup_guide' },
        { text: 'Pi Alternatives', link: '/user/pi_alternatives' },
        { text: 'Remote Editor', link: '/user/config_editor' },
        { text: 'Wireguard VPN', link: '/user/wireguard' },
        { text: 'System Upgrades', link: '/user/system_upgrades' },
        { text: 'Removing Things', link: '/user/removing_things' },
        { text: 'Troubleshooting', link: '/user/troubleshooting' },
        { text: 'Release Notes', link: '/user/release_notes' },
      ],
      '/dev/': [
        {
          text: 'Development Platforms',
          link: '/dev/dev_platform',
        },
        { text: 'Python Environment Setup', link: '/dev/python_env' },
        { text: 'Common Issues', link: '/dev/common_issues' },
        { text: 'Deploying Scripts', link: '/dev/deployment' },
        { text: 'Analyzing Logs', link: '/dev/analyzing_logs' },
        { text: 'Sharing the Traefik Proxy', link: '/dev/subrouting' },
        {
          text: 'Tutorials',
          items: [
            {
              text: 'Docker: Create a Script',
              link: '/dev/tutorials/brewscript/',
            },
            {
              text: 'Docker: Read a Serial Port',
              link: '/dev/tutorials/serialscript/',
            },
            {
              text: 'Docker: Publish History Data',
              link: '/dev/tutorials/pubscript/',
            },
            {
              text: 'Docker: Use External Sensors',
              link: '/dev/tutorials/sensorscript/',
            },
            {
              text: 'Docker: Schedule Jobs',
              link: '/dev/tutorials/scheduledscript/',
            },
            {
              text: 'Node-RED: Setup',
              link: '/dev/tutorials/node_red_setup',
            },
            {
              text: 'Node-RED: Use Blocks',
              link: '/dev/tutorials/node_red_listening/',
            },
            {
              text: 'Node-RED: Publish History Data',
              link: '/dev/tutorials/node_red_publishing/',
            },
          ],
        },
        {
          text: 'Migrations',
          items: [
            {
              text: 'InfluxDB To Victoria Metrics',
              link: '/dev/migration/influxdb',
            },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Events', link: '/dev/reference/events' },
            {
              text: 'Events: History',
              link: '/dev/reference/history_events',
            },
            {
              text: 'Events: State',
              link: '/dev/reference/state_events',
            },
            {
              text: 'Service Events: Spark',
              link: '/dev/reference/spark_state',
            },
            { text: 'Service Events: Tilt', link: '/dev/reference/tilt_state' },
            { text: 'Block Data Types', link: '/dev/reference/block_types' },
            {
              text: 'Sequence Instructions',
              link: '/dev/reference/sequence_instructions',
            },
            { text: 'Blocks API', link: '/dev/reference/blocks_api' },
            { text: 'Datastore API', link: '/dev/reference/datastore' },
            { text: 'Service Routing', link: '/dev/reference/routing' },
            {
              text: 'Cbox Protocol',
              link: '/dev/reference/cbox',
            },
            {
              text: 'Service Env Options',
              link: '/dev/reference/service_env',
            },
            {
              text: 'System Architecture',
              link: '/dev/reference/architecture',
            },
          ],
        },
        {
          text: 'Design Decisions',
          collapsed: true,
          items: [
            // Decisions are sorted descending by date.
            {
              text: '2024: USB Proxy Service',
              link: '/dev/decisions/20240628_usb_proxy',
            },
            {
              text: '2024: Reflector Service',
              link: '/dev/decisions/20240620_reflector_service',
            },
            {
              text: '2024: Block Names on Controller',
              link: '/dev/decisions/20240513_block_name_storage',
            },
            {
              text: '2024: Firmware ReadMode',
              link: '/dev/decisions/20240510_cbox_read_mode',
            },
            {
              text: '2024: brewblox.yml',
              link: '/dev/decisions/20240326_brewblox_yml',
            },
            {
              text: '2024: Sequence Variables',
              link: '/dev/decisions/20240227_sequence_variables',
            },
            {
              text: '2024: Deep Block Patching',
              link: '/dev/decisions/20240123_deep_patching',
            },
            {
              text: '2023: Builder Reactivity',
              link: '/dev/decisions/20230123_builder_reactivity',
            },
            {
              text: '2022: Stored and Desired Block Settings',
              link: '/dev/decisions/20220922_desired_stored',
            },
            {
              text: '2022: Sequence Block',
              link: '/dev/decisions/20220527_sequence_block',
            },
            {
              text: '2021: Automation Service Replacements',
              link: '/dev/decisions/20211123_automation_replacements',
            },
            {
              text: '2021: Unifying brewblox-ctl',
              link: '/dev/decisions/20211101_unified_brewblox_ctl',
            },
            {
              text: '2021: Upgrading To Python 3.9',
              link: '/dev/decisions/20210929_python_upgrade',
            },
            {
              text: '2021: InfluxDB To Victoria Metrics',
              link: '/dev/decisions/20210718_victoria_metrics',
            },
            {
              text: '2021: Handling Volatile Widgets',
              link: '/dev/decisions/20210502_volatile_widgets',
            },
            {
              text: '2021: Using Vue Composition API',
              link: '/dev/decisions/20210502_composition',
            },
            {
              text: '2020: Automation Revision and Node-RED',
              link: '/dev/decisions/20201125_automation_revision',
            },
            {
              text: '2020: Spark Service State Machine',
              link: '/dev/decisions/20201008_devcon_connect_states',
            },
            {
              text: '2020: Redis Datastore',
              link: '/dev/decisions/20200902_redis_datastore',
            },
            {
              text: '2020: Avahi mDNS Reflection',
              link: '/dev/decisions/20200822_avahi_reflection',
            },
            {
              text: '2020: UI Implementation of Typed Objects',
              link: '/dev/decisions/20200804_ui_bloxfield',
            },
            {
              text: '2020: Automation Scripting Sandbox',
              link: '/dev/decisions/20200726_automation_sandbox',
            },
            {
              text: '2020: Serializing Type Information in Block Fields',
              link: '/dev/decisions/20200723_typed_fields',
            },
            {
              text: '2020: Replacing RabbitMQ',
              link: '/dev/decisions/20200606_replacing_rabbitmq',
            },
            {
              text: '2020: Eventbus Revisited: MQTT Events',
              link: '/dev/decisions/20200530_mqtt_events',
            },
            {
              text: '2020: Cross-compilation: Docker Buildx',
              link: '/dev/decisions/20200318_crosscompilation_buildx',
            },
            {
              text: '2019: Automation Service',
              link: '/dev/decisions/20191118_automation_service',
            },
            {
              text: '2019: Dynamic Widgets',
              link: '/dev/decisions/20191004_dynamic_widgets',
            },
            {
              text: '2019: CrudComponent Data Management',
              link: '/dev/decisions/20190625_crud_component',
            },
            {
              text: '2019: Stable Releases',
              link: '/dev/decisions/20190129_stable_releases',
            },
            {
              text: '2019: Dynamically Loading UI Plugins',
              link: '/dev/decisions/20190101_dynamic_ui_plugins',
            },
            {
              text: '2018: Cross-compilation: Base Images',
              link: '/dev/decisions/20181207_crosscompilation_base_images',
            },
            {
              text: '2018: Generating Clean Python Docker Images',
              link: '/dev/decisions/20181112_docker_image_cleaning',
            },
            {
              text: '2018: Block Synchronization',
              link: '/dev/decisions/20181102_block_synchronization',
            },
            {
              text: '2018: Documentation Layout',
              link: '/dev/decisions/20180706_documentation_layout',
            },
            {
              text: '2018: Container Orchestration',
              link: '/dev/decisions/20180703_orchestration',
            },
            {
              text: '2018: Development Releases',
              link: '/dev/decisions/20180522_dev_releases',
            },
            {
              text: '2018: Cross-compilation: Revisited',
              link: '/dev/decisions/20180522_crosscompilation_revisited',
            },
            {
              text: '2018: Spark Service Datastore Selection',
              link: '/dev/decisions/20180410_devcon_data_store',
            },
            {
              text: '2018: Microservice Peer Configuration',
              link: '/dev/decisions/20180315_peer_configuration',
            },
            {
              text: '2018: Raspberry Deployment',
              link: '/dev/decisions/20180314_rpi_docker_install',
            },
            {
              text: '2018: Docker Cross-compilation',
              link: '/dev/decisions/20180314_docker_crosscompilation',
            },
            {
              text: '2018: Automated Software Release',
              link: '/dev/decisions/20180306_automated_release',
            },
            {
              text: '2018: Concurrent Functionality',
              link: '/dev/decisions/20180221_concurrent_functionality',
            },
            {
              text: '2018: Event Handling',
              link: '/dev/decisions/20180220_eventbus',
            },
            {
              text: '2018: Microservice Communication',
              link: '/dev/decisions/20180216_communication_options',
            },
            {
              text: '2018: Gateway Service Options',
              link: '/dev/decisions/20180215_gateway_options',
            },
            {
              text: '2018: Microservice Design Adjustments for Brewblox',
              link: '/dev/decisions/20180215_microservice_adjustments',
            },
            {
              text: '2018: Brewblox Subprojects',
              link: '/dev/decisions/20180206_subprojects',
            },
            {
              text: '2018: User Stories: Data',
              link: '/dev/decisions/20180206_data_stories',
            },
            {
              text: '2018: User Stories: Blocks',
              link: '/dev/decisions/20180206_block_stories',
            },
            {
              text: '2018: Definitions and Mapping of GUI Entities',
              link: '/dev/decisions/20180206_component_definitions',
            },
          ],
        },
      ],
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/BrewBlox',
      },
      {
        icon: 'discord',
        link: 'https://discord.gg/WaFYD2jaaT',
      },
    ],
  },
  vite: {
    plugins: [SearchPlugin()],
  },
  markdown: {
    math: true,
    image: { lazyLoading: true },
    config: (md) => {
      const opts = md.options;
      // Pass the default function as backup to plantuml highlight
      opts.highlight = wrapHighlight(opts.highlight!);
    },
  },
});
