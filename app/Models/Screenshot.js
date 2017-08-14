function Screenshot(dependencies) {

    /// Dependencies
    var _mongoose;
    var _schema;

    /// Properties
    var _model;
    var _screenshotType;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _schema = _mongoose.Schema;

        _screenshotType = {
            seen: 0,
            allPage: 1,
            partial: 2
        }

        _model = _mongoose.model('Screenshot', new _schema(
            {
                DocumentSize: {
                    height: Number,
                    width: Number
                },
                Timestamp: String,
                Screenshot: String,
                Endpoint: String,
                Type: Number,
                ApiKey: String,
                IsObsolete: Boolean,
            },
            { timestamps: { createdAt: 'created_at' }, minimize: false, collection: 'Screenshot' }
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

module.exports = Screenshot;