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
                    AvailableCharts: [String],
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
                        SecondUsedPerMonth: Number,
                        SecondUsedLifeTime: Number,
                        ConectionsSuccesfuly: Number
                    },
                    FormAnalysis: {
                        FormsAnalyzedPerMonth: Number,
                        FormsAnalyzedLifeTime: Number,
                        IssuesPerMonth: Number,
                        IssuesLifeTime: Number,
                        Success: Number,
                        NumberInputs: Number
                    },
                    Records: {
                        TotalSecondsPerMonth: Number,
                        TotalSecondsLifeTime: Number,
                        TotalRecordsPerMonth: Number,
                        TotalRecordsLifeTime: Number,
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