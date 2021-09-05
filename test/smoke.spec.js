const testSuite = require("@genx/test");

testSuite(
    __filename,
    function (suite) {
        suite.testCase("smoke test", async function () {                 
            suite.startWorker_(async (app) => {
                const googleMaps = app.getService('googleMaps');
                should.exist(googleMaps);

                const result = await googleMaps.geocode_({ address: 'Bennelong Point, Sydney NSW 2000, Australia' });
                result.should.has.keys(['status', 'results']);
                result.status.should.be.exactly('OK');
                result.results.length.should.be.gt(0);
            });
        });
    }, 
    { verbose: true }
);
