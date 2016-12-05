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
        var adminClients = _io.of('/admin-clients');

        adminClients.on('connection', function(socket){
            _console.log('Admin client connected: ' + socket.id, 'socket-message');

            /// Welcome to the new admin client
            socket.emit('Welcome', { Message: 'Welcome to Coplest.Flinger', SocketId: socket.id });

            socket.on('Coplest.Flinger.RAT', function(data){
                if(data.Command != undefined){
                    switch (data.Command) {
                        case 'GetAllConnectedSockets#Request':
                            socket.emit('GetAllConnectedSockets#Response', {Command: "Response", Values: Object.keys(_io.sockets.connected)});
                            break;
                        case 'GetAllConnectedSocketsByApiKey#Request':
                            var connectedSockets = [];
                            console.log(_io.sockets.connected)
                            for (var index = 0; index < _io.sockets.connected.length; index++) {
                                console.log(_io.sockets.connected[index].ApiKey)
                                if(_io.sockets.connected[index].ApiKey !== undefined){
                                    if(_io.sockets.connected[index].ApiKey == data.Values.ApiKey){
                                        connectedSockets.push(_io.sockets.connected[index].id)
                                    }
                                }
                                
                            }
                            socket.emit('GetAllConnectedSocketsByApiKey#Response', {Command: "Response", Values: connectedSockets});
                            break;
                        default:
                            break;
                    }
                }
            })
        })

        _io.sockets.on('connection', function (socket) {
            _console.log('Client connected: ' + socket.id, 'socket-message');

            /// Welcome to the new client
            socket.emit('Welcome', { Message: 'Welcome to Coplest.Flinger', SocketId: socket.id });

            /// Request all insights queue
            socket.emit('Coplest.Flinger.ServerEvent', { Command: 'InsightsQueue' });

            socket.on('Coplest.Flinger.AddApiKeyToSocket', function(data){
                if(data.ApiKey != undefined){
                    //Set Api Key to connected socket
                    _io.sockets.connected[socket.id].ApiKey = data.ApiKey;
                }
            })

            socket.on('Coplest.Flinger.RAT', function(data){
                if(data.Command != undefined){
                    switch (data.Command) {
                        case 'SetMousePosition#Request':
                            ///
                            break;
                        case 'SetRATEngine#Request':
                            ///
                            break;
                        default:
                            break;
                    }
                }
            })

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
                                _database.Site().AddScreenshotToChild(data.Values.ApiKey, result._id + '', data.Values.Endpoint, function () {
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