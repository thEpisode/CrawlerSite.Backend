function CreditCard(dependencies) {

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

        _model = _mongoose.model('CreditCard', new _schema(
            {
                _id: _schema.Types.ObjectId,
                CreditCardToken: String,
                FirstNameCard: String,
                LastNameCard: String,
                State: Number
            },
            { timestamps: { createdAt: 'created_at' }, minimize: false, collection: 'CreditCard' }
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

module.exports = CreditCard;