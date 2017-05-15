function ConsoleController(dependencies) {

    /// Dependencies   
    var _colors;
    var _cross;

    var constructor = function () {
        _colors = dependencies.colors;
        _cross = dependencies.cross;
    }

    var log = function (message, type) {
        switch (type) {
            case 'server-success':
                console.log(dependencies.colors.green(' Crawler Site: ') + (_cross.IsJsonString(message) == true ? JSON.stringify(message) : message) );
                break;
            case 'socket-message':
                console.log(dependencies.colors.gray(' Socket Message: ') + (_cross.IsJsonString(message) == true ? JSON.stringify(message) : message));
                break;
            case 'error':
                console.log(dependencies.colors.red(' Error: ') + (_cross.IsJsonString(message) == true ? JSON.stringify(message) : message));
                break;
            default:
                console.log(' ' + (_cross.IsJsonString(message) == true ? JSON.stringify(message) : message));
        }
    }

    return {
        Initialize: constructor,
        log: log
    }
}

module.exports = ConsoleController;