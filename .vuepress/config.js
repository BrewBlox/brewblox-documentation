module.exports = {
    title: 'BrewBlox',
    description: 'Build your brewery, your way',
    themeConfig: {
        nav: [
            { text: 'HOME', link: '/' },
            { text: 'ABOUT', link: '/user/about.md' },
            { text: 'BREWPI', link: 'https://www.brewpi.com/' }
        ],
        sidebar: [
            ['/', 'Home'],
            '/user/startup',
            '/user/features',
            {
                title: 'Getting Started: Development',
                children: [
                    '/dev/docker',
                    '/dev/raspberry',
                ]
            },
            {
                title: 'Project Documentation',
                children: [
                    '/stories/block_stories',
                    '/stories/data_stories',
                    '/tech_specs/component_definitions',
                    '/tech_specs/event_logging',
                    '/tech_specs/spark_commands',
                    '/tech_specs/subprojects'
                ]
            },
            {
                title: 'Research Documents',
                children: [
                    '/research/',
                    '/research/20180214_microservice_adjustments',
                    '/research/20180215_communication_options',
                    '/research/20180216_gateway_options',
                    '/research/20180217_eventbus',
                    '/research/20180218_concurrent_functionality',
                    '/research/20180301_automated_release',
                    '/research/20180314_docker_crosscompilation',
                    '/research/20180314_rpi_docker_install',
                    '/research/20180315_peer_configuration',
                    '/research/20180402_controlbox_spark_protocol',
                    '/research/20180410_devcon_data_store',
                    '/research/20180522_crosscompilation_revisited',
                    '/research/20180522_dev_releases',
                    '/research/20180703_orchestration',
                    '/research/20180706_documentation_layout',
                ]
            }
        ],
        lastUpdated: 'Last Updated',
    }
};
