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
                //UsersId: [String],
                Name: String,
                Url: String,
                Tags: [String],
                State: Number,
                ApiKey: String,
                DiscoveryMode: Boolean,
                Track: _schema.Types.Mixed,
                Insights: {
                    AvailableCharts: [String],
                    Heatmaps: {
                        PageViewsPerMonth: Number,
                        PageViewsLifeTime: Number,
                        MovementRegistersPerMonth: Number,
                        MovementRegistersLifeTime: Number,
                        ClickRegistersPerMonth: Number,
                        ClickRegistersPerLifeTime: Number,
                        ScrollRegistersPerMonth: Number,
                        ScrollRegistersLifeTime: Number,
                        ClientsBehavior: {
                            H00: Number,
                            H01: Number,
                            H02: Number,
                            H03: Number,
                            H04: Number,
                            H05: Number,
                            H06: Number,
                            H07: Number,
                            H08: Number,
                            H09: Number,
                            H10: Number,
                            H11: Number,
                            H12: Number,
                            H13: Number,
                            H14: Number,
                            H15: Number,
                            H16: Number,
                            H17: Number,
                            H18: Number,
                            H19: Number,
                            H20: Number,
                            H21: Number,
                            H22: Number,
                            H23: Number
                        },
                    },
                    RAT: {
                        UsersOnline: Number,
                        SecondUsedPerMonth: Number,
                        SecondUsedLifeTime: Number,
                        ConectionsSuccesfuly: Number, ClientsBehavior: {
                            H00: Number,
                            H01: Number,
                            H02: Number,
                            H03: Number,
                            H04: Number,
                            H05: Number,
                            H06: Number,
                            H07: Number,
                            H08: Number,
                            H09: Number,
                            H10: Number,
                            H11: Number,
                            H12: Number,
                            H13: Number,
                            H14: Number,
                            H15: Number,
                            H16: Number,
                            H17: Number,
                            H18: Number,
                            H19: Number,
                            H20: Number,
                            H21: Number,
                            H22: Number,
                            H23: Number
                        },
                    },
                    FormAnalysis: {
                        FormsAnalyzedPerMonth: Number,
                        FormsAnalyzedLifeTime: Number,
                        IssuesPerMonth: Number,
                        IssuesLifeTime: Number,
                        Success: Number,
                        NumberInputs: Number,
                        ClientsBehavior: {
                            H00: Number,
                            H01: Number,
                            H02: Number,
                            H03: Number,
                            H04: Number,
                            H05: Number,
                            H06: Number,
                            H07: Number,
                            H08: Number,
                            H09: Number,
                            H10: Number,
                            H11: Number,
                            H12: Number,
                            H13: Number,
                            H14: Number,
                            H15: Number,
                            H16: Number,
                            H17: Number,
                            H18: Number,
                            H19: Number,
                            H20: Number,
                            H21: Number,
                            H22: Number,
                            H23: Number
                        },
                    },
                    Records: {
                        TotalSecondsPerMonth: Number,
                        TotalSecondsLifeTime: Number,
                        TotalRecordsPerMonth: Number,
                        TotalRecordsLifeTime: Number,
                        ClientsBehavior: {
                            H00: Number,
                            H01: Number,
                            H02: Number,
                            H03: Number,
                            H04: Number,
                            H05: Number,
                            H06: Number,
                            H07: Number,
                            H08: Number,
                            H09: Number,
                            H10: Number,
                            H11: Number,
                            H12: Number,
                            H13: Number,
                            H14: Number,
                            H15: Number,
                            H16: Number,
                            H17: Number,
                            H18: Number,
                            H19: Number,
                            H20: Number,
                            H21: Number,
                            H22: Number,
                            H23: Number
                        },
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