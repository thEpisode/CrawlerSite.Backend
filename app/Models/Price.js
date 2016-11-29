function Price(dependencies) {

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
            Active: 1
        }

        _model = _mongoose.model('Price', new _schema(
            {
                Feature: String,
                Price: String,
                Type: String,
                Description: [String],
                State: Number
            },
            { timestamps: { createdAt: 'created_at' }, minimize: false, collection: 'Price' }
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

module.exports = Price;