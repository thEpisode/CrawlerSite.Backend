function FrontEndReview(dependencies) {

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
            Unread: 0,
            Readed: 1,
        }

        _model = _mongoose.model('FrontEndReview', new _schema(
            {
                UserId: String,
                Path: String,
                Like: Boolean,
                ScreenshotId: String,
                Description: String,
                Logs: String,
                ReportBug: Boolean,
                Version: String
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

module.exports = FrontEndReview;