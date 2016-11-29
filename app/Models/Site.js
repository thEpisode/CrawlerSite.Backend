function Site(dependencies) {

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
            Inactive: 0,
            Active: 1,
            Suspended: 2,
            Deleted: 3,
        }

        _model = _mongoose.model('Site', new _schema(
            {
                UsersId: [String],
                Name: String,
                Url: String,
                Tags: [String],
                State: Number,
                ApiKey: String,
                DiscoveryMode: Boolean,
                Track: _schema.Types.Mixed
            },
            { timestamps: { createdAt: 'created_at' }, minimize: false, collection: 'Site' }
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

module.exports = Site;