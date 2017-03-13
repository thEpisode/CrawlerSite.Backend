function Site(dependencies) {

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
            Suspended: 2,
            Deleted: 3,
        }

        _model = _mongoose.model('Site', new _schema(
            {
                UsersId: [String],
                Name: String,
                Url: String,
                Tags: [String],
                State: Number,
                ApiKey: String,
                DiscoveryMode: Boolean,
                Track: _schema.Types.Mixed,
                Insights: {
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
            { timestamps: { createdAt: 'created_at' }, minimize: false, collection: 'Site' }
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

module.exports = Site;