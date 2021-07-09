const plantuml = require('./plantuml');

module.exports = {
  title: 'Brewblox',
  description: 'Build your brewery, your way',
  plugins: [
    [
      'vuepress-plugin-mathjax',
      {
        target: 'svg',
        macros: {
          '*': '\\times',
        },
      },
    ],
  ],
  themeConfig: {
    logo: '/favicon-96x96.png',
    nav: [
      { text: 'User guides', link: '/user/startup' },
      { text: 'Developer docs', link: '/dev/' },
      // Hardware section commented out for update / review Elco
      { text: 'Hardware', link: '/hardware/' },
      { text: 'BrewPi', link: 'https://www.brewpi.com/' },
    ],
    sidebar: {
      '/dev/': [
        '',
        {
          title: 'Tutorials',
          children: [
            'tutorials/remote_scripts',
            'tutorials/brewscript/',
            'tutorials/serialscript/',
            'tutorials/pubscript/',
            'tutorials/scheduledscript/',
            'tutorials/subrouting',
            'tutorials/chronograf',
          ],
        },
        {
          title: 'Using brewblox-service',
          children: [
            'service/architecture',
            'service/profiling',
          ],
        },
        {
          title: 'Contributing',
          children: [
            'contributing/release_tools',
          ],
        },
        {
          title: 'Reference Documents',
          children: [
            'reference/events',
            'reference/history_events',
            'reference/influx_downsampling',
            'reference/state_events',
            'reference/spark_state',
            'reference/block_types',
            'reference/datastore',
            'reference/controlbox_spark_protocol',
            'reference/spark_commands',
          ],
        },
        {
          title: 'Design Decisions',
          children: [
            'decisions/',
            // Decisions are sorted descending by date.
            'decisions/20201125_automation_revision',
            'decisions/20201008_devcon_connect_states',
            'decisions/20200902_redis_datastore',
            'decisions/20200822_avahi_reflection',
            'decisions/20200804_ui_bloxfield',
            'decisions/20200726_automation_sandbox',
            'decisions/20200723_typed_fields',
            'decisions/20200606_replacing_rabbitmq',
            'decisions/20200530_mqtt_events',
            'decisions/20200318_crosscompilation_buildx',
            'decisions/20191118_automation_service',
            'decisions/20191004_dynamic_widgets',
            'decisions/20190625_crud_component',
            'decisions/20190129_stable_releases',
            'decisions/20190101_dynamic_ui_plugins',
            'decisions/20181207_crosscompilation_base_images',
            'decisions/20181112_docker_image_cleaning',
            'decisions/20181102_block_synchronization',
            'decisions/20180706_documentation_layout',
            'decisions/20180703_orchestration',
            'decisions/20180522_dev_releases',
            'decisions/20180522_crosscompilation_revisited',
            'decisions/20180410_devcon_data_store',
            'decisions/20180315_peer_configuration',
            'decisions/20180314_rpi_docker_install',
            'decisions/20180314_docker_crosscompilation',
            'decisions/20180306_automated_release',
            'decisions/20180221_concurrent_functionality',
            'decisions/20180220_eventbus',
            'decisions/20180216_communication_options',
            'decisions/20180215_gateway_options',
            'decisions/20180215_microservice_adjustments',
            'decisions/20180206_subprojects',
            'decisions/20180206_data_stories',
            'decisions/20180206_block_stories',
            'decisions/20180206_component_definitions',
          ],
        },
      ],
      '/user/': [
        'startup',
        'ferment_guide',
        'control_chains',
        'all_widgets',
        'all_blocks',
        'multiple_devices',
        'adding_spark',
        'adding_spark_sim',
        'connect_settings',
        'builder_guide',
        'automation_guide',
        'automation_sandbox',
        'backup_guide',
        'blocks_in_depth',
        'removing_things',
        'wireguard',
        'release_notes',
        'system_upgrades',
        'troubleshooting',
      ],
      // Hardware section commented out for review / update Elco
      '/hardware/': [
        'heating_elements',
        'spark_4_user_guide',
      ],
    },
    repo: 'brewblox/brewblox-documentation',
    docsDir: 'docs',
    docsBranch: 'develop',
    lastUpdated: 'Last Updated',
    editLinks: true,
  },
  chainMarkdown: config => {
    const opts = config.options;
    // Pass the default function as backup to plantuml highlight
    opts.set('highlight', plantuml.highlight(opts.get('highlight')));
  },
};
