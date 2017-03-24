function GeolocateController(dependencies) {

    /// Dependencies   
    var _database;
    var _geoip;
    var _eventEmiter;
    var _geolocator;

    /// Properties


    var constructor = function (callback) {
        _database = dependencies.database;
        _geoip = dependencies.geoip;
        _eventEmiter = dependencies.eventEmiter;

        databaseConnect(function (result) {
            callback(result);
        })
    }

    var databaseConnect = function (callback) {
        _geoip.open('./geoip_db/GeoLite2-City.mmdb', (err, cityLookup) => {
            if (err) {
                _console.log('database failed to initialize' + err, 'error');
                callback(false);
            }
            else {

                _console.log('Geolocate module initialized', 'server-success');

                _geolocator = cityLookup;

                callback(true);
            }
        });
    }

    var locate = function (data, callback) {
        if (_geolocator != undefined) {
            if (data.IP != undefined) {
                var result = _geolocator.get(data.IP);
                if(result != null){
                    callback({ success: true, message: 'LocateIP', result: result });
                }
                else{
                    callback({ success: false, message: 'Something went wrong when try to geolocate your IP, try again.', result: null });
                }
            }
            else {
                callback({ success: false, message: 'Something went wrong when try to geolocate your IP, try again.', result: null });
            }
        }
        else {
            callback({ success: false, message: 'Something went wrong when try to geolocate your IP, try again.', result: null });
        }
    }


    return {
        Initialize: constructor,
        Locate: locate,
    }
}

module.exports = GeolocateController;