window.BASE_CONFIG = {
    initial: {
        // To get the startfiles via api, setup the api paths here
        // if not set, the .jsons in the config get loaded
        // e.g.:
        // structure: '/get/structure',
        // translations: '/get/translations'
        defaultApi: {
            target: '/get',
            method: 'post'
        }
    },
    devmode: true,
    devApis: {
        // devPaths are only mapped when devmode === true
        '/get': '/config/mock-requests/get.json',
        '/get-second': {
            target: '/config/mock-requests/get-second.json',
            method: 'post'
        }
    }
}
