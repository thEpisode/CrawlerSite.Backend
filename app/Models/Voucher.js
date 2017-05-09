function Voucher(dependencies) {

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
            Redeemed: 0,
            Unremeeded: 1,
            Expired: 2,
        }

        _model = _mongoose.model('Voucher', new _schema(
            {
                _id: _schema.Types.ObjectId,
                StripeData: _schema.Types.Mixed,
                State: Number,
                SubscriptionId: { type: _schema.Types.ObjectId, ref: 'Subscription' },
            },
            { timestamps: { createdAt: 'created_at' }, minimize: false, collection: 'Voucher' }
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

module.exports = Voucher;