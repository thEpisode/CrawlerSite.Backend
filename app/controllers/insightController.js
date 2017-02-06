function InsightController(dependencies) {

    /// Dependencies   
    var _database;
    var _fileHandler;

    /// Properties


    var constructor = function () {
        _database = dependencies.database;
        _fileHandler = dependencies.fileHandler;
    }

    var heatmapData = function (ApiKey, MinWidth, MaxWidth, Type, MaxTime, Endpoint, callback) {
        var data = []
        switch (Type.toLowerCase()) {
            case 'movement':
                _database.Movement().GetInsight(ApiKey, MinWidth, MaxWidth, MaxTime, Endpoint, function (result) {
                    if (result.length > 0) {
                        data = heatmapDataCalculation(result, 50, 50);
                        callback(data);
                    }
                    else {
                        callback(data);
                    }

                });
                break;
            case 'click':
                _database.Click().GetInsight(ApiKey, MinWidth, MaxWidth, MaxTime, Endpoint, function (result) {
                    if (result.length > 0) {
                        data = heatmapDataCalculation(result, 50, 50);
                        callback(data);
                    }
                    else {
                        callback(data);
                    }
                });
                break;
            case 'scroll':
                _database.Scroll().GetInsight(ApiKey, MinWidth, MaxWidth, MaxTime, Endpoint, function (result) {
                    if (result.length > 0) {
                        data = heatmapDataCalculation(result, 50, 50);
                        callback(data);
                    }
                    else {
                        callback(data);
                    }
                });
                break;
            default:
                data = null;
                callback(data);
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
                    x: keyX * intervalX,
                    //toX: (keyX + 1) * intervalX,
                    y: keyY * intervalY,
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