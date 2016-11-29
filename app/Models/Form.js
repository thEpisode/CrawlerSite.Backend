function Form(dependencies) {

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
            Deleted: 3,
        }

        _model = _mongoose.model('Form', new _schema(
            {
                ApiKey: String,
                Name: String,
                Tags: [String],
                Path: String,
                State: Number
            },
            { timestamps: { createdAt: 'created_at' }, minimize: false, collection: 'Form' }
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

module.exports = Form;