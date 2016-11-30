function Socket(dependencies) {

    /// Dependencies
    var _console;
    var _io;
    var _database;
    var _fileHandler;

    var constructor = function () {
        _io = dependencies.io;
        _database = dependencies.database;
        _console = dependencies.console;
        _fileHandler = dependencies.fileHandler;

        socketImplementation();
        _console.log('Socket module initialized', 'server-success');
    }

    var socketImplementation = function () {
        _io.sockets.on('connection', function (socket) {
            _console.log('Client connected: ' + socket.id, 'socket-message');

            /// Welcome to the new client
            socket.emit('Welcome', { Message: 'Welcome to Coplest.Flinger', SocketId: socket.id });

            /// Request all insights queue
            socket.emit('Coplest.Flinger.ServerEvent', { Command: 'InsightsQueue' });

            socket.on('Coplest.Flinger.PushInsight', function (data) {
                if (data.Command != undefined) {
                    switch (data.Command) {
                        case 'Click':
                            _database.Click().CreateClick(data.Values, function () {
                                //console.log('Click Saved');
                            })
                            break;
                        case 'Movement':
                            _database.Movement().CreateMovement(data.Values, function () {
                                //console.log('Movement Saved');
                            })
                            break;
                        case 'Scroll':
                            _database.Scroll().CreateScroll(data.Values, function () {
                                //console.log('Scroll Saved');
                            })
                            break;
                    }
                }
            })

            socket.on('Coplest.Flinger.PushScreenshot', function (data) {
                if (data.Command != undefined) {
                    _database.Site().WebCrawling(data.Values.ApiKey, data.Values.Endpoint, function (result) {
                        // if hasn't a screenshot
                        if (result == false) {
                            _fileHandler.CreateScreenshotFile(data.Values.Base64Data, data.Values.Endpoint, function (result) {
                                // Add new image to entity
                                _database.Site().AddScreenshotToChild(data.Values.ApiKey, data.result._id + '', data.Values.Endpoint, function () {
                                    //res.json({ message: 'CreateScreenshotFile', result: true });
                                })
                            })
                        }
                        else {
                            //res.json({ message: 'CreateScreenshotFile', result: true });
                        }
                    })
                }
            })
        });
    }

    return {
        Initialize: constructor
    }
}

module.exports = Socket;