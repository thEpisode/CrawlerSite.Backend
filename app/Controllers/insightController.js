function InsightController(dependencies) {

    /// Dependencies   
    var _database;
    var _fileHandler;

    /// Properties


    var constructor = function () {
        _database = dependencies.database;
        _fileHandler = dependencies.fileHandler;
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
                    x: ((keyX * intervalX) + ((keyX + 1) * intervalX))/2,
                    //toX: (keyX + 1) * intervalX,
                    y: ((keyY * intervalY) + ((keyY + 1) * intervalY))/2,
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

    var heatmapScreenshotById = function (Id, callback) {
        _fileHandler.ReadFileById(Id, function (stream) {
            callback(stream);
        })
    }

    return {
        Initialize: constructor,
        HeatmapData: heatmapData,
        HeatmapScreenshotByPathname: heatmapScreenshotByPathname,
        HeatmapScreenshotById: heatmapScreenshotById
    }
}

module.exports = InsightController;