function InsightController(dependencies) {

    /// Dependencies   
    var _console;
    var _database;
    var _fileHandler;
    var _eventEmiter;

    /// Properties


    var constructor = function () {
        _database = dependencies.database;
        _fileHandler = dependencies.fileHandler;
        _eventEmiter = dependencies.eventEmiter;
        _console = dependencies.console;
    }

    var heatmapData = function (data, callback) {
        var result = []
        switch (data.Type.toLowerCase()) {
            case 'movement':
                _database.Movement().GetInsight(
                    data.ApiKey,
                    data.MinWidth,
                    data.MaxWidth,
                    data.MaxTime,
                    data.Flash,
                    data.Browser,
                    data.OperatingSystem,
                    data.Cookies,
                    data.Location,
                    data.Endpoint, function (result) {
                        if (result.length > 0) {
                            result = heatmapDataCalculation(result, 50, 10);
                            callback(result);
                        }
                        else {
                            callback(result);
                        }

                    });
                break;
            case 'click':
                _database.Click().GetInsight(
                    data.ApiKey,
                    data.MinWidth,
                    data.MaxWidth,
                    data.MaxTime,
                    data.Flash,
                    data.Browser,
                    data.OperatingSystem,
                    data.Cookies,
                    data.Location,
                    data.Endpoint, function (result) {
                        if (result.length > 0) {
                            result = heatmapDataCalculation(result, 50, 10);
                            callback(result);
                        }
                        else {
                            callback(result);
                        }
                    });
                break;
            case 'scroll':
                _database.Scroll().GetInsight(
                    data.ApiKey,
                    data.MinWidth,
                    data.MaxWidth,
                    data.MaxTime,
                    data.Flash,
                    data.Browser,
                    data.OperatingSystem,
                    data.Cookies,
                    data.Location,
                    data.Endpoint, function (result) {
                        if (result.length > 0) {
                            result = heatmapDataCalculation(result, 50, 10);
                            callback(result);
                        }
                        else {
                            callback(result);
                        }
                    });
                break;
            default:
                result = null;
                callback(result);
                break;
        }
    }

    var heatmapDataCalculation = function (data, intervalX, intervalY) {
        var grouped = [];

        data.forEach(function (a) {

            var keyX = Math.floor(a.Event.Position.X / intervalX),
                keyY = Math.floor(a.Event.Position.Y / intervalY),
                key = keyX + '|' + keyY;
            if (!this[key]) {
                this[key] = {
                    x: ((keyX * intervalX) + ((keyX + 1) * intervalX)) / 2,
                    //toX: (keyX + 1) * intervalX,
                    y: ((keyY * intervalY) + ((keyY + 1) * intervalY)) / 2,
                    //toY: (keyY + 1) * intervalY,
                    value: 0
                },
                    grouped.push(this[key]);
            }
            this[key].value++
        }, Object.create(null));

        return grouped;
    }

    var heatmapScreenshotByPathname = function (ApiKey, Pathname, callback) {
        _database.Site().GetSiteScreenshotByPathname(ApiKey, Pathname, function (result) {
            var id = result;
            _fileHandler.ReadFileById(result, function (stream) {
                callback(stream);
            })

        })
    }

    var heatmapScreenshotById = function (data, callback) {
        _database.Screenshot().GetScreenshotById(data, function (heatmapResult) {
            callback(heatmapResult);
        });
    }

    var dashboardInsightsByApiKey = function (data, callback) {
        if (data.ApiKey != undefined && data.ApiKey != null) {
            _database.Site().GetAvailableChartsByApiKey(data.ApiKey, function (availableResult) {
                "use strict";
                if (availableResult.success == true && availableResult.result != undefined) {
                    // simple event-driven state machine
                    const sm = new _eventEmiter();

                    let RequestCharts = availableResult.result;

                    // running state
                    let context = {
                        tasks: 0,    // number of total tasks
                        active: 0,    // number of active tasks
                        results: []    // task results
                    };

                    const next = (result) => { // must be called when each task chain completes

                        if (result != undefined && result != null) { // preserve result of task chain
                            context.results.push(result);
                        }
                        else {
                            context.results.push({ success: false, message: 'Chart not available', result: result });
                        }

                        // decrement the number of running tasks
                        context.active -= 1;

                        // when all tasks complete, trigger done state
                        if (!context.active) {
                            sm.emit('done');
                        }
                    };

                    // operational states
                    // start state - initializes context
                    sm.on('start', (charts) => {
                        const len = charts.length;

                        if (len > 0) {
                            //console.log(`start: beginning processing of ${len} charts`);

                            context.tasks = len;              // total number of tasks
                            context.active = len;             // number of active tasks

                            sm.emit('forEachCharts', charts);    // go to next state
                        }
                        else {
                            context.tasks = 0;
                            context.active = 0;
                            sm.emit('done');
                        }
                    });

                    // start processing of each path
                    sm.on('forEachCharts', (charts) => {

                        //console.log(`forEachCharts: starting ${charts.length} process chains`);

                        charts.forEach((chart) => sm.emit('getChart', chart));
                    });

                    // read contents from path
                    sm.on('getChart', (chart) => {

                        //console.log(`  getChart: ${chart}`);

                        switch (chart.toLowerCase()) {
                            case 'PageViewsPerMonth'.toLowerCase():
                                _database.Site().GetPageViewsHeatmapsByApiKey(data, function (result) {
                                    sm.emit('digestContent', result);
                                })
                                break;
                            case 'RATUsersOnline'.toLowerCase():
                                _database.Site().GetRATUsersOnlineByApiKey(data, function (result) {
                                    sm.emit('digestContent', result);
                                })
                                break;
                            case 'WebFormsIssues'.toLowerCase():
                                _database.Site().GetFormIssuesByApiKey(data, function (result) {
                                    sm.emit('digestContent', result);
                                })
                                break;
                            case 'SecondsUsedPerMonth'.toLowerCase():
                                _database.Site().GetTotalSecondsRecordsByApiKey(data, function (result) {
                                    sm.emit('digestContent', result);
                                })
                                break;
                            case 'UsersBehavior'.toLowerCase():
                            case 'WebFormsIssues'.toLowerCase():
                            default:
                                sm.emit('digestContent', null);
                                break;
                        }
                    });

                    // compute length of path contents
                    sm.on('digestContent', (content) => {

                        //console.log(`  digestContent`);

                        next(content);
                    });

                    // when processing is complete
                    sm.on('done', () => {

                        ///console.log(`The total of ${context.tasks}`);

                        if (context.tasks > 0 && context.active === 0) {
                            callback({ success: true, message: 'GetDashboardInsightsByApiKey', result: context.results })
                        }
                        else {
                            callback({ success: false, message: 'GetDashboardInsightsByApiKey', result: null })
                        }
                    });

                    // error state
                    sm.on('error', (err) => { throw err; });

                    // ======================================================
                    // start processing - ok, let's go
                    // ======================================================
                    sm.emit('start', RequestCharts);
                }
                else {
                    callback({ success: false, message: 'We haven\'t available charts at this moment', result: null });
                }
            })
        }
        else {
            callback({ success: false, message: 'DashboardInsightsByApiKey', result: null })
        }
    }

    var dashboardInsightsByApiKeys = function (data, callback) {
        if (data.ApiKeys != undefined && data.ApiKeys != null) {
            if (data.ApiKeys.length > 0) {
                _database.Site().GetAvailableChartsByApiKey(data.ApiKeys[0], function (availableResult) {
                    "use strict";
                    if (availableResult.success == true && availableResult.result != undefined) {
                        // simple event-driven state machine
                        const sm = new _eventEmiter();

                        let RequestCharts = availableResult.result;

                        // running state
                        let context = {
                            tasks: 0,    // number of total tasks
                            active: 0,    // number of active tasks
                            results: []    // task results
                        };

                        const next = (result) => { // must be called when each task chain completes

                            if (result != undefined && result != null) { // preserve result of task chain
                                context.results.push(result);
                            }
                            else {
                                context.results.push({ success: false, message: 'Chart not available', result: result });
                            }

                            // decrement the number of running tasks
                            context.active -= 1;

                            // when all tasks complete, trigger done state
                            if (!context.active) {
                                sm.emit('done');
                            }
                        };

                        // operational states
                        // start state - initializes context
                        sm.on('start', (charts) => {
                            const len = charts.length;

                            if (len > 0) {
                                context.tasks = len;              // total number of tasks
                                context.active = len;             // number of active tasks

                                sm.emit('forEachCharts', charts);    // go to next state
                            }
                            else {
                                context.tasks = 0;
                                context.active = 0;
                                sm.emit('done');
                            }
                        });

                        // start processing of each path
                        sm.on('forEachCharts', (charts) => {
                            charts.forEach((chart) => sm.emit('getChart', chart));
                        });

                        // read contents from path
                        sm.on('getChart', (chart) => {
                            switch (chart.toLowerCase()) {
                                case 'PageViewsPerMonth'.toLowerCase():
                                    _database.Site().GetPageViewsHeatmapsByApiKeys({ ApiKeys: data.ApiKeys }, function (result) {
                                        sm.emit('digestContent', result);
                                    })
                                    break;
                                case 'RATUsersOnline'.toLowerCase():
                                    _database.Site().GetRATUsersOnlineByApiKeys({ ApiKeys: data.ApiKeys }, function (result) {
                                        sm.emit('digestContent', result);
                                    })
                                    break;
                                case 'WebFormsIssues'.toLowerCase():
                                    _database.Site().GetFormIssuesByApiKeys({ ApiKeys: data.ApiKeys }, function (result) {
                                        sm.emit('digestContent', result);
                                    })
                                    break;
                                case 'SecondsUsedPerMonth'.toLowerCase():
                                    _database.Site().GetTotalSecondsRecordsByApiKeys({ ApiKeys: data.ApiKeys }, function (result) {
                                        sm.emit('digestContent', result);
                                    })
                                    break;
                                case 'UsersBehavior'.toLowerCase():
                                case 'WebFormsIssues'.toLowerCase():
                                default:
                                    sm.emit('digestContent', null);
                                    break;
                            }
                        });

                        // compute length of path contents
                        sm.on('digestContent', (content) => {
                            next(content);
                        });

                        // when processing is complete
                        sm.on('done', () => {
                            if (context.tasks > 0 && context.active === 0) {
                                callback({ success: true, message: 'GetDashboardInsightsByApiKey', result: context.results })
                            }
                            else {
                                callback({ success: false, message: 'GetDashboardInsightsByApiKey', result: null })
                            }
                        });

                        // error state
                        sm.on('error', (err) => { throw err; });

                        // ======================================================
                        // start processing - ok, let's go
                        // ======================================================
                        sm.emit('start', RequestCharts);
                    }
                    else {
                        callback({ success: false, message: 'We haven\'t available charts at this moment', result: null });
                    }
                })
            }
            else {
                callback({ success: false, message: 'DashboardInsightsByApiKeys', result: null })
            }
        }
        else {
            callback({ success: false, message: 'DashboardInsightsByApiKeys', result: null })
        }
    }

    var dashboardInsightsByUserId = function (data, callback) {
        if (data.UserId != undefined && data.UserId != null) {
            if (data.UserId.length > 0) {
                _database.Site().GetAllSitesByUserId(data, function (sitesResult) {
                    if (sitesResult != undefined && sitesResult != null) {
                        if (sitesResult.success === true) {
                            if (sitesResult.result.length > 0) {
                                var apiKeys = [];

                                sitesResult.result.forEach(function (value, index) {
                                    apiKeys.push(value.ApiKey);
                                });

                                _database.Site().GetAvailableChartsByApiKey(apiKeys[0], function (availableResult) {
                                    "use strict";
                                    if (availableResult.success == true && availableResult.result != undefined) {
                                        // simple event-driven state machine
                                        const sm = new _eventEmiter();

                                        let RequestCharts = availableResult.result;

                                        // running state
                                        let context = {
                                            tasks: 0,    // number of total tasks
                                            active: 0,    // number of active tasks
                                            results: []    // task results
                                        };

                                        const next = (result) => { // must be called when each task chain completes

                                            if (result != undefined && result != null) { // preserve result of task chain
                                                context.results.push(result);
                                            }
                                            else {
                                                context.results.push({ success: false, message: 'Chart not available', result: result });
                                            }

                                            // decrement the number of running tasks
                                            context.active -= 1;

                                            // when all tasks complete, trigger done state
                                            if (!context.active) {
                                                sm.emit('done');
                                            }
                                        };

                                        // operational states
                                        // start state - initializes context
                                        sm.on('start', (charts) => {
                                            const len = charts.length;

                                            if (len > 0) {
                                                context.tasks = len;              // total number of tasks
                                                context.active = len;             // number of active tasks

                                                sm.emit('forEachCharts', charts);    // go to next state
                                            }
                                            else {
                                                context.tasks = 0;
                                                context.active = 0;
                                                sm.emit('done');
                                            }
                                        });

                                        // start processing of each path
                                        sm.on('forEachCharts', (charts) => {
                                            charts.forEach((chart) => sm.emit('getChart', chart));
                                        });

                                        // read contents from path
                                        sm.on('getChart', (chart) => {
                                            switch (chart.toLowerCase()) {
                                                case 'PageViewsPerMonth'.toLowerCase():
                                                    _database.Site().GetPageViewsHeatmapsByApiKeys({ ApiKeys: apiKeys }, function (result) {
                                                        sm.emit('digestContent', result);
                                                    })
                                                    break;
                                                case 'RATUsersOnline'.toLowerCase():
                                                    _database.Site().GetRATUsersOnlineByApiKeys({ ApiKeys: apiKeys }, function (result) {
                                                        sm.emit('digestContent', result);
                                                    })
                                                    break;
                                                case 'WebFormsIssues'.toLowerCase():
                                                    _database.Site().GetFormIssuesByApiKeys({ ApiKeys: apiKeys }, function (result) {
                                                        sm.emit('digestContent', result);
                                                    })
                                                    break;
                                                case 'SecondsUsedPerMonth'.toLowerCase():
                                                    _database.Site().GetTotalSecondsRecordsByApiKeys({ ApiKeys: apiKeys }, function (result) {
                                                        sm.emit('digestContent', result);
                                                    })
                                                    break;
                                                case 'UsersBehavior'.toLowerCase():
                                                    _database.Site().GetClientsBehaviorByApiKeys({ ApiKeys: apiKeys }, function (result) {
                                                        sm.emit('digestContent', result);
                                                    })
                                                    break;
                                                case 'WebFormsIssues'.toLowerCase():
                                                default:
                                                    sm.emit('digestContent', null);
                                                    break;
                                            }
                                        });

                                        // compute length of path contents
                                        sm.on('digestContent', (content) => {
                                            next(content);
                                        });

                                        // when processing is complete
                                        sm.on('done', () => {
                                            if (context.tasks > 0 && context.active === 0) {
                                                callback({ success: true, message: 'GetDashboardInsightsByApiKey', result: context.results })
                                            }
                                            else {
                                                callback({ success: false, message: 'GetDashboardInsightsByApiKey', result: null })
                                            }
                                        });

                                        // error state
                                        sm.on('error', (err) => { throw err; });

                                        // ======================================================
                                        // start processing - ok, let's go
                                        // ======================================================
                                        sm.emit('start', RequestCharts);
                                    }
                                    else {
                                        callback({ success: false, message: 'We haven\'t available charts at this moment', result: null });
                                    }
                                });
                            }
                            else {
                                callback({ success: true, message: 'GetDashboardInsightsByApiKey', result: null })
                            }
                        }
                        else {
                            callback(sitesResult)
                        }
                    }
                    else {
                        callback(sitesResult)
                    }
                })
            }
            else {
                callback({ success: false, message: 'DashboardInsightsByApiKeys', result: null })
            }
        }
        else {
            callback({ success: false, message: 'DashboardInsightsByApiKeys', result: null })
        }

    }

    return {
        Initialize: constructor,
        HeatmapData: heatmapData,
        HeatmapScreenshotByPathname: heatmapScreenshotByPathname,
        HeatmapScreenshotById: heatmapScreenshotById,
        DashboardInsightsByApiKey: dashboardInsightsByApiKey,
        DashboardInsightsByApiKeys: dashboardInsightsByApiKeys,
        DashboardInsightsByUserId: dashboardInsightsByUserId,
    }
}

module.exports = InsightController;