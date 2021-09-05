"use strict";

require("source-map-support/register");

const {
  Feature,
  Helpers: {
    requireConfig
  }
} = require('@genx/app');

const {
  ExternalServiceError
} = require('@genx/error');

const allApiMethods = ['clearExperienceId', 'clearExperienceIdHeader', 'directions', 'distancematrix', 'elevation', 'findPlaceFromText', 'geocode', 'geolocate', 'getExperienceId', 'nearestRoads', 'placeAutocomplete', 'placeDetails', 'placePhoto', 'placeQueryAutocomplete', 'placesNearby', 'reverseGeocode', 'setExperienceId', 'snapToRoads', 'textSearch', 'timezone'];
module.exports = {
  type: Feature.SERVICE,
  groupable: true,
  load_: async function (app, options, name) {
    requireConfig(app, options, ['apiKey'], name);
    const {
      clientOptions = {},
      apiKey,
      apiDefaultArgs
    } = options;
    const {
      Client,
      Status
    } = app.tryRequire('@googlemaps/google-maps-services-js');
    const client = new Client(clientOptions);

    const apiWrapper = name => async params => {
      let r;

      try {
        r = await client[name]({ ...apiDefaultArgs,
          params: { ...params,
            key: apiKey
          }
        });
      } catch (error) {
        throw ExternalServiceError(error.message);
      }

      if (r.data.status !== Status.OK) {
        const level = r.data.status === Status.ZERO_RESULTS ? 'warn' : 'error';
        app.log(level, `[${r.data.status}]${r.data.error_message}`, {
          data: r.data
        });
      }

      return r.data;
    };

    const service = allApiMethods.reduce((result, method) => {
      result[method + '_'] = apiWrapper(method);
      return result;
    }, {});
    app.registerService(name, service);
  }
};
//# sourceMappingURL=index.js.map