function IPController(dependencies) {

    /// Dependencies   
    var _console;
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _console = dependencies.console;

        _entity = require('../Models/Ip')(dependencies);
        _entity.Initialize();
    }

    var createIP = function (data, next) {

        var ip = new _entity.GetModel()(
            {
                ApiKey: data.ApiKey,
                PublicIP: data.PublicIP,
                PrivateIPs: data.PrivateIPs,
                Name: data.Name,
                State: data.State
            });

        ip.save().then(function (result) {
            // When database return a result call the return
            if (result !== undefined && result !== null) {
                next({ success: true, message: 'CreateIP', result: result });
            }
            else {
                next({ success: false, message: 'Something went wrong while creating new IP', result: null });
            }
        }, function (err) {
            _console.log(err, 'error');
            next({ success: false, message: 'Something was wrong while creating new IP', result: null });
        })
    }

    var deleteIP = function (data, next) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next(false);
            }

            next(true);
        })
    }

    var getIPById = function (data, next) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getAllIPByApiKey = function (data, next) {
        _entity.GetModel().find({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getAllIP = function (data, next) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) {
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var editIp = function (data, next) {
        _entity.GetModel().findOneAndUpdate({ "_id": data._id }, { $set: { IP: data.IP, Name: data.Name } }, { upsert: false }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next(false);
            }

            next(true);
        })
    }

    var checkIfIPIsBlockedByApiKey = function (data, next) {
        _entity.GetModel().find({ "ApiKey": data.ApiKey, }, function (err, IPRresult) {
            if (err) {
                _console.log(err, 'error');
                next({
                    success: false,
                    message: `Something went wrong while retrieving IPs by Api Key`,
                    result: {
                        isBlocked: false
                    }
                })
            }
            else {
                if (IPRresult !== undefined && IPRresult !== null) {
                    console.log(`PublicIP: ${data.PublicIP}`);
                    console.log(`IPResult: ${IPRresult}`)
                    for (var i = 0; i < IPRresult.length; i++) {
                        var ip = IPRresult[i];
                        if (ip.PrivateIPs.length == 1) {
                            console.log('if (ip.PrivateIPs.length == 1)');
                            if (data.PublicIP === ip.PrivateIPs[0]) {
                                console.log('if (data.PublicIP === ip.PrivateIPs[0])');
                                next(searchIp(ip.PrivateIPs[0], data))
                            }
                        }
                        else {
                            console.log('not (ip.PrivateIPs.length == 1)');
                            var searchIpResult = {};
                            for (var i = 0; i < ip.PrivateIPs.length; i++) {
                                if (data.PublicIP === ip.PrivateIPs[i]) {
                                    searchIpResult = searchIp(ip.PrivateIPs[i], data);
                                    if (searchIpResult.result.isBlocked === true) {
                                        break;
                                    }
                                }
                            }
                            next(searchIpResult);
                        }
                    }
                }
                else {
                    next({
                        success: true,
                        message: `Not matching`,
                        result: {
                            isBlocked: false
                        }
                    })
                }
            }
        })
    }

    var searchIp = function (ip, data) {
        console.log(`ip: ${ip}`)
        console.log(`QueryIP: ${data.QueryIP}`)
        if (ip.indexOf('*') >= 0) {
            return {
                success: true,
                message: `Ip blocked`,
                result: {
                    isBlocked: true
                }
            };
        }
        else {
            if (ip === data.QueryIP) {
                return {
                    success: true,
                    message: `Ip blocked`,
                    result: {
                        isBlocked: true
                    }
                };
            }
            else {
                return {
                    success: true,
                    message: `Not matching`,
                    result: {
                        isBlocked: false
                    }
                };
            }
        }
    }

    var getEntity = function () {
        return _entity;
    }

    return {
        Initialize: constructor,
        CreateIP: createIP,
        DeleteIP: deleteIP,
        GetIPById: getIPById,
        GetAllIPByApiKey: getAllIPByApiKey,
        GetAllIP: getAllIP,
        EditIp: editIp,
        CheckIfIPIsBlockedByApiKey: checkIfIPIsBlockedByApiKey,
        Entity: getEntity
    }
}

module.exports = IPController;