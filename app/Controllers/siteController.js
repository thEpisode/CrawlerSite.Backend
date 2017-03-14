function SiteController(dependencies) {

    /// Dependencies   
    var _mongoose;
    var _uuid;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _uuid = dependencies.uuid;

        _entity = require('../Models/Site')(dependencies);
        _entity.Initialize();
    }

    var createSite = function (data, callback) {

        var site = new _entity.GetModel()(
            {
                UsersId: data.UsersId,
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
                    ClientsBehavior: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    Heatmaps: {
                        PageViewsPerMonth: 0,
                        PageViewsLifeTime: 0,
                        MovementRegistersPerMonth: 0,
                        MovementRegistersLifeTime: 0,
                        ClickRegistersPerMonth: 0,
                        ClickRegistersPerLifeTime: 0,
                        ScrollRegistersPerMonth: 0,
                        ScrollRegistersLifeTime: 0,
                    },
                    RAT: {
                        UsersOnline: 0,
                        SecondUsedPerMonth: 0,
                        SecondUsedLifeTime: 0,
                        ConectionsSuccesfuly: 0
                    },
                    FormAnalysis: {
                        FormsAnalyzed: 0,
                        Issues: 0,
                        Success: 0,
                        NumberInputs: 0
                    },
                    Records: {
                        TotalMinutes: 0,
                        TotalRecords: 0,
                    }
                }
            });

        site.save().then(function (result) {
            // When database return a result call the return
            callback(result);
        })
    }

    var deleteSite = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            if (err) {
                console.log(err);
                callback(false);
            }

            callback(true);
        })
    }

    var getSiteById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getSiteByName = function (data, callback) {
        _entity.GetModel().findOne({ "Name": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getSiteByApiKey = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getAllSite = function (data, callback) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getAllSitesByUserId = function (data, callback) {
        _entity.GetModel().find({ "UsersId": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var addUserToSite = function (data, callback) {
        _entity.GetModel().findOneAndUpdate({ "_id": data.SiteId }, { $push: { "UsersId": data.UserId } }, { safe: true, upsert: false }, function (err, result) {
            if (err) console.log(err);

            callback(result)
        })
    }

    var editSite = function (data, callback) {
        _entity.GetModel().findOneAndUpdate({ "_id": data._id }, { $set: { Url: data.Url, Name: data.Name, Tags: data.Tags } }, { upsert: false }, function (err, result) {
            if (err) {
                console.log(err);
                callback(false);
            }

            callback(true);
        })
    }

    var addScreenshotToChild = function (apiKey, fileId, endpoint, callback) {
        var branches = [];

        if (endpoint == '/') { branches[0] = "Index" }
        else {
            endpoint = endpoint.replace('/', '');
            if (endpoint[endpoint.length - 1] == '/') { endpoint = endpoint.substring(0, endpoint.length - 1); }
            branches = endpoint.split('/')
        }

        _entity.GetModel().findOne({ "ApiKey": apiKey }, function (err, site) {
            if (err) console.log(err);

            // Get first branch
            var lastBranch = searchBranch(site.Track, branches[branches.length - 1]);
            lastBranch.Screenshot = fileId;


            _entity.GetModel().findOneAndUpdate({ "ApiKey": apiKey }, { $set: { Track: site.Track } }, { upsert: false }, function (err, result) {
                if (err) {
                    console.log(err);
                    callback(false);
                }

                callback(true);
            })
        })
    }

    var webCrawling = function (apiKey, endpoint, callback) {
        var tree = {};
        var hasScreenshot;
        endpoint = endpoint.replace('/', '');
        if (endpoint[endpoint.length - 1] == '/') { endpoint = endpoint.substring(0, endpoint.length - 1); }
        var branches = endpoint.split('/');
        if (branches.length == 1) { branches[0] = "Index" }

        _entity.GetModel().findOne({ "ApiKey": apiKey }, function (err, site) {
            if (err) console.log(err);

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
                    callback(true);
                }
                else {
                    callback(false);
                }
            }
            else {
                /// If not exist branch create into entity
                _entity.GetModel().findOneAndUpdate({ "ApiKey": apiKey }, { $set: { Track: site.Track } }, { upsert: false }, function (err, result) {
                    if (err) {
                        console.log(err);
                    }

                    callback(false);
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
    var getSiteScreenshotIdByPathname = function (apiKey, endpoint, callback) {

        var branches = endpoint.split('-');
        if (endpoint == '-') { branches = []; branches[0] = "Index" }

        _entity.GetModel().findOne({ "ApiKey": apiKey }, function (err, site) {
            if (err) console.log(err);

            var branch = searchBranch(site.Track, branches[branches.length - 1]);
            if (branch !== null) {
                callback(branch.Screenshot);
            }
            else {
                callback(null);
            }
        });
    }

    var increasePageviewsHeatmaps = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                    {
                        $set:
                        {
                            'Insights.Heatmaps.PageViewsLifeTime': ++(result.Insights.Heatmaps.PageViewsLifeTime),
                            'Insights.Heatmaps.PageViewsPerMonth': ++(result.Insights.Heatmaps.PageViewsPerMonth),
                        }
                    }, { upsert: false }, function (err, result) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                        }
                        //console.log(result.Insights.Heatmaps)
                        callback({ success: true, message: 'IncreasePageviewsHeatmapsInsights', result: result });
                    });
            }
        });
    }

    var increaseMovementHeatmaps = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, siteResult) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                if (siteResult != null) {
                    _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                        {
                            $set:
                            {
                                'Insights.Heatmaps.MovementRegistersPerMonth': ++(siteResult.Insights.Heatmaps.MovementRegistersPerMonth),
                                'Insights.Heatmaps.MovementRegistersLifeTime': ++(siteResult.Insights.Heatmaps.MovementRegistersLifeTime),
                            }
                        }, { upsert: false }, function (err, result) {
                            if (err) {
                                console.log(err);
                                callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                            }
                            //console.log(result.Insights.Heatmaps)
                            callback({ success: true, message: 'IncreaseMovementHeatmaps', result: result });
                        });
                }
                else {
                    callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                }
            }
        });
    }

    var increaseClickHeatmaps = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                    {
                        $set:
                        {
                            'Insights.Heatmaps.ClickRegistersPerMonth': ++(result.Insights.Heatmaps.ClickRegistersPerMonth),
                            'Insights.Heatmaps.ClickRegistersPerLifeTime': ++(result.Insights.Heatmaps.ClickRegistersPerLifeTime),
                        }
                    }, { upsert: false }, function (err, result) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                        }
                        //console.log(result.Insights.Heatmaps)
                        callback({ success: true, message: 'IncreaseClickHeatmaps', result: result });
                    });
            }
        });
    }

    var increaseScrollHeatmaps = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                    {
                        $set:
                        {
                            'Insights.Heatmaps.ScrollRegistersPerMonth': ++(result.Insights.Heatmaps.ScrollRegistersPerMonth),
                            'Insights.Heatmaps.ScrollRegistersLifeTime': ++(result.Insights.Heatmaps.ScrollRegistersLifeTime),
                        }
                    }, { upsert: false }, function (err, result) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                        }
                        //console.log(result.Insights.Heatmaps)
                        callback({ success: true, message: 'IncreaseScrollHeatmaps', result: result });
                    });
            }
        });
    }

    var getPageViewsHeatmapsByApiKey = function (data, callback) {
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
                    console.log(err);
                    callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    callback({ success: true, message: 'GetPageViewsHeatmapsByApiKey', result: result });
                }
            });
    }

    var getPageViewsHeatmapsByApiKeys = function (data, callback) {
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
                            console.log(err);
                            callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            callback({ success: true, message: 'GetPageViewsHeatmapsByApiKeys', result: result });
                        }
                    });
            }
            else {
                callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getMovementHeatmapsByApiKey = function (data, callback) {
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
                    console.log(err);
                    callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    callback({ success: true, message: 'GetMovementHeatmapsByApiKey', result: result });
                }
            });
    }

    var getMovementHeatmapsByApiKeys = function (data, callback) {
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
                            console.log(err);
                            callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            callback({ success: true, message: 'GetMovementHeatmapsByApiKeys', result: result });
                        }
                    });
            }
            else {
                callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getClickHeatmapsByApiKey = function (data, callback) {
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
                    console.log(err);
                    callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    callback({ success: true, message: 'GetClickHeatmapsByApiKey', result: result });
                }
            });
    }

    var getClickHeatmapsByApiKeys = function (data, callback) {
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
                            console.log(err);
                            callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            callback({ success: true, message: 'GetClickHeatmapsByApiKeys', result: result });
                        }
                    });
            }
            else {
                callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var getScrollHeatmapsByApiKey = function (data, callback) {
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
                    console.log(err);
                    callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                }
                else {
                    callback({ success: true, message: 'GetScrollHeatmapsByApiKey', result: result });
                }
            });
    }

    var getScrollHeatmapsByApiKeys = function (data, callback) {
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
                            console.log(err);
                            callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
                        }
                        else {
                            callback({ success: true, message: 'GetScrollHeatmapsByApiKeys', result: result });
                        }
                    });
            }
            else {
                callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
            }
        }
        else {
            callback({ success: false, message: 'Something went wrong when retrieving insights, try again.', result: null });
        }
    }

    var increaseUsersOnlineRATByApiKey = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                    {
                        $set:
                        {
                            'Insights.RAT.UsersOnline': ++(result.Insights.RAT.UsersOnline),
                        }
                    }, { upsert: false }, function (err, result) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                        }
                        //console.log(result.Insights.Heatmaps)
                        callback({ success: true, message: 'IncreaseUsersOnlineRAT', result: result });
                    });
            }
        });
    }

    var decreaseUsersOnlineRATByApiKey = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                    {
                        $set:
                        {
                            'Insights.RAT.UsersOnline': --(result.Insights.RAT.UsersOnline),
                        }
                    }, { upsert: false }, function (err, result) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                        }
                        //console.log(result.Insights.Heatmaps)
                        callback({ success: true, message: 'DecreaseUsersOnlineRAT', result: result });
                    });
            }
        });
    }

    var increaseRATTimeByApiKey = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey },
                    {
                        $set:
                        {
                            'Insights.RAT.SecondUsedLifeTime': ++(result.Insights.RAT.SecondUsedLifeTime),
                            'Insights.RAT.SecondUsedPerMonth': ++(result.Insights.RAT.SecondUsedPerMonth),
                        }
                    }, { upsert: false }, function (err, result) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                        }
                        //console.log(result.Insights.Heatmaps)
                        callback({ success: true, message: 'IncreaseUsersOnlineRAT', result: result });
                    });
            }
        });
    }

    var updateFormsInsights = function (data, callback) {
        callback({ success: true, message: 'UpdateFormsInsights', result: result });
    }

    var updateRecordsInsights = function (data, callback) {
        callback({ success: true, message: 'UpdateRecordsInsights', result: result });
    }

    var updateClientsBehavior = function (data, callback) {
        callback({ success: true, message: 'UpdateClientsBehavior', result: result });
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
        AddUserToSite: addUserToSite,
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
        UpdateFormsInsights: updateFormsInsights,
        UpdateRecordsInsights: updateRecordsInsights,
        UpdateClientsBehavior: updateClientsBehavior,
        Entity: getEntity
    }
}

module.exports = SiteController;