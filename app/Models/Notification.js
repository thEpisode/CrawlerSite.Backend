function Notification(dependencies) {

    /// Dependencies
    var _mongoose;
    var _schema;

    /// Properties
    var _model;
    var _states;
    var _type;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _schema = _mongoose.Schema;

        _states = {
            unread: 0,
            Seen: 1,
            Hidden: 2,
            Deleted: 3,
        }

        _type = {
            billing: 0,
            site: 1,
            settings: 2,
            flinger: 3
        }

        _model = _mongoose.model('Notification', new _schema(
            {
                UserId: String,
                ShortMessage: { type: String, lowercase: false, trim: true },
                LongMessage: String,
                Uri: String,
                Type: Number,
                State: Number
            },
            { timestamps: { createdAt: 'created_at' }, minimize: false, collection: 'Notification' }
        ));
    }

    var getModel = function () {
        return _model;
    }

    var getStates = function () {
        return _states;
    }

    var getTypes = function () {
        return _type;
    }

    return {
        Initialize: constructor,
        GetModel: getModel,
        GetStates: getStates,
        GetTypes: getTypes
    }
}

module.exports = Notification;