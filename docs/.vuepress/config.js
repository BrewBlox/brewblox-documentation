const plantuml = require('./plantuml');
const crypto = require('crypto');

/**
 * From: https://stackoverflow.com/a/72219174
 *
 * The MD4 algorithm is not available anymore in Node.js 17+ (because of library SSL 3).
 * In that case, silently replace MD4 by the MD5 algorithm.
 */
try {
  crypto.createHash('md4');
} catch (e) {
  const origCreateHash = crypto.createHash;
  crypto.createHash = (alg, opts) => {
    return origCreateHash(alg === 'md4' ? 'md5' : alg, opts);
  };
}

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
      { text: 'Blog', link: '/blog/2021-06-30-this-is-the-brewblox-spark-4/' },
      { text: 'User guides', link: '/user/startup' },
      { text: 'Developer docs', link: '/dev/' },
      // Hardware section commented out for update / review Elco
      // { text: 'Hardware', link: '/hardware/' },
      { text: 'BrewPi', link: 'https://www.brewpi.com/' },
      { text: 'Discord', link: 'https://discord.gg/WaFYD2jaaT' },
    ],
    sidebar: {
      '/dev/': [
        '',
        {
          title: 'Tutorials',
          children: [
            'tutorials/dev_platform',
            'tutorials/deployment',
            'tutorials/analyzing_logs',
            'tutorials/brewscript/',
            'tutorials/serialscript/',
            'tutorials/pubscript/',
            'tutorials/sensorscript/',
            'tutorials/scheduledscript/',
            'tutorials/node_red_listening/',
            'tutorials/node_red_publishing/',
            'tutorials/subrouting',
          ],
        },
        {
          title: 'Migration tools',
          children: [
            'migration/influxdb',
          ],
        },
        {
          title: 'Using brewblox-service',
          children: [
            'service/python_env',
            'service/architecture',
            'service/profiling',
          ],
        },
        {
          title: 'Reference documents',
          children: [
            'reference/events',
            'reference/history_events',
            'reference/state_events',
            'reference/spark_state',
            'reference/tilt_state',
            'reference/block_types',
            'reference/blocks_api',
            'reference/datastore',
            'reference/routing',
            'reference/spark_communication',
            'reference/sequence_instructions',
          ],
        },
        {
          title: 'Design decisions',
          children: [
            'decisions/',
            // Decisions are sorted descending by date.
            'decisions/20230123_builder_reactivity',
            'decisions/20220922_desired_stored',
            'decisions/20220527_sequence_block',
            'decisions/20211123_automation_replacements',
            'decisions/20211101_unified_brewblox_ctl',
            'decisions/20210929_python_upgrade',
            'decisions/20210718_victoria_metrics',
            'decisions/20210502_volatile_widgets',
            'decisions/20210502_composition',
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
        'config_editor',
        'control_chains',
        'all_widgets',
        'all_blocks',
        'blocks_architecture',
        'brewery_builder',
        {
          title: 'Services',
          children: [
            'services/',
            'services/spark',
            'services/spark_sim',
            'services/tilt',
            'services/plaato',
            'services/grafana',
            'services/automation',
            'services/automation_sandbox',
          ],
        },
        'backup_guide',
        'pi_alternatives',
        'removing_things',
        'wireguard',
        'release_notes',
        'system_upgrades',
        'troubleshooting',
      ],
      // Hardware section commented out for review / update Elco
      // '/hardware/': [
      //   'heating_elements',
      // ],
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
