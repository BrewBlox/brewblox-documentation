module.exports = {
    title: 'BrewBlox',
    description: 'Build your brewery, your way',
    themeConfig: {
        nav: [
            { text: 'User Guides', link: '/user/startup' },
            { text: 'Documentation', link: '/dev/' },
            { text: 'BrewPi', link: 'https://www.brewpi.com/' }
        ],
        sidebar: {
            '/dev/': [
                '',
                {
                    title: 'Contributing',
                    children: [
                        'contributing/docker',
                        'contributing/raspberry',
                    ]
                },
                {
                    title: 'Reference Documents',
                    children: [
                        'reference/event_logging',
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
                        'decisions/controlbox_spark_protocol',
                        'decisions/devcon_data_store',
                        'decisions/crosscompilation_revisited',
                        'decisions/dev_releases',
                        'decisions/orchestration',
                        'decisions/documentation_layout',
                        'decisions/block_synchronization',
                        'decisions/docker_image_cleaning',
                        'decisions/crosscompilation_base_images',
                    ]
                },
            ],
            '/user/': [
                'startup',
                'advanced',
                'compose',
                {
                    title: 'Example Configurations',
                    children: [
                        'examples/system',
                        'examples/simulation',
                        'examples/single_spark',
                    ]
                }
            ]
        },
        repo: 'brewblox/brewblox-documentation',
        lastUpdated: 'Last Updated',
        editLinks: true,
    }
};
