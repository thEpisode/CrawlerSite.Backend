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
                    if(result.length > 0){
                        data = heatmapDataCalculation(result, 15, 60);
                        callback(data);
                    }
                    else{
                        callback(data);
                    }
                    
                });
                break;
            case 'click':
                _database.Click().GetInsight(ApiKey, MinWidth, MaxWidth, MaxTime, Endpoint, function (result) {
                    if(result.length > 0){
                        data = heatmapDataCalculation(result, 15, 60);
                        callback(data);
                    }
                    else{
                        callback(data);
                    }
                });
                break;
            case 'scroll':
                _database.Scroll().GetInsight(ApiKey, MinWidth, MaxWidth, MaxTime, Endpoint, function (result) {
                    if(result.length > 0){
                        data = heatmapDataCalculation(result, 15, 60);
                        callback(data);
                    }
                    else{
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

    var heatmapDataCalculation = function (data, numberOfWidthCells, numberOfHeigthCells) {
        var widthMean = 0;
        var heightMean = 0;

        var widthCells = 0;
        var heightCells = 0;

        var heatmapData = null;

        // Finding means
        for (var i = 0; i < data.length; i++) {
            widthMean += data[i].Event.Client.screen.width;
            heightMean += data[i].Event.Client.screen.height;
        }

        widthMean = widthMean / data.length;
        heightMean = heightMean / data.length;

        widthCells = widthMean / numberOfWidthCells;
        heightCells = heightMean / numberOfHeigthCells;

        heatmapData = [];
        
        for (var i = 0; i < numberOfWidthCells; i++) {
            for (var j = 0; j < numberOfHeigthCells; j++) {
                var result = getCountPointsInRange(
                        j==0?data:result.data,
                        i * widthCells,
                        ((i * widthCells) + ((i + 1) * widthCells)),
                        j * heightCells,
                        ((j * heightCells) + ((j + 1) * heightCells))
                    )
                var heatmapPoint = {
                    x: Math.floor(i * widthCells),
                    y: Math.floor(j * heightCells),
                    value: result.count
                }
                
                heatmapData.push(heatmapPoint);
            }
        }
        return heatmapData;
    }

    var getCountPointsInRange = function (data, minWidth, maxWidth, minHeight, maxHeight) {
        var count = 0;

        for (var i = 0; i < data.length; i++) {
            var x = data[i].Event.Position.X;
            var y = data[i].Event.Position.Y;
            if (x >= minWidth && x < maxWidth) {
                if (y >= minHeight && y < maxHeight) {
                    count++;
                    data.splice(data[i], 1);
                }
            }
        }

        return {count: count, data: data};
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