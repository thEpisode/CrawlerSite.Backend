function ConsoleController(dependencies) {

    /// Dependencies   
    var _colors;
    var _cross;
    var _mail;

    var constructor = function () {
        _colors = dependencies.colors;
        _cross = dependencies.cross;
        _mail = dependencies.mailController;
    }

    var log = function (message, type) {
        switch (type) {
            case 'server-success':
                console.log(dependencies.colors.green(' Crawler Site: ') + (_cross.IsJsonString(message) == true ? JSON.stringify(message) : message));
                break;
            case 'socket-message':
                console.log(dependencies.colors.gray(' Socket Message: ') + (_cross.IsJsonString(message) == true ? JSON.stringify(message) : message));
                break;
            case 'error':
                var trace = new Error().stack;
                _mail.SendComposed({
                    Subject: 'Crawler Site Production Error',
                    To: 'development_alerts@crawlersite.com',
                    Text: 'Backend catched an error please review error and stack trace: Error: ' +
                    (_cross.IsJsonString(JSON.stringify(message)) == true ? JSON.stringify(message) : message) +
                    'Stack Trace:' + trace,
                    ComposedTitle: 'Crawler Site Production Error',
                    ComposedBody: 'Backend catched an error please review error and stack trace: <br><strong>Error: </strong><br>' +
                    '<pre>' +
                    (_cross.IsJsonString(JSON.stringify(message)) == true ? JSON.stringify(message) : message) +
                    '</pre><br><br>' +
                    '<strong>Stack Trace:</strong><br>' +
                    '<pre>' + trace + '</pre>',
                    ComposedUrlAction: 'https://www.crawlersite.com',
                    ComposedTextAction: 'Open Crawler Site',
                }, function () {/* Email Sent */ });
                console.log(dependencies.colors.red(' Error: ') + (_cross.IsJsonString(JSON.stringify(message)) == true ? JSON.stringify(message) : message));
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