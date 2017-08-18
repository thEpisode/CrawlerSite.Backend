function Ip(dependencies) {

    /// Dependencies
    var _mongoose;
    var _schema;

    /// Properties
    var _model;
    var _states;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _schema = _mongoose.Schema;

        _states = {
            Blocked: 0,
            Unblocked: 1,
            Deleted: 2,
        }

        _model = _mongoose.model('Ip', new _schema(
            {
                ApiKey: String,
                PublicIP: String,
                PrivateIPs:[String],
                Name: String,
                State: Number
            },
            { timestamps: { createdAt: 'created_at' }, minimize: false, collection: 'Ip' }
        ));
    }

    var getModel = function () {
        return _model;
    }

    var getStates = function () {
        return _states;
    }

    return {
        Initialize: constructor,
        GetModel: getModel,
        GetStates: getStates
    }
}

module.exports = Ip;