'use strict';

require('source-map-support/register');

const {
    Enums: { Feature },
    Helpers: { tryRequire },
} = require('@genx/app');

const { InvalidConfiguration } = require('@genx/error');

module.exports = {
    type: Feature.SERVICE,
    groupable: true,
    load_: async function (app, options, name) {
        const { clientOptions = {}, apiKey } = options;
        const { Client, Status } = tryRequire(
            '@googlemaps/google-maps-services-js'
        );
        const client = new Client(clientOptions);

        const handleResult = (r) => {
            if (r.data.status !== Status.OK) {
                let level =
                    r.data.status === Status.ZERO_RESULTS ? 'warn' : 'error';
                app.log(level, `[${r.data.status}]${r.data.error_message}`, {
                    data: r.data,
                });
            }

            return r.data;
        };

        const service = {
            geocode_: async (address, extra) =>
                handleResult(
                    await client.geocode({
                        params: {
                            address,
                            ...extra,
                            key: apiKey,
                        },
                    })
                ),
            placesNearby_: async (params) =>
                handleResult(
                    await client.placesNearby({
                        params: { ...params, key: apiKey },
                    })
                ),
            placeAutocomplete_: async (params) =>
                handleResult(
                    await client.placeAutocomplete({
                        params: { ...params, key: apiKey },
                    })
                ),
        };
        app.registerService('googleMap', service);
    },
};
//# sourceMappingURL=index.js.map
