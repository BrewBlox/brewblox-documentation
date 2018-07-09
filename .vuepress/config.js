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
            '/user/examples',
            {
                title: 'Contributing',
                children: [
                    '/dev/contributing/docker',
                    '/dev/contributing/raspberry',
                ]
            },
            {
                title: 'Reference Documents',
                children: [
                    '/dev/reference/event_logging',
                    '/dev/reference/spark_commands',
                ]
            },
            {
                title: 'Design Decisions',
                children: [
                    '/dev/decisions/',
                    '/dev/decisions/component_definitions',
                    '/dev/decisions/block_stories',
                    '/dev/decisions/data_stories',
                    '/dev/decisions/subprojects',
                    '/dev/decisions/microservice_adjustments',
                    '/dev/decisions/communication_options',
                    '/dev/decisions/gateway_options',
                    '/dev/decisions/eventbus',
                    '/dev/decisions/concurrent_functionality',
                    '/dev/decisions/automated_release',
                    '/dev/decisions/docker_crosscompilation',
                    '/dev/decisions/rpi_docker_install',
                    '/dev/decisions/peer_configuration',
                    '/dev/decisions/controlbox_spark_protocol',
                    '/dev/decisions/devcon_data_store',
                    '/dev/decisions/crosscompilation_revisited',
                    '/dev/decisions/dev_releases',
                    '/dev/decisions/orchestration',
                    '/dev/decisions/documentation_layout',
                ]
            },
            {
                title: 'Changelog',
                children: []
            },
            '/links'
        ],
        repo: 'steersbob/brewblox-documentation',
        lastUpdated: 'Last Updated',
        docsBranch: 'feature/vuepress', // defaults to master
        editLinks: true,
    },
    configureWebpack: (config, isServer) => {
        config.module.rules.push({
            test: /LICENSE$/,
            use: 'raw-loader',
        });
        config.module.rules.push({
            test: /\.puml$/,
            use: 'raw-loader',
        });
    }
};
