function Cross(dependencies) {
    var _mongoConnectionString;
    var _flingerSecretJWT;
    var _mailgunApiKey = '';
    var _mailgunDomain = '';
    var _stripePK = '';

    var setSettings = function () {
        setFlingerSecretJWT(dependencies.config.FlingerSecretJWT);
        setMongoConnectionString(dependencies.config.MongoConnectionString);
        setMailUser(dependencies.config.MailUser);
        setMailPassword(dependencies.config.MailPassword);
        setMailDomain(dependencies.config.MailDomain);
        setMailPort(dependencies.config.MailPort);
        setMailEncryption(dependencies.config.MailEncryption);
        setStripePrivateKey(dependencies.config.StripePrivateKey);
    }

    var getMongoConnectionString = function () {
        return _mongoConnectionString;
    }

    var setMongoConnectionString = function (connectionString) {
        _mongoConnectionString = connectionString;
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

    /// Find an object into array by Id
    /// E.g.
    /// var objectResult = searchObjectByIdOnArray("someId", myArray)
    var searchObjectByIdOnArray = function (nameKey, _array) {
        for (var i = 0; i < _array.length; i++) {
            if (_array[i].Id === nameKey) {
                return _array[i];
            }
        }
        return null;
    }

    var normalizePort = function (val) {
        var port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    var setMailUser = function (user) {
        _mailUser = user;
    }

    var getMailUser = function () {
        return _mailUser;
    }

    var setMailPassword = function (password) {
        _mailPassword = password;
    }

    var getMailPassword = function () {
        return _mailPassword;
    }

    var setMailDomain = function (domain) {
        _mailDomain = domain;
    }

    var getMailDomain = function () {
        return _mailDomain;
    }

    var setMailPort = function (port) {
        _mailPort = port;
    }

    var getMailPort = function (port) {
        return _mailPort;
    }

    var setMailEncryption = function (encryption) {
        _mailEncription = encryption
    }

    var getMailEncryption = function () {
        return _mailEncription;
    }

    var setStripePrivateKey = function (privateKey) {
        _stripePK = privateKey;
    }

    var getStripePrivateKey = function () {
        return _stripePK;
    }

    var randomStringGenerator = function (length, prefix) {
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return (prefix == undefined ? '' : prefix) + Math.random().toString(36).substr(2, (length == undefined ? 5 : length));
    }

    return {
        SetSettings: setSettings,
        GetMongoConnectionString: getMongoConnectionString,
        GetFlingerSecretJWT: getFlingerSecretJWT,
        ObjectReferenceByDotStyle: objectReferenceByDotStyle,
        SearchObjectByIdOnArray: searchObjectByIdOnArray,
        NormalizePort: normalizePort,
        GetMailUser: getMailUser,
        GetMailPassword: getMailPassword,
        GetMailDomain: getMailDomain,
        GetMailPort: getMailPort,
        GetMailEncryption: getMailEncryption,
        GetStripePrivateKey: getStripePrivateKey,
        GetVoucherId: voucherIdGenerator,
        GetRandomString: randomStringGenerator,
    }
}

module.exports = Cross;