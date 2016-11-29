function Cross(dependencies) {

    var _socket;
    var _mongoConnectionString;
    var _flingerSecretJWT;

    var getSocket = function () {
        return _socket;
    }

    var getMongoConnectionString = function () {
        return _mongoConnectionString;
    }

    var setMongoConnectionString = function (connectionString) {
        _mongoConnectionString = connectionString;
    }

    var setSocket = function (socket) {
        _socket = socket;
    }

    var getFlingerSecretJWT = function () {
        return _flingerSecretJWT;
    }

    var setFlingerSecretJWT = function (secret) {
        _flingerSecretJWT = secret;
    }

    /// Find an object dynamically by dot style
    /// E.g.
    /// var objExample = {employee: { firstname: "camilo", job:{name:"driver"}}}
    /// findObject(objExample, 'employee.job.name')
    var objectReferenceByDotStyle = function (obj, is, value) {
        if (typeof is == 'string')
            return index(obj, is.split('.'), value);
        else if (is.length == 1 && value !== undefined)
            return obj[is[0]] = value;
        else if (is.length == 0)
            return obj;
        else
            return index(obj[is[0]], is.slice(1), value);
    }

    return {
        SetSocket: setSocket,
        GetSocket: getSocket,
        SetMongoConnectionString: setMongoConnectionString,
        GetMongoConnectionString: getMongoConnectionString,
        SetFlingerSecretJWT: setFlingerSecretJWT,
        GetFlingerSecretJWT: getFlingerSecretJWT,
        ObjectReferenceByDotStyle: objectReferenceByDotStyle
    }
}

module.exports = Cross;