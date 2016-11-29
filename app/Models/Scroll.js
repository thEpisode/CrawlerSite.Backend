function Scroll(dependencies) {

    /// Dependencies
    var _mongoose;
    var _schema;

    /// Properties
    var _model;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _schema = _mongoose.Schema;

        _model = _mongoose.model('Scroll', new _schema(
            {
                ApiKey: String,
                Event: {
                    Position: { X: Number, Y: Number },
                    TimeStamp: Number,
                    Client: _schema.Types.Mixed,
                    Location: _schema.Types.Mixed
                },
                Pathname: String,
                State: Number
            },
            { timestamps: { createdAt: 'created_at' }, minimize: false, collection: 'Scroll' }
        ));
    }

    var getModel = function () {
        return _model;
    }

    return {
        Initialize: constructor,
        GetModel: getModel
    }
}

module.exports = Scroll;