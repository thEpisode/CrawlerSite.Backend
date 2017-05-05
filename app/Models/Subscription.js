function Subscription(dependencies) {

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
            Inactive: 0,
            Active: 1,
            Trialing: 2,
            Past_due: 3,
            Canceled: 4,
            Unpaid: 5
        }

        _model = _mongoose.model('Subscription', new _schema(
            {
                _id: _schema.Types.ObjectId,
                CustomerId: String,
                PlanId: String,
                CurrentPlan: _schema.Types.Mixed,
                SubscriptionId: String,
                State: Number,
                CreditCard: [{ type: _schema.Types.ObjectId, ref: 'CreditCard' }]
            },
            { timestamps: { createdAt: 'created_at' }, minimize: false, collection: 'Subscription' }
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

module.exports = Subscription;