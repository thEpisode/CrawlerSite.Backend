function Vote(dependencies) {

    /// Dependencies
    var _mongoose;
    var _schema;
    var _creditCard;

    /// Properties
    var _model;
    var _states;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _schema = _mongoose.Schema;
        _creditCard = dependencies.CreditCardController;

        _states = {
            Invalid: 0,
            Valid: 1,
        }

        _model = _mongoose.model('Vote', new _schema(
            {
                _id: _schema.Types.ObjectId,
                Feature: String,
                State: Number,
            },
            { timestamps: { createdAt: 'created_at' }, minimize: false, collection: 'Vote' }
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

module.exports = Vote;