function GeolocateController(dependencies) {

    /// Dependencies   
    var _database;
    var _geoip;
    var _eventEmiter;
    var _geolocator;
    var _console;

    /// Properties


    var constructor = function (next) {
        _database = dependencies.database;
        _geoip = dependencies.geoip;
        _eventEmiter = dependencies.eventEmiter;
        _console = dependencies.console;

        databaseConnect(function (result) {
            next(result);
        })
    }

    var databaseConnect = function (next) {
        _geoip.open('./geoip_db/GeoLite2-City.mmdb', (err, cityLookup) => {
            if (err) {
                _console.log('database failed to initialize' + err, 'error');
                next(false);
            }
            else {

                _console.log('Geolocate module initialized', 'server-success');

                _geolocator = cityLookup;

                next(true);
            }
        });
    }

    var locate = function (data, next) {
        if (_geolocator != undefined) {
            if (data.IP != undefined) {
                var result = _geolocator.get(data.IP);
                
                if(result != null){
                    next({ success: true, message: 'LocateIP', result: result });
                }
                else{
                    next({ success: false, message: 'Something went wrong when try to geolocate your IP, try again.', result: null });
                }
            }
            else {
                next({ success: false, message: 'Something went wrong when try to geolocate your IP, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when try to geolocate your IP, try again.', result: null });
        }
    }


    return {
        Initialize: constructor,
        Locate: locate,
    }
}

module.exports = GeolocateController;