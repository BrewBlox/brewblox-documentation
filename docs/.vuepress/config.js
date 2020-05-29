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
                        'tutorials/container_script',
                        'tutorials/serial_script',
                        'tutorials/publisher_script',
                        'tutorials/scheduled_script',
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
                        'decisions/component_definitions',
                        'decisions/block_stories',
                        'decisions/data_stories',
                        'decisions/subprojects',
                        'decisions/microservice_adjustments',
                        'decisions/communication_options',
                        'decisions/gateway_options',
                        'decisions/eventbus',
                        'decisions/concurrent_functionality',
                        'decisions/automated_release',
                        'decisions/docker_crosscompilation',
                        'decisions/rpi_docker_install',
                        'decisions/peer_configuration',
                        'decisions/devcon_data_store',
                        'decisions/crosscompilation_revisited',
                        'decisions/dev_releases',
                        'decisions/orchestration',
                        'decisions/documentation_layout',
                        'decisions/block_synchronization',
                        'decisions/docker_image_cleaning',
                        'decisions/crosscompilation_base_images',
                        'decisions/dynamic_ui_plugins',
                        'decisions/stable_releases',
                        'decisions/crud_component',
                        'decisions/dynamic_widgets',
                        'decisions/automation_service',
                        'decisions/crosscompilation_buildx',
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
        config
            .options
            .highlight(plantuml.highlight);
    }
};
