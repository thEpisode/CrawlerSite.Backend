function Socket(dependencies) {

    /// Dependencies
    var _console;
    var _io;
    var _database;
    var _fileHandler;
    var _cross;
    var _uuid;

    const MAX_CLIENTS = 10;

    var _siteNamespaces = [];

    var constructor = function () {
        _io = dependencies.io;
        _database = dependencies.database;
        _console = dependencies.console;
        _fileHandler = dependencies.fileHandler;
        _cross = dependencies.cross;
        _uuid = dependencies.uuid;

        socketImplementation();
        _console.log('Socket module initialized', 'server-success');
    }

    /// Crete a new namespace with dynamic name
    function _createNamespace(data) {
        var ns = {
            Id: data.name,
            ConnectedClients: 0,
        };

        _siteNamespaces.push(ns);

        return ns;
    }

    /// Generate an UUID as room name
    function _createPrivateRoomGuid() {
        return _uuid.v4();
    }

    var socketImplementation = function () {
        var userPoolNamespace = _io.of('/user-pool-namespace');
        var adminPoolNamespace = _io.of('/admin-pool-namespace');
        var ratPoolNamespace = _io.of('/rat-pool-namespace');

        /// RAT Service Namespace
        ///
        /// 1 to 1 connection between Admin and User, this connect every users and admins in one namespace and separate with private rooms
        function _ratServiceNamespace(namespace, callback) {
            if (namespace.ConnectedClients <= MAX_CLIENTS) {
                var ratServiceNamespace = _io.of('/' + namespace.Id);

                ratServiceNamespace.on('connection', function (socket) {
                    _console.log('Socket connected to RAT Service Namespace: ' + socket.id, 'socket-message');

                    socket.emit('Coplest.Flinger.RAT', { Message: 'ConnectedToRSN#Response', SocketId: socket.id });

                    socket.on('Coplest.Flinger.RAT', function (data) {
                        if (data.Command != null) {
                            switch (data.Command) {
                                case 'JoinToPrivateRoom':
                                    socket.join(data.Values.RoomId);
                                    break;
                                case 'TakeMyUserSocketId#Request':
                                    ratServiceNamespace.in(data.Values.RoomId).emit('Coplest.Flinger.Rat', {Message: 'TakeMyUserSocketId#Response', Values: {UserSocketId: data.Values.SocketId}});
                                case 'SettingUpRATService#Request':
                                    socket.in(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Message: 'PrintCursor#Request', Values: { Size: 'normal' } })
                                    socket.in(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Message: 'SetInitialPositionCursor#Request', Values: { X: 0, Y: 0 } })
                                    socket.in(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Message: 'SetScreenshotInterval#Request', Values: { Interval: 500 } })
                                    break;
                                default:
                                    break;
                            }
                        }
                    });

                    socket.on('Coplest.Flinger.RAT.PrivateRoom#')
                });

                ratServiceNamespace.to()

                namespace.clients++;
            }

            callback({ namespaces: namespace_queue });
        }

        /// RAT Pool Namespace
        ///
        /// Define merged pool, is a temporary pool to connect Admin and User into their unique namespace
        ratPoolNamespace.on('connection', function (socket) {
            _console.log('Socket connected to RAT pool: ' + socket.id, 'socket-message');

            /// Welcome to the new admin client
            socket.emit('Coplest.Flinger.RAT', { Message: 'ConnectedToRPN#Response', SocketId: socket.id });

            socket.on('Coplest.Flinger.RAT', function (data, callback) {
                if (data.Command != undefined) {
                    switch (data.Command) {
                        case 'CheckSiteNamespace#Request':
                            var ns = _cross.SearchObjectByIdOnArray(data.Values.SiteId, _siteNamespaces);
                            if (namespace == null) {
                                ns = _createNamespace({ name: data.Values.SiteId })
                            }
                            socket.emit('Coplest.Flinger.RAT', { Command: "CheckSiteNamespace#Response", Values: { Namespace: ns } });
                            break;
                        case 'CreatePrivateRoom#Request':
                            var guid = _createPrivateRoomGuid();

                            socket.emit('Coplest.Flinger.RAT', { Command: "CreatePrivateRoom#Response", Values: { RoomId: guid } });

                            userPoolNamespace.emit('Coplest.Flinger.RAT', { Command: 'RATPoolConnection#Request', Values: { SocketId: data.Values.UserSocketId, RoomId: guid, RPN: 'rat-pool-namespace', Namespace: data.Values.Namespace } });
                            break;
                        case 'ConnectToRATServiceNamespace#Request':
                            _ratServiceNamespace(data.Values.Namespace, callback);
                            break;
                        default:
                            break;
                    }
                }
            })

            socket.on('JoinToSiteNamespace', function (data, callback) {
                var _namespace = _cross.SearchObjectOnArray(data.namespace, _siteNamespaces);

                if (_namespace === null) {
                    _createNamespace(data);
                    _ratServiceNamespace(_namespace);
                }
                else {
                    _ratServiceNamespace(_namespace);
                }
            })
        })

        /// Admin Pool Namespace (APN)
        ///
        /// This is when all admin will be connected 
        adminPoolNamespace.on('connection', function (socket) {
            _console.log('Admin client connected: ' + socket.id, 'socket-message');

            /// Welcome to the new admin client
            socket.emit('Welcome', { Message: 'Welcome to Coplest.Flinger', SocketId: socket.id });

            socket.on('Coplest.Flinger.RAT', function (data) {
                if (data.Command != undefined) {
                    switch (data.Command) {
                        case 'GetAllConnectedSockets#Request':
                            socket.emit('Coplest.Flinger.RAT', { Command: "GetAllConnectedSockets#Response", Values: Object.keys(_io.sockets.connected) });
                            break;
                        case 'GetAllConnectedSocketsByApiKey#Request':
                            var connectedSockets = [];
                            /// Search all connected sockets by ApiKey
                            var keys = Object.keys(_io.sockets.connected)
                            for (var index = 0; index < keys.length; index++) {
                                //console.log(_io.sockets.connected[keys[index]].ApiKey)
                                if (_io.sockets.connected[keys[index]].ApiKey !== undefined) {
                                    if (_io.sockets.connected[keys[index]].ApiKey == data.Values.ApiKey) {
                                        connectedSockets.push({ SocketId: _io.sockets.connected[keys[index]].id, ApiKey: data.Values.ApiKey })
                                    }
                                }

                            }
                            socket.emit('Coplest.Flinger.RAT', { Command: "GetAllConnectedSocketsByApiKey#Response", Values: connectedSockets });
                            break;
                        case 'GetEnpointRPN#Request':
                            socket.emit('Coplest.Flinger.RAT', { Command: "GetEnpointRPN#Response", Values: { Endpoint: '/rat-pool-namespace' } });
                            break;
                        default:
                            break;
                    }
                }
            })
        })

        /// User Pool Namespace (UPN)
        ///
        /// All site Users will be connected in this pool and wait for any request
        userPoolNamespace.on('connection', function (socket) {
            _console.log('Client connected: ' + socket.id, 'socket-message');

            /// Emit a welcome message to new connection
            socket.emit('Welcome', { Message: 'Welcome to Coplest.Flinger', SocketId: socket.id });

            /// Catch when this connection is closed
            socket.on('disconnect', function () {
                _console.log('Client disconnected: ' + socket.id, 'socket-message');

                adminPoolNamespace.emit('Coplest.Flinger.RAT', { Command: 'UnsubscribeSocketToApiKey#Request', Values: { SocketId: socket.id, ApiKey: socket.ApiKey } });
            });

            /// Request all insights queue
            socket.emit('Coplest.Flinger.ServerEvent', { Command: 'InsightsQueue' });

            socket.on('Coplest.Flinger.AddApiKeyToSocket', function (data) {
                if (data.ApiKey != undefined) {
                    //Set Api Key to connected socket
                    _io.sockets.connected[socket.id].ApiKey = data.ApiKey;

                    adminPoolNamespace.emit('Coplest.Flinger.RAT', { Command: 'SubscribeSocketToApiKey#Request', Values: { SocketId: socket.id, ApiKey: data.ApiKey } });
                }
            })

            /// Catch all RAT events to this user
            socket.on('Coplest.Flinger.RAT', function (data) {
                if (data.Command != undefined) {
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