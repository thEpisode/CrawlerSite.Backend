function User(dependencies) {

    /// Dependencies
    var _mongoose;
    var _schema;

    /// Properties
    var _model;
    var _states;
    var _roles;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _schema = _mongoose.Schema;

        _states = {
            Inactive: 0,
            Active: 1,
            Trial: 2,
            Deleted: 3,
            Invited: 4
        }

        _roles = {
            Admin: 0,
            Viewer: 1
        }

        _model = _mongoose.model('User', new _schema(
            {
                _id: _schema.Types.ObjectId,
                StripeToken: String,
                CustomerId: String,
                PlanId: String,
                SubscriptionId: String,
                FirstNameCard: String,
                LastNameCard: String,
                FirstName: String,
                LastName: String,
                Email: String,
                Password: String,
                Work: [_schema.Types.Mixed],
                City: String,
                Country: String,
                AcceptTerms: Boolean,
                State: Number,
                Settings: [_schema.Types.Mixed],
                DashboardInsights: {
                    ClientsBehavior: [Number],
                    Heatmaps: {
                        PageViewsPerMonth: Number,
                        PageViewsLifeTime: Number,
                        MovementRegistersPerMonth: Number,
                        MovementRegistersLifeTime: Number,
                        ClickRegistersPerMonth: Number,
                        ClickRegistersPerLifeTime: Number,
                        ScrollRegistersPerMonth: Number,
                        ScrollRegistersLifeTime: Number,
                    },
                    RAT: {
                        UsersOnline: Number,
                        MinutesUsed: Number,
                        ConectionsSuccesfuly: Number
                    },
                    FormAnalysis: {
                        FormsAnalyzed: Number,
                        Issues: Number,
                        Success: Number,
                        NumberInputs: Number
                    },
                    Records: {
                        TotalMinutes: Number,
                        TotalRecords: Number,
                    }
                }
            },
            { timestamps: { createdAt: 'created_at' }, minimize: false, collection: 'User' }
        ));
    }

    var getModel = function () {
        return _model;
    }

    var getStates = function () {
        return _states;
    }

    var getRoles = function () {
        return _roles;
    }

    return {
        Initialize: constructor,
        GetModel: getModel,
        GetStates: getStates,
        GetRoles: getRoles
    }
}

module.exports = User;