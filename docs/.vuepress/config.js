const plantuml = require('./plantuml');

module.exports = {
    title: 'Brewblox',
    description: 'Build your brewery, your way',
    themeConfig: {
        logo: '/favicon-96x96.png',
        nav: [
            { text: 'User guides', link: '/user/startup' },
            { text: 'Developer docs', link: '/dev/' },
            { text: 'BrewPi', link: 'https://www.brewpi.com/' }
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
                    ],
                },
                {
                    title: 'Contributing',
                    children: [
                        'contributing/docker',
                        'contributing/raspberry',
                        'contributing/using_service',
                        'contributing/tools_tricks',
                        'contributing/release_tools',
                    ]
                },
                {
                    title: 'Reference Documents',
                    children: [
                        'reference/event_logging',
                        'reference/controlbox_spark_protocol',
                        'reference/spark_commands',
                    ]
                },
                {
                    title: 'Design Decisions',
                    children: [
                        'decisions/',
                        'decisions/20180206_component_definitions',
                        'decisions/20180206_block_stories',
                        'decisions/20180206_data_stories',
                        'decisions/20180206_subprojects',
                        'decisions/20180215_microservice_adjustments',
                        'decisions/20180215_gateway_options',
                        'decisions/20180216_communication_options',
                        'decisions/20180220_eventbus',
                        'decisions/20180221_concurrent_functionality',
                        'decisions/20180306_automated_release',
                        'decisions/20180314_docker_crosscompilation',
                        'decisions/20180314_rpi_docker_install',
                        'decisions/20180315_peer_configuration',
                        'decisions/20180410_devcon_data_store',
                        'decisions/20180522_crosscompilation_revisited',
                        'decisions/20180522_dev_releases',
                        'decisions/20180703_orchestration',
                        'decisions/20180706_documentation_layout',
                        'decisions/20181102_block_synchronization',
                        'decisions/20181112_docker_image_cleaning',
                        'decisions/20181207_crosscompilation_base_images',
                        'decisions/20190101_dynamic_ui_plugins',
                        'decisions/20190129_stable_releases',
                        'decisions/20190625_crud_component',
                        'decisions/20191004_dynamic_widgets',
                        'decisions/20191118_automation_service',
                        'decisions/20200318_crosscompilation_buildx',
                        'decisions/20200530_mqtt_events',
                    ]
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
                'backup_guide',
                'blocks_in_depth',
                'removing_things',
                'release_notes',
                'troubleshooting',
            ]
        },
        repo: 'brewblox/brewblox-documentation',
        docsDir: 'docs',
        lastUpdated: 'Last Updated',
        editLinks: true,
    },
    chainMarkdown: config => {
        const opts = config.options;
        // Pass the default function as backup to plantuml highlight
        opts.set('highlight', plantuml.highlight(opts.get('highlight')));
    }
};
