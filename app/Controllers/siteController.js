function SiteController(dependencies) {

    /// Dependencies
    var _console;
    var _database;
    var _mongoose;
    var _uuid;

    /// Properties
    var _entity;

    var constructor = function () {
        _database = dependencies.database;
        _mongoose = dependencies.mongoose;
        _uuid = dependencies.uuid;
        _console = dependencies.console;

        _entity = require('../Models/Site')(dependencies);
        _entity.Initialize();
    }

    var createSite = function (data, next) {

        var site = new _entity.GetModel()(
            {
                //UsersId: data.UsersId,
                Name: data.Name,
                Url: data.Url,
                Tags: data.Tags,
                State: data.State,
                ApiKey: _uuid.v4(),
                DiscoveryMode: true,
                Track: {
                    IsParent: true,
                    Name: "Index",
                    Childs: []
                },
                Insights: {
                    AvailableCharts: ['PageViewsPerMonth', 'RATUsersOnline', 'WebFormsIssues', 'SecondsUsedPerMonth', 'UsersBehavior', 'FormAnalysis'],
                    Heatmaps: {
                        PageViewsPerMonth: 0,
                        PageViewsLifeTime: 0,
                        MovementRegistersPerMonth: 0,
                        MovementRegistersLifeTime: 0,
                        ClickRegistersPerMonth: 0,
                        ClickRegistersPerLifeTime: 0,
                        ScrollRegistersPerMonth: 0,
                        ScrollRegistersLifeTime: 0,
                        ClientsBehavior: {
                            H00: 0,
                            H01: 0,
                            H02: 0,
                            H03: 0,
                            H04: 0,
                            H05: 0,
                            H06: 0,
                            H07: 0,
                            H08: 0,
                            H09: 0,
                            H10: 0,
                            H11: 0,
                            H12: 0,
                            H13: 0,
                            H14: 0,
                            H15: 0,
                            H16: 0,
                            H17: 0,
                            H18: 0,
                            H19: 0,
                            H20: 0,
                            H21: 0,
                            H22: 0,
                            H23: 0
                        },
                    },
                    RAT: {
                        UsersOnline: 0,
                        SecondUsedPerMonth: 0,
                        SecondUsedLifeTime: 0,
                        ConectionsSuccesfuly: 0,
                        ClientsBehavior: {
                            H00: 0,
                            H01: 0,
                            H02: 0,
                            H03: 0,
                            H04: 0,
                            H05: 0,
                            H06: 0,
                            H07: 0,
                            H08: 0,
                            H09: 0,
                            H10: 0,
                            H11: 0,
                            H12: 0,
                            H13: 0,
                            H14: 0,
                            H15: 0,
                            H16: 0,
                            H17: 0,
                            H18: 0,
                            H19: 0,
                            H20: 0,
                            H21: 0,
                            H22: 0,
                            H23: 0
                        },
                    },
                    FormAnalysis: {
                        FormsAnalyzedPerMonth: 0,
                        FormsAnalyzedLifeTime: 0,
                        IssuesPerMonth: 0,
                        IssuesLifeTime: 0,
                        Success: 0,
                        NumberInputs: 0,
                        ClientsBehavior: {
                            H00: 0,
                            H01: 0,
                            H02: 0,
                            H03: 0,
                            H04: 0,
                            H05: 0,
                            H06: 0,
                            H07: 0,
                            H08: 0,
                            H09: 0,
                            H10: 0,
                            H11: 0,
                            H12: 0,
                            H13: 0,
                            H14: 0,
                            H15: 0,
                            H16: 0,
                            H17: 0,
                            H18: 0,
                            H19: 0,
                            H20: 0,
                            H21: 0,
                            H22: 0,
                            H23: 0
                        },
                    },
                    Records: {
                        TotalSecondsPerMonth: 0,
                        TotalSecondsLifeTime: 0,
                        TotalRecordsPerMonth: 0,
                        TotalRecordsLifeTime: 0,
                        ClientsBehavior: {
                            H00: 0,
                            H01: 0,
                            H02: 0,
                            H03: 0,
                            H04: 0,
                            H05: 0,
                            H06: 0,
                            H07: 0,
                            H08: 0,
                            H09: 0,
                            H10: 0,
                            H11: 0,
                            H12: 0,
                            H13: 0,
                            H14: 0,
                            H15: 0,
                            H16: 0,
                            H17: 0,
                            H18: 0,
                            H19: 0,
                            H20: 0,
                            H21: 0,
                            H22: 0,
                            H23: 0
                        },
                    }
                },
                BlockUserText: "You are blocked!",
            });

        site.save().then(function (siteResult) {
            _database.Subscription().GetSubscriptionByUserId({ UserId: data.UserId }, function (subscriptionResult) {
                if (subscriptionResult !== undefined && subscriptionResult !== null) {
                    _database.Subscription().AddSiteToSubscription({ SubscriptionId: subscriptionResult.result._id, SiteId: siteResult._id }, function (addUserToSubscriptionResult) {
                        if (addUserToSubscriptionResult !== undefined && addUserToSubscriptionResult !== null) {
                            next({ success: true, message: 'CreateSite', result: siteResult });
                        }
                        else {
                            next({ success: false, message: addUserToSubscriptionResult.message, result: null });
                        }
                    })
                }
                else {
                    next({ success: false, message: subscriptionResult.message, result: null });
                }
            });

        })
    }

    var deleteSite = function (data, next) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next(false);
            }

            next(true);
        })
    }

    var getSiteById = function (data, next) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getSiteByName = function (data, next) {
        _entity.GetModel().findOne({ "Name": data }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getSiteByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
            }

            next({ success: true, message: 'GetSiteByApiKey', result: result });
        })
    }

    var getAllSite = function (data, next) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) {
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getAllSitesByUserId = function (data, next) {
        _database.Subscription().GetAllSitesOfSubscriptionByUserId(data, function (result) {
            next(result);
        })
    }

    var editSite = function (data, next) {
        _entity.GetModel().findOneAndUpdate({ "_id": data._id }, { $set: { Url: data.Url, Name: data.Name, Tags: data.Tags } }, { upsert: false }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next(false);
            }

            next(true);
        })
    }

    var addScreenshotToChild = function (apiKey, screenshotId, endpoint, next) {
        var branches = [];

        if (endpoint == '/') { branches[0] = "Index" }
        else {
            endpoint = endpoint.replace('/', '');
            if (endpoint[endpoint.length - 1] == '/') { endpoint = endpoint.substring(0, endpoint.length - 1); }
            branches = endpoint.split('/')
        }

        _entity.GetModel().findOne({ "ApiKey": apiKey }, function (err, site) {
            if (err) {
                _console.log(err, 'error');
            }

            // Get first branch
            var lastBranch = searchBranch(site.Track, branches[branches.length - 1]);
            lastBranch.Screenshot = screenshotId;


            _entity.GetModel().findOneAndUpdate({ "ApiKey": apiKey }, { $set: { Track: site.Track } }, { upsert: false }, function (err, result) {
                if (err) {
                    _console.log(err, 'error');
                    next(false);
                }

                next(true);
            })
        })
    }

    var webCrawling = function (apiKey, endpoint, next) {
        var tree = {};
        var hasScreenshot;
        endpoint = endpoint.replace('/', '');
        if (endpoint[endpoint.length - 1] == '/') { endpoint = endpoint.substring(0, endpoint.length - 1); }
        var branches = endpoint.split('/');
        if (branches.length == 1) { branches[0] = "Index" }

        _entity.GetModel().findOne({ "ApiKey": apiKey }, function (err, site) {
            if (err) {
                _console.log(err, 'error');
            }

            var existBranch;

            // Get first branch
            var lastBranch = searchBranch(site.Track, branches[0]);

            // Verify if first branch is root
            if (lastBranch == null && branches[0].toLowerCase() === 'index') {
                site.Track.Name = branches[0];
                site.Track.Screenshot = "";
            }
            else {
                // Find if is a new path
                for (var i = 0; i < branches.length; i++) {
                    var currentBranch = searchBranch(site.Track, branches[i]);
                    // If branch not exist create new
                    if (currentBranch == null) {
                        var newChild = {
                            Name: branches[i],
                            Discovered: true,
                            Screenshot: "",
                            Childs: []
                        }
                        // If branch is in root
                        if (lastBranch == null && i == 0) {
                            site.Track.Childs.push(newChild);
                            lastBranch = searchBranch(site.Track, branches[i]);
                        }
                        else {
                            lastBranch.Childs.push(newChild);
                        }
                    }
                    else {
                        lastBranch = currentBranch;
                        if (i == (branches.length - 1)) { existBranch = true };
                    }
                }
            }

            if (existBranch) {
                if (lastBranch != null && lastBranch.Screenshot != undefined && lastBranch.Screenshot.length > 0) {
                    next(true);
                }
                else {
                    next(false);
                }
            }
            else {
                /// If not exist branch create into entity
                _entity.GetModel().findOneAndUpdate({ "ApiKey": apiKey }, { $set: { Track: site.Track } }, { upsert: false }, function (err, result) {
                    if (err) {
                        _console.log(err, 'error');
                    }

                    next(false);
                })

            }
        })
    }

    var createBranch = function (base, names) {
        for (var i = 0; i < names.length; i++) {
            base = base[names[i]] = base[names[i]] || {};
        }
    };

    /// Search an element by name in your own childs array property
    /// E.g.
    /// var site = {isparent:true, childs: [{name:"profile", discovered:true, screenshot: "...", childs: [{name:"me", discovered: true, screenshot:"..."}]}]}
    /// searchTree(site, 'me')
    var searchBranch = function (element, matchingTitle) {
        if (element.Name == matchingTitle) {
            return element;
        } else if (element.Childs != null) {
            var i;
            var result = null;
            for (i = 0; result == null && i < element.Childs.length; i++) {
                result = searchBranch(element.Childs[i], matchingTitle);
            }
            return result;
        }
        return null;
    }
    /// endpoint = 'Profile-me'
    var getSiteScreenshotIdByPathname = function (apiKey, endpoint, next) {

        var branches = endpoint.split('-');
        if (endpoint == '-') { branches = []; branches[0] = "Index" }

        _entity.GetModel().findOne({ "ApiKey": apiKey }, function (err, site) {
            if (err) {
                _console.log(err, 'error');
            }

            var branch = searchBranch(site.Track, branches[branches.length - 1]);
            if (branch !== null) {
                next(branch.Screenshot);
            }
            else {
                next(null);
            }
        });
    }

    var increasePageviewsHeatmaps = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                if (result != undefined && result != null) {
                    _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                        {
                            $set:
                            {
                                'Insights.Heatmaps.PageViewsLifeTime': ++(result.Insights.Heatmaps.PageViewsLifeTime),
                                'Insights.Heatmaps.PageViewsPerMonth': ++(result.Insights.Heatmaps.PageViewsPerMonth),
                            }
                        }, { upsert: false }, function (err, result) {
                            if (err) {
                                _console.log(err, 'error');
                                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                            }

                            next({ success: true, message: 'IncreasePageviewsHeatmapsInsights', result: result });
                        });
                }
            }
        });
    }

    var increaseMovementHeatmaps = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, siteResult) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                if (siteResult != undefined && siteResult != null) {
                    _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                        {
                            $set:
                            {
                                'Insights.Heatmaps.MovementRegistersPerMonth': ++(siteResult.Insights.Heatmaps.MovementRegistersPerMonth),
                                'Insights.Heatmaps.MovementRegistersLifeTime': ++(siteResult.Insights.Heatmaps.MovementRegistersLifeTime),
                            }
                        }, { upsert: false }, function (err, result) {
                            if (err) {
                                _console.log(err, 'error');
                                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                            }

                            next({ success: true, message: 'IncreaseMovementHeatmaps', result: result });
                        });
                }
                else {
                    next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                }
            }
        });
    }

    var increaseClickHeatmaps = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                if (result != undefined && result != null) {
                    _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                        {
                            $set:
                            {
                                'Insights.Heatmaps.ClickRegistersPerMonth': ++(result.Insights.Heatmaps.ClickRegistersPerMonth),
                                'Insights.Heatmaps.ClickRegistersPerLifeTime': ++(result.Insights.Heatmaps.ClickRegistersPerLifeTime),
                            }
                        }, { upsert: false }, function (err, result) {
                            if (err) {
                                _console.log(err, 'error');
                                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                            }

                            next({ success: true, message: 'IncreaseClickHeatmaps', result: result });
                        });
                }
            }
        });
    }

    var increaseScrollHeatmaps = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                if (result != undefined && result != null) {
                    _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                        {
                            $set:
                            {
                                'Insights.Heatmaps.ScrollRegistersPerMonth': ++(result.Insights.Heatmaps.ScrollRegistersPerMonth),
                                'Insights.Heatmaps.ScrollRegistersLifeTime': ++(result.Insights.Heatmaps.ScrollRegistersLifeTime),
                            }
                        }, { upsert: false }, function (err, result) {
                            if (err) {
                                _console.log(err, 'error');
                                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                            }

                            next({ success: true, message: 'IncreaseScrollHeatmaps', result: result });
                        });
                }
            }
        });
    }

    var getPageViewsHeatmapsByApiKey = function (data, next) {
        _entity.GetModel().aggregate([
            {
                $match: {
                    ApiKey: data.ApiKey
                }
            },
            {
                '$group': {
                    _id: '$GetPageViewsHeatmapsByApiKey',
                    TotalLifeTime: { $sum: '$Insights.Heatmaps.PageViewsLifeTime' },
                    TotalMonth: { $sum: '$Insights.Heatmaps.PageViewsPerMonth' }
                }
            }], function (err, result) {
                if (err) {
                    _console.log(err, 'error');
                    next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    next({ success: true, message: 'GetPageViewsHeatmapsByApiKey', result: result });
                }
            });
    }

    var getPageViewsHeatmapsByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetPageViewsHeatmapsByApiKeys',
                            TotalLifeTime: { $sum: '$Insights.Heatmaps.PageViewsLifeTime' },
                            TotalMonth: { $sum: '$Insights.Heatmaps.PageViewsPerMonth' }
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetPageViewsHeatmapsByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getMovementHeatmapsByApiKey = function (data, next) {
        _entity.GetModel().aggregate([
            {
                $match: {
                    ApiKey: data.ApiKey
                }
            },
            {
                '$group': {
                    _id: '$GetMovementHeatmapsByApiKey',
                    TotalLifeTime: { $sum: '$Insights.Heatmaps.MovementRegistersLifeTime' },
                    TotalMonth: { $sum: '$Insights.Heatmaps.MovementRegistersPerMonth' }
                }
            }], function (err, result) {
                if (err) {
                    _console.log(err, 'error');
                    next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    next({ success: true, message: 'GetMovementHeatmapsByApiKey', result: result });
                }
            });
    }

    var getMovementHeatmapsByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetMovementHeatmapsByApiKeys',
                            TotalLifeTime: { $sum: '$Insights.Heatmaps.MovementRegistersLifeTime' },
                            TotalMonth: { $sum: '$Insights.Heatmaps.MovementRegistersPerMonth' }
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetMovementHeatmapsByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getClickHeatmapsByApiKey = function (data, next) {
        _entity.GetModel().aggregate([
            {
                $match: {
                    ApiKey: data.ApiKey
                }
            },
            {
                '$group': {
                    _id: '$GetClickHeatmapsByApiKey',
                    TotalLifeTime: { $sum: '$Insights.Heatmaps.ClickRegistersPerMonth' },
                    TotalMonth: { $sum: '$Insights.Heatmaps.ClickRegistersPerLifeTime' }
                }
            }], function (err, result) {
                if (err) {
                    _console.log(err, 'error');
                    next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    next({ success: true, message: 'GetClickHeatmapsByApiKey', result: result });
                }
            });
    }

    var getClickHeatmapsByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetClickHeatmapsByApiKeys',
                            TotalLifeTime: { $sum: '$Insights.Heatmaps.ClickRegistersPerLifeTime' },
                            TotalMonth: { $sum: '$Insights.Heatmaps.ClickRegistersPerMonth' }
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetClickHeatmapsByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getScrollHeatmapsByApiKey = function (data, next) {
        _entity.GetModel().aggregate([
            {
                $match: {
                    ApiKey: data.ApiKey
                }
            },
            {
                '$group': {
                    _id: '$GetScrollHeatmapsByApiKey',
                    TotalLifeTime: { $sum: '$Insights.Heatmaps.ScrollRegistersPerMonth' },
                    TotalMonth: { $sum: '$Insights.Heatmaps.ScrollRegistersLifeTime' }
                }
            }], function (err, result) {
                if (err) {
                    _console.log(err, 'error');
                    next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    next({ success: true, message: 'GetScrollHeatmapsByApiKey', result: result });
                }
            });
    }

    var getScrollHeatmapsByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetScrollHeatmapsByApiKeys',
                            TotalLifeTime: { $sum: '$Insights.Heatmaps.ScrollRegistersLifeTime' },
                            TotalMonth: { $sum: '$Insights.Heatmaps.ScrollRegistersPerMonth' }
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetScrollHeatmapsByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var increaseUsersOnlineRATByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                if (result != undefined && result != null) {
                    _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                        {
                            $set:
                            {
                                'Insights.RAT.UsersOnline': ++(result.Insights.RAT.UsersOnline),
                            }
                        }, { upsert: false }, function (err, result) {
                            if (err) {
                                _console.log(err, 'error');
                                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                            }

                            next({ success: true, message: 'IncreaseUsersOnlineRAT', result: result });
                        });
                }
            }
        });
    }

    var decreaseUsersOnlineRATByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                if (result != undefined && result != null) {
                    _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                        {
                            $set:
                            {
                                'Insights.RAT.UsersOnline': --(result.Insights.RAT.UsersOnline),
                            }
                        }, { upsert: false }, function (err, result) {
                            if (err) {
                                _console.log(err, 'error');
                                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                            }

                            next({ success: true, message: 'DecreaseUsersOnlineRAT', result: result });
                        });
                }
            }
        });
    }

    var increaseRATTimeByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                if (result != undefined && result != null) {
                    _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                        {
                            $set:
                            {
                                'Insights.RAT.SecondUsedLifeTime': ++(result.Insights.RAT.SecondUsedLifeTime),
                                'Insights.RAT.SecondUsedPerMonth': ++(result.Insights.RAT.SecondUsedPerMonth),
                            }
                        }, { upsert: false }, function (err, result) {
                            if (err) {
                                _console.log(err, 'error');
                                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                            }

                            next({ success: true, message: 'IncreaseUsersOnlineRAT', result: result });
                        });
                }
            }
        });
    }

    var getRATUsersOnlineByApiKey = function (data, next) {
        _entity.GetModel().aggregate([
            {
                $match: {
                    ApiKey: data.ApiKey
                }
            },
            {
                '$group': {
                    _id: '$GetRATUsersOnlineByApiKey',
                    UsersOnline: { $sum: '$Insights.RAT.UsersOnline' },
                }
            }], function (err, result) {
                if (err) {
                    _console.log(err, 'error');
                    next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    next({ success: true, message: 'GetRATUsersOnlineByApiKey', result: result });
                }
            });
    }

    var getRATSecondsUsedByApiKey = function (data, next) {
        _entity.GetModel().aggregate([
            {
                $match: {
                    ApiKey: data.ApiKey
                }
            },
            {
                '$group': {
                    _id: '$GetRATSecondsUsedByApiKey',
                    SecondUsedPerMonth: { $sum: '$Insights.RAT.SecondUsedPerMonth' },
                    SecondUsedLifeTime: { $sum: '$Insights.RAT.SecondUsedLifeTime' },
                }
            }], function (err, result) {
                if (err) {
                    _console.log(err, 'error');
                    next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    next({ success: true, message: 'GetRATSecondsUsedByApiKey', result: result });
                }
            });
    }

    var getRATSucesfulyConnectionsByApiKey = function (data, next) {
        _entity.GetModel().aggregate([
            {
                $match: {
                    ApiKey: data.ApiKey
                }
            },
            {
                '$group': {
                    _id: '$GetRATSucesfulyConnectionsByApiKey',
                    ConectionsSuccesfuly: { $sum: '$Insights.RAT.ConectionsSuccesfuly' },
                }
            }], function (err, result) {
                if (err) {
                    _console.log(err, 'error');
                    next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    next({ success: true, message: 'GetRATSucesfulyConnectionsByApiKey', result: result });
                }
            });
    }

    var getRATUsersOnlineByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetRATUsersOnlineByApiKeys',
                            UsersOnline: { $sum: '$Insights.RAT.UsersOnline' },
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetRATUsersOnlineByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getRATSecondsUsedByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetRATSecondsUsedByApiKeys',
                            SecondUsedPerMonth: { $sum: '$Insights.RAT.SecondUsedPerMonth' },
                            SecondUsedLifeTime: { $sum: '$Insights.RAT.SecondUsedLifeTime' },
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetRATSecondsUsedByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getRATSucesfulyConnectionsByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetRATSucesfulyConnectionsByApiKeys',
                            ConectionsSuccesfuly: { $sum: '$Insights.RAT.ConectionsSuccesfuly' },
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetRATSucesfulyConnectionsByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    /*var updateFormsInsights = function (data, next) {
        next({ success: true, message: 'UpdateFormsInsights', result: result });
    }

    var updateRecordsInsights = function (data, next) {
        next({ success: true, message: 'UpdateRecordsInsights', result: result });
    }

    var updateClientsBehavior = function (data, next) {
        next({ success: true, message: 'UpdateClientsBehavior', result: result });
    }*/

    var getFormsAnalyzedByApiKey = function (data, next) {
        _entity.GetModel().aggregate([
            {
                $match: {
                    ApiKey: data.ApiKey
                }
            },
            {
                '$group': {
                    _id: '$GetFormsAnalyzedByApiKey',
                    FormsAnalyzedPerMonth: { $sum: '$Insights.FormAnalysis.FormsAnalyzedPerMonth' },
                    FormsAnalyzedLifeTime: { $sum: '$Insights.FormAnalysis.FormsAnalyzedLifeTime' },
                }
            }], function (err, result) {
                if (err) {
                    _console.log(err, 'error');
                    next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    next({ success: true, message: 'GetFormsAnalyzedByApiKey', result: result });
                }
            });
    }

    var getFormsAnalyzedByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetFormsAnalyzedByApiKeys',
                            SecondUsedPerMonth: { $sum: '$Insights.FormAnalysis.FormsAnalyzedPerMonth' },
                            SecondUsedLifeTime: { $sum: '$Insights.FormAnalysis.FormsAnalyzedPerMonth' },
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetFormsAnalyzedByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getFormIssuesByApiKey = function (data, next) {
        _entity.GetModel().aggregate([
            {
                $match: {
                    ApiKey: data.ApiKey
                }
            },
            {
                '$group': {
                    _id: '$GetFormIssuesByApiKey',
                    IssuesPerMonth: { $sum: '$Insights.FormAnalysis.IssuesPerMonth' },
                    IssuesLifeTime: { $sum: '$Insights.FormAnalysis.IssuesLifeTime' },
                }
            }], function (err, result) {
                if (err) {
                    _console.log(err, 'error');
                    next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    next({ success: true, message: 'GetFormIssuesByApiKey', result: result });
                }
            });
    }

    var getFormIssuesByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetFormIssuesByApiKeys',
                            IssuesPerMonth: { $sum: '$Insights.FormAnalysis.IssuesPerMonth' },
                            IssuesLifeTime: { $sum: '$Insights.FormAnalysis.IssuesPerMonth' },
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetFormIssuesByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getFormSuccessByApiKey = function (data, next) {
        _entity.GetModel().aggregate([
            {
                $match: {
                    ApiKey: data.ApiKey
                }
            },
            {
                '$group': {
                    _id: '$GetFormSuccessByApiKey',
                    Success: { $sum: '$Insights.FormAnalysis.Success' },
                }
            }], function (err, result) {
                if (err) {
                    _console.log(err, 'error');
                    next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    next({ success: true, message: 'GetFormSuccessByApiKey', result: result });
                }
            });

    }

    var getFormSuccessByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetFormSuccessByApiKeys',
                            SecondUsedPerMonth: { $sum: '$Insights.FormAnalysis.Success' },
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetFormSuccessByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }

    }

    var getFormNumberOfInputsByApiKey = function (data, next) {
        _entity.GetModel().aggregate([
            {
                $match: {
                    ApiKey: data.ApiKey
                }
            },
            {
                '$group': {
                    _id: '$GetFormNumberOfInputsByApiKey',
                    NumberInputs: { $sum: '$Insights.FormAnalysis.NumberInputs' },
                }
            }], function (err, result) {
                if (err) {
                    _console.log(err, 'error');
                    next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    next({ success: true, message: 'GetFormNumberOfInputsByApiKey', result: result });
                }
            });
    }

    var getFormNumberOfInputsByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetFormNumberOfInputsByApiKeys',
                            NumberInputs: { $sum: '$Insights.FormAnalysis.NumberInputs' },
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetFormNumberOfInputsByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getTotalSecondsRecordsByApiKey = function (data, next) {
        _entity.GetModel().aggregate([
            {
                $match: {
                    ApiKey: data.ApiKey
                }
            },
            {
                '$group': {
                    _id: '$GetTotalSecondsRecordsByApiKey',
                    TotalSecondsPerMonth: { $sum: '$Insights.Records.TotalSecondsPerMonth' },
                    TotalSecondsPerMonth: { $sum: '$Insights.Records.TotalSecondsPerMonth' },
                }
            }], function (err, result) {
                if (err) {
                    _console.log(err, 'error');
                    next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    next({ success: true, message: 'GetTotalSecondsRecordsByApiKey', result: result });
                }
            });
    }

    var getTotalSecondsRecordsByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetTotalSecondsRecordsByApiKeys',
                            TotalSecondsPerMonth: { $sum: '$Insights.Records.TotalSecondsPerMonth' },
                            TotalSecondsLifeTime: { $sum: '$Insights.Records.TotalSecondsLifeTime' },
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetTotalSecondsRecordsByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getTotalRecordsByApiKey = function (data, next) {
        _entity.GetModel().aggregate([
            {
                $match: {
                    ApiKey: data.ApiKey
                }
            },
            {
                '$group': {
                    _id: '$GetTotalRecordsByApiKey',
                    TotalRecordsPerMonth: { $sum: '$Insights.Records.TotalRecordsPerMonth' },
                    TotalRecordsPerMonth: { $sum: '$Insights.Records.TotalRecordsPerMonth' },
                }
            }], function (err, result) {
                if (err) {
                    _console.log(err, 'error');
                    next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    next({ success: true, message: 'GetTotalRecordsByApiKey', result: result });
                }
            });

    }

    var getTotalRecordsByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetTotalRecordsByApiKeys',
                            TotalRecordsPerMonth: { $sum: '$Insights.Records.TotalRecordsPerMonth' },
                            TotalRecordsLifeTime: { $sum: '$Insights.Records.TotalRecordsLifeTime' },
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetTotalRecordsByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getAvailableChartsByApiKey = function (apiKey, next) {
        _entity.GetModel().findOne({ "ApiKey": apiKey }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went error while retreiving available Charts', result: null });
            }

            if (result != undefined) {
                if (result != null) {
                    next({ success: true, message: 'GetAvailableChartsByApiKey', result: result.Insights.AvailableCharts });
                }
                else {
                    next({ success: false, message: 'We haven\'t available charts at this moment', result: null });
                }

            }
            else {
                next({ success: false, message: 'Something went error while retreiving available Charts', result: null });
            }
        })
    }

    function addZeroBefore(n) {
        return (n < 10 ? '0' : '') + n;
    }

    var increaseHeatmapClientsBehaviorByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, siteResult) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                if (siteResult != null) {
                    var hour = 'H' + addZeroBefore((new Date()).getHours());
                    var insertKey = 'Insights.Heatmaps.ClientsBehavior.' + hour;
                    var value2Insert = siteResult.updatedAt.getHours() < (new Date()).getHours() ? 1 : ++(siteResult.Insights.Heatmaps.ClientsBehavior[hour]);
                    var insertObj = {
                        [insertKey]: value2Insert,
                    }
                    _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                        {
                            $set: insertObj
                        }, { upsert: false }, function (err, result) {
                            if (err) {
                                _console.log(err, 'error');
                                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                            }

                            next({ success: true, message: 'IncreaseMovementHeatmaps', result: result });
                        });
                }
                else {
                    next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                }
            }
        });
    }

    var increaseRATClientsBehaviorByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, siteResult) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                if (siteResult != null) {
                    var hour = 'H' + addZeroBefore((new Date()).getHours());
                    var insertKey = 'Insights.Heatmaps.ClientsBehavior.' + hour;
                    var value2Insert = siteResult.updatedAt.getHours() < (new Date()).getHours() ? 1 : ++(siteResult.Insights.Heatmaps.ClientsBehavior[hour]);
                    var insertObj = {
                        [insertKey]: value2Insert,
                    }
                    _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                        {
                            $set: insertObj
                        }, { upsert: false }, function (err, result) {
                            if (err) {
                                _console.log(err, 'error');
                                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                            }

                            next({ success: true, message: 'IncreaseMovementHeatmaps', result: result });
                        });
                }
                else {
                    next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                }
            }
        });
    }

    var increaseFormAnalysisClientsBehaviorByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, siteResult) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                if (siteResult != null) {
                    var hour = 'H' + addZeroBefore((new Date()).getHours());
                    var insertKey = 'Insights.Heatmaps.ClientsBehavior.' + hour;
                    var value2Insert = siteResult.updatedAt.getHours() < (new Date()).getHours() ? 1 : ++(siteResult.Insights.Heatmaps.ClientsBehavior[hour]);
                    var insertObj = {
                        [insertKey]: value2Insert,
                    }
                    _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                        {
                            $set: insertObj
                        }, { upsert: false }, function (err, result) {
                            if (err) {
                                _console.log(err, 'error');
                                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                            }

                            next({ success: true, message: 'IncreaseMovementHeatmaps', result: result });
                        });
                }
                else {
                    next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                }
            }
        });
    }

    var increaseRecordsClientsBehaviorByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, siteResult) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                if (siteResult != null) {
                    var hour = 'H' + addZeroBefore((new Date()).getHours());
                    var insertKey = 'Insights.Heatmaps.ClientsBehavior.' + hour;
                    var value2Insert = siteResult.updatedAt.getHours() < (new Date()).getHours() ? 1 : ++(siteResult.Insights.Heatmaps.ClientsBehavior[hour]);
                    var insertObj = {
                        [insertKey]: value2Insert,
                    }
                    _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                        {
                            $set: insertObj
                        }, { upsert: false }, function (err, result) {
                            if (err) {
                                _console.log(err, 'error');
                                next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                            }

                            next({ success: true, message: 'IncreaseMovementHeatmaps', result: result });
                        });
                }
                else {
                    next({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                }
            }
        });
    }

    var getHeatmapClientsBehaviorByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went error while retreiving available Charts', result: null });
            }

            if (result != undefined) {
                if (result != null) {
                    next({ success: true, message: 'GetHeatmapClientsBehaviorByApiKey', result: result.Insights.Heatmaps.ClientsBehavior });
                }
                else {
                    next({ success: false, message: 'We haven\'t available data at this moment', result: null });
                }

            }
            else {
                next({ success: false, message: 'Something went error while retreiving available Charts', result: null });
            }
        });
    }

    var getRATClientsBehaviorByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went error while retreiving available Charts', result: null });
            }

            if (result != undefined) {
                if (result != null) {
                    next({ success: true, message: 'GetHeatmapClientsBehaviorByApiKey', result: result.Insights.RAT.ClientsBehavior });
                }
                else {
                    next({ success: false, message: 'We haven\'t available data at this moment', result: null });
                }

            }
            else {
                next({ success: false, message: 'Something went error while retreiving available Charts', result: null });
            }
        });
    }

    var getFormAnalysisClientsBehaviorByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went error while retreiving available Charts', result: null });
            }

            if (result != undefined) {
                if (result != null) {
                    next({ success: true, message: 'GetHeatmapClientsBehaviorByApiKey', result: result.Insights.FormAnalysis.ClientsBehavior });
                }
                else {
                    next({ success: false, message: 'We haven\'t available data at this moment', result: null });
                }

            }
            else {
                next({ success: false, message: 'Something went error while retreiving available Charts', result: null });
            }
        });
    }

    var getRecordsClientsBehaviorByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: 'Something went error while retreiving available Charts', result: null });
            }

            if (result != undefined) {
                if (result != null) {
                    next({ success: true, message: 'GetHeatmapClientsBehaviorByApiKey', result: result.Insights.Records.ClientsBehavior });
                }
                else {
                    next({ success: false, message: 'We haven\'t available data at this moment', result: null });
                }

            }
            else {
                next({ success: false, message: 'Something went error while retreiving available Charts', result: null });
            }
        });
    }

    var getHeatmapClientsBehaviorByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetHeatmapClientsBehaviorByApiKeys',
                            ClientsBehavior: { $sum: '$Insights.Heatmaps.ClientsBehavior' },
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetHeatmapClientsBehaviorByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getRATClientsBehaviorByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetHeatmapClientsBehaviorByApiKeys',
                            ClientsBehavior: { $sum: '$Insights.RAT.ClientsBehavior' },
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetHeatmapClientsBehaviorByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getFormAnalysisClientsBehaviorByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetHeatmapClientsBehaviorByApiKeys',
                            ClientsBehavior: { $sum: '$Insights.FormAnalysis.ClientsBehavior' },
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetHeatmapClientsBehaviorByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getRecordsClientsBehaviorByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            ApiKey: { $in: data.ApiKeys }
                        }
                    },
                    {
                        '$group': {
                            _id: '$GetHeatmapClientsBehaviorByApiKeys',
                            ClientsBehavior: { $sum: '$Insights.Records.ClientsBehavior' },
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetHeatmapClientsBehaviorByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getClientsBehaviorByApiKeys = function (data, next) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (Object.prototype.toString.call(data.ApiKeys) === '[object Array]') {
                //var sitesId = data.ApiKeys.map(function (id) { return _mongoose.Types.ObjectId(id) });

                _entity.GetModel().aggregate([
                    {
                        $match: {
                            $and: [
                                { ApiKey: { $in: data.ApiKeys } },
                                { created_at: { $lt: new Date() } }
                            ]

                        }
                    },
                    {
                        '$group': {
                            _id: '$GetHeatmapClientsBehaviorByApiKeys',
                            HeatmapsClientsBehavior: { $push: '$Insights.Heatmaps.ClientsBehavior' },
                            RATClientsBehavior: { $push: '$Insights.RAT.ClientsBehavior' },
                            FormAnalysisClientsBehavior: { $push: '$Insights.FormAnalysis.ClientsBehavior' },
                            RecordsClientsBehavior: { $push: '$Insights.Records.ClientsBehavior' },
                        }
                    }], function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
                            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            next({ success: true, message: 'GetClientsBehaviorByApiKeys', result: result });
                        }
                    });
            }
            else {
                next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            next({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var editBlockUserText = function (data, next) {
        _entity.GetModel().findOneAndUpdate({ "_id": data._id }, { $set: { BlockUserText: data.Text } }, { upsert: false }, function (err, editTextResult) {
            if (err) {
                _console.log(err, 'error');
                next({ success: false, message: `Something went wrong when retrieving site, try again`, result: null });
            }

            next({ success: true, message: `Text changed succesfuly`, result: editTextResult });
        })
    }

    var getEntity = function () {
        return _entity;
    }

    return {
        Initialize: constructor,
        CreateSite: createSite,
        DeleteSite: deleteSite,
        GetSiteById: getSiteById,
        GetSiteByName: getSiteByName,
        GetSiteByApiKey: getSiteByApiKey,
        GetAllSite: getAllSite,
        GetAllSitesByUserId: getAllSitesByUserId,
        EditSite: editSite,
        WebCrawling: webCrawling,
        AddScreenshotToChild: addScreenshotToChild,
        SearchBranch: searchBranch,
        GetSiteScreenshotIdByPathname: getSiteScreenshotIdByPathname,
        IncreasePageviewsHeatmaps: increasePageviewsHeatmaps,
        IncreaseMovementHeatmaps: increaseMovementHeatmaps,
        IncreaseClickHeatmaps: increaseClickHeatmaps,
        IncreaseScrollHeatmaps: increaseScrollHeatmaps,
        GetPageViewsHeatmapsByApiKey: getPageViewsHeatmapsByApiKey,
        GetPageViewsHeatmapsByApiKeys: getPageViewsHeatmapsByApiKeys,
        GetMovementHeatmapsByApiKey: getMovementHeatmapsByApiKey,
        GetMovementHeatmapsByApiKeys: getMovementHeatmapsByApiKeys,
        GetClickHeatmapsByApiKey: getClickHeatmapsByApiKey,
        GetClickHeatmapsByApiKeys: getClickHeatmapsByApiKeys,
        GetScrollHeatmapsByApiKey: getScrollHeatmapsByApiKey,
        GetScrollHeatmapsByApiKeys: getScrollHeatmapsByApiKeys,
        IncreaseUsersOnlineRATByApiKey: increaseUsersOnlineRATByApiKey,
        DecreaseUsersOnlineRATByApiKey: decreaseUsersOnlineRATByApiKey,
        IncreaseRATTimeByApiKey: increaseRATTimeByApiKey,
        /*UpdateFormsInsights: updateFormsInsights,
        UpdateRecordsInsights: updateRecordsInsights,
        UpdateClientsBehavior: updateClientsBehavior,*/
        GetRATUsersOnlineByApiKey: getRATUsersOnlineByApiKey,
        GetRATSecondsUsedByApiKey: getRATSecondsUsedByApiKey,
        GetRATSucesfulyConnectionsByApiKey: getRATSucesfulyConnectionsByApiKey,
        GetRATUsersOnlineByApiKeys: getRATUsersOnlineByApiKeys,
        GetRATSecondsUsedByApiKeys: getRATSecondsUsedByApiKeys,
        GetRATSucesfulyConnectionsByApiKeys: getRATSucesfulyConnectionsByApiKeys,
        GetFormsAnalyzedByApiKey: getFormsAnalyzedByApiKey,
        getFormsAnalyzedByApiKeys: getFormsAnalyzedByApiKeys,
        GetFormIssuesByApiKey: getFormIssuesByApiKey,
        GetFormIssuesByApiKeys: getFormIssuesByApiKeys,
        GetFormSuccessByApiKey: getFormSuccessByApiKey,
        GetFormSuccessByApiKeys: getFormSuccessByApiKeys,
        GetFormNumberOfInputsByApiKey: getFormNumberOfInputsByApiKey,
        GetFormNumberOfInputsByApiKeys: getFormNumberOfInputsByApiKeys,
        GetTotalSecondsRecordsByApiKey: getTotalSecondsRecordsByApiKey,
        GetTotalSecondsRecordsByApiKeys: getTotalSecondsRecordsByApiKeys,
        GetTotalRecordsByApiKey: getTotalRecordsByApiKey,
        GetTotalRecordsByApiKeys: getTotalRecordsByApiKeys,
        GetAvailableChartsByApiKey: getAvailableChartsByApiKey,
        IncreaseHeatmapClientsBehaviorByApiKey: increaseHeatmapClientsBehaviorByApiKey,
        IncreaseRATClientsBehaviorByApiKey: increaseRATClientsBehaviorByApiKey,
        IncreaseFormAnalysisClientsBehaviorByApiKey: increaseFormAnalysisClientsBehaviorByApiKey,
        IncreaseRecordsClientsBehaviorByApiKey: increaseRecordsClientsBehaviorByApiKey,
        GetHeatmapClientsBehaviorByApiKey: getHeatmapClientsBehaviorByApiKey,
        GetHeatmapClientsBehaviorByApiKeys: getHeatmapClientsBehaviorByApiKeys,
        GetRATClientsBehaviorByApiKey: getRATClientsBehaviorByApiKey,
        GetRATClientsBehaviorByApiKey: getRATClientsBehaviorByApiKey,
        GetFormAnalysisClientsBehaviorByApiKey: getFormAnalysisClientsBehaviorByApiKey,
        GetFormAnalysisClientsBehaviorByApiKeys: getFormAnalysisClientsBehaviorByApiKeys,
        GetRecordsClientsBehaviorByApiKey: getRecordsClientsBehaviorByApiKey,
        GetRecordsClientsBehaviorByApiKeys: getRecordsClientsBehaviorByApiKeys,
        GetClientsBehaviorByApiKeys: getClientsBehaviorByApiKeys,
        EditBlockUserText: editBlockUserText,
        Entity: getEntity
    }
}

module.exports = SiteController;