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
                        MinutesUsed: 0,
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

    var increasePageviewsHeatmapsInsights = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data.ApiKey }, function (err, result) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
            }
            else {
                _entity.GetModel().findOneAndUpdate({ "ApiKey": data.ApiKey }, 
                { $set: 
                    { 
                        'Insights.Heatmaps.PageViewsLifeTime': ++(result.Insights.Heatmaps.PageViewsLifeTime),
                        'Insights.Heatmaps.PageViewsPerMonth': ++(result.Insights.Heatmaps.PageViewsPerMonth),
                    } 
                }, { upsert: false }, function (err, result) {
                    if (err) {
                        console.log(err);
                        callback({ success: false, message: 'Something went wrong when updating insights, try again.', result: null });
                    }
                    console.log(result.Insights.Heatmaps)
                    callback({ success: true, message: 'IncreasePageviewsHeatmapsInsights', result: result });
                });
            }

        })

    }

    var updateRATInsights = function (data, callback) {
        callback({ success: true, message: 'UpdateRATInsights', result: result });
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
        IncreasePageviewsHeatmapsInsights: increasePageviewsHeatmapsInsights,
        UpdateRATInsights: updateRATInsights,
        UpdateFormsInsights: updateFormsInsights,
        UpdateRecordsInsights: updateRecordsInsights,
        UpdateClientsBehavior: updateClientsBehavior,
        Entity: getEntity
    }
}

module.exports = SiteController;