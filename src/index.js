const {
    Feature,
    Helpers: { requireConfig },
} = require('@genx/app');
const { ExternalServiceError } = require('@genx/error');

/**
 * Make google maps client as a @genx/app feature
 * @see {@link https://googlemaps.github.io/google-maps-services-js/classes/client.html|Google Maps JS API}
 * @module Feature_GoogleMaps
 */

const allApiMethods = [
    'clearExperienceId',
    'clearExperienceIdHeader',
    'directions',
    'distancematrix',
    'elevation',
    'findPlaceFromText',
    'geocode',
    'geolocate',
    'getExperienceId',
    'nearestRoads',
    'placeAutocomplete',
    'placeDetails',
    'placePhoto',
    'placeQueryAutocomplete',
    'placesNearby',
    'reverseGeocode',
    'setExperienceId',
    'snapToRoads',
    'textSearch',
    'timezone',
];

module.exports = {
    /**
     * This feature is loaded at service stage
     * @member {string}
     */
    type: Feature.SERVICE,

    /**
     * This feature can be grouped by serviceGroup
     * @member {boolean}
     */
    groupable: true,

    /**
     * Load the feature
     * @param {App} app - The app module object
     * @param {object} options - Options for the feature, from app config
     * @property {object} [options.clientOptions] - The client options.
     * @property {AxiosInstance} [options.clientOptions.axiosInstance] - AxiosInstance to be used by client. Provide one of axiosInstance or config.
     * @property {object} [options.clientOptions.config] - Config used to create AxiosInstance. Provide one of axiosInstance or config.
     * @property {array} [options.clientOptions.experienceId]
     * @param {string} options.apiKey - API key
     * @param {object} [options.apiDefaultArgs] - Default arguments for every API call
     * @param {string} name - Service name assigned by the service container
     * @returns {Promise.<*>}
     */
    load_: async function (app, options, name) {
        requireConfig(app, options, ['apiKey'], name);

        const { clientOptions = {}, apiKey, apiDefaultArgs } = options;
        const { Client, Status } = app.tryRequire(
            '@googlemaps/google-maps-services-js'
        );

        const client = new Client(clientOptions);
        const apiWrapper = (name) => async (params) => {
            let r;
            try {
                r = await client[name]({
                    ...apiDefaultArgs,
                    params: { ...params, key: apiKey },
                });
            } catch (error) {
                throw ExternalServiceError(error.message);
            }

            if (r.data.status !== Status.OK) {
                const level =
                    r.data.status === Status.ZERO_RESULTS ? 'warn' : 'error';
                app.log(level, `[${r.data.status}]${r.data.error_message}`, {
                    data: r.data,
                });
            }

            return r.data;
        };

        const service = allApiMethods.reduce((result, method) => {
            result[method + '_'] = apiWrapper(method);
            return result;
        }, {});

        app.registerService(name, service);
    },
};
