function Socket(dependencies) {

    /// Dependencies
    var _console;
    var _io;
    var _database;
    var _fileHandler;
    var _cross;
    var _uuid;
    var _geolocate;

    const MAX_CLIENTS = 10;

    var _siteNamespaces = [];
    var _usersconnectedClients = [];

    var constructor = function () {
        _io = dependencies.io;
        _database = dependencies.database;
        _console = dependencies.console;
        _fileHandler = dependencies.fileHandler;
        _cross = dependencies.cross;
        _uuid = dependencies.uuid;
        _geolocate = dependencies.geolocateController;

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

        //var dynamicNamespaces =[];

        /// RAT Service Namespace
        ///
        /// 1 to 1 connection between Admin and User, this connect every users and admins in one namespace and separate with private rooms
        function _ratServiceNamespace(ratPoolNamespaceSocket, namespace, callback) {
            if (namespace.ConnectedClients <= MAX_CLIENTS) {
                var ratServiceNamespace;
                // Search if namespace exist
                if ((Object.keys(_io.nsps).indexOf('/' + namespace.Id) > -1) == false) {

                }
                ratServiceNamespace = _cross.SearchObjectByIdOnArray(namespace.Id, _siteNamespaces);
                ratServiceNamespace = _io.of('/' + namespace.Id);
                //debugger;
                //once prevent duplicated connection
                ratServiceNamespace.once('connection', function (socket) {
                    _console.log('Socket connected to RAT Service Namespace: ' + socket.id, 'socket-message');

                    socket.emit('Coplest.Flinger.RAT', { Command: 'ConnectedToRSN#Response', Values: { SocketId: socket.id } });

                    socket.on('Coplest.Flinger.RAT', function (data) {
                        if (data.Command != null) {
                            switch (data.Command) {
                                case 'UserJoinToPrivateRoom#Request':
                                    _console.log('_ratServiceNamespace Coplest.Flinger.RAT UserJoinToPrivateRoom#Request', 'socket-message');
                                    socket.join(data.Values.RoomId);
                                    socket.emit('Coplest.Flinger.RAT', { Command: 'UserJoinToPrivateRoom#Response', Values: { UserSocketId: data.Values.SocketId } });
                                    break;
                                case 'AdminJoinToPrivateRoom#Request':
                                    _console.log('_ratServiceNamespace Coplest.Flinger.RAT AdminJoinToPrivateRoom#Request', 'socket-message');
                                    socket.join(data.Values.RoomId);
                                    socket.emit('Coplest.Flinger.RAT', { Command: 'AdminJoinToPrivateRoom#Response', Values: { UserSocketId: data.Values.SocketId } });
                                    ratServiceNamespace.emit('Coplest.Flinger.RAT', { Command: 'JoinToPrivateRoom#Request', Values: { UserSocketId: data.Values.SocketId } });

                                    break;
                                case 'TakeMyUserSocketId#Request':
                                    _console.log('_ratServiceNamespace Coplest.Flinger.RAT TakeMyUserSocketId#Request', 'socket-message');
                                    ratServiceNamespace.in(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Command: 'TakeMyUserSocketId#Response', Values: { RoomId: data.Values.RoomId } });
                                    break;
                                case 'UserDenyControl#Response':
                                    _console.log('_ratServiceNamespace Coplest.Flinger.RAT UserDenyControl#Request', 'socket-message');
                                    ratServiceNamespace.in(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Command: 'UserDenyControl#Response', Values: { RoomId: data.Values.RoomId } });
                                    break;
                                case 'UserAllowControl#Response':
                                    _console.log('_ratServiceNamespace Coplest.Flinger.RAT UserAllowControl#Request', 'socket-message');
                                    ratServiceNamespace.in(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Command: 'UserAllowControl#Response', Values: { RoomId: data.Values.RoomId } });
                                    break;
                                case 'AdminAllowControl#Request':
                                    _console.log('_ratServiceNamespace Coplest.Flinger.RAT AllowControl#Request', 'socket-message');
                                    ratServiceNamespace.to(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Command: 'AllowControl#Request', Values: { RoomId: data.Values.RoomId } });
                                    break;
                                case 'SetRATEngine#Request':
                                    _console.log('_ratServiceNamespace Coplest.Flinger.RAT SetRATEngine#Request', 'socket-message');
                                    ratServiceNamespace.to(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Command: 'HideRealCursor#Request', Values: {} })
                                    ratServiceNamespace.to(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Command: 'PrintCursor#Request', Values: { Size: 'normal' } })
                                    ratServiceNamespace.to(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Command: 'SetInitialPositionCursor#Request', Values: { X: 0, Y: 0 } })
                                    ratServiceNamespace.to(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Command: 'SetScreenshotInterval#Request', Values: { Interval: 1000 } })
                                    break;
                                case 'SetPositionMouse#Request':
                                    //_console.log('_ratServiceNamespace Coplest.Flinger.RAT SetPositionMouse#Request', 'socket-message');
                                    ratServiceNamespace.to(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Command: 'SetPositionMouse#Request', Values: data.Values })
                                    break;
                                case 'SetScrollDelta#Request':
                                    //_console.log('_ratServiceNamespace Coplest.Flinger.RAT SetScrollDelta#Request', 'socket-message');
                                    ratServiceNamespace.to(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Command: 'SetScrollDelta#Request', Values: data.Values })
                                    break;
                                case 'Click#Request':
                                    //_console.log('_ratServiceNamespace Coplest.Flinger.RAT Click#Request', 'socket-message');
                                    ratServiceNamespace.to(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Command: 'Click#Request', Values: data.Values })
                                    break;
                                case 'UserScreenshot#Request':
                                    ratServiceNamespace.to(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Command: 'RefreshScreenshot#Request', Values: data.Values })
                                    break;
                                default:
                                    break;
                            }
                        }
                    });

                    /// Events for Private Room
                    socket.on('Coplest.Flinger.RAT.PrivateRoom', function (data) {
                        _console.log('_ratServiceNamespace Coplest.Flinger.RAT.PrivateRoom SetMousePosition#Request', 'socket-message');
                        if (data.Command != null) {
                            switch (data.Command) {
                                case 'SetMousePosition#Request':
                                    _console.log('_ratServiceNamespace Emit SetMousePosition#Request', 'socket-message');
                                    socket.in(data.Values.RoomId).emit('Coplest.Flinger.RAT.PrivateRoom', { Command: 'SetMousePosition#Response', Values: { X: data.Values.X, Y: data.Values.Y } })
                                    break;
                                default:
                                    break;
                            }
                        }
                    })
                });

                namespace.clients++;
            }

            callback({ Command: 'RATServiceNamespace', Values: { Namespace: _siteNamespaces } });
        }

        /// RAT Pool Namespace
        ///
        /// Define merged pool, is a temporary pool to connect Admin and User into their unique namespace
        ratPoolNamespace.on('connection', function (socket) {
            _console.log('Socket connected to RAT pool: ' + socket.id, 'socket-message');

            var connectionTimer = setInterval(function () {
                _database.Site().IncreaseRATTimeByApiKey({ ApiKey: socket.handshake.query.ApiKey }, function (response) { })
            }, 1000);

            /// Welcome to the new admin client
            socket.emit('Coplest.Flinger.RAT', { Command: 'ConnectedToRPN#Response', Values: { SocketId: socket.id.split('#')[1] } });

            socket.on('Coplest.Flinger.RAT', function (data, callback) {
                if (data.Command != undefined) {
                    switch (data.Command) {
                        case 'CheckSiteNamespace#Request':
                            _console.log('CheckSiteNamespace#Request', 'socket-message');
                            var ns = _cross.SearchObjectByIdOnArray(data.Values.SiteId, _siteNamespaces);
                            if (ns == null) {
                                ns = _createNamespace({ name: data.Values.SiteId })
                            }
                            socket.emit('Coplest.Flinger.RAT', { Command: "CheckSiteNamespace#Response", Values: { Namespace: ns } });
                            break;
                        case 'CreatePrivateRoom#Request':
                            _console.log('CreatePrivateRoom#Request', 'socket-message');
                            var guid = _createPrivateRoomGuid();

                            _console.log('ratPoolNamespace Emit: CreatePrivateRoom#Request', 'socket-message');
                            socket.emit('Coplest.Flinger.RAT', { Command: "CreatePrivateRoom#Response", Values: { RoomId: guid } });

                            _console.log('userPoolNamespace Emit: RATPoolConnection#Request', 'socket-message');
                            userPoolNamespace.emit('Coplest.Flinger.RAT', { Command: 'RATPoolConnection#Request', Values: { SocketId: data.Values.UserSocketId, RoomId: guid, RPN: '/rat-pool-namespace', Namespace: data.Values.Namespace } });
                            break;
                        case 'ConnectToRATServiceNamespace#Request':
                            _console.log('ConnectToRATServiceNamespace#Request', 'socket-message');
                            var _namespace = _cross.SearchObjectByIdOnArray(data.Values.Namespace.Id, _siteNamespaces);

                            if (_namespace === null) {
                                _namespace = _createNamespace(data);
                                _ratServiceNamespace(socket, _namespace, callback);
                            }
                            else {
                                _ratServiceNamespace(socket, _namespace, callback);
                            }

                            //_ratServiceNamespace(data.Values.Namespace, callback);
                            break;
                        default:
                            break;
                    }
                }
            })

            socket.on('disconnect', function () {

                clearInterval(connectionTimer);
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
                                        try{
                                            var socketClientInformation = JSON.parse(_io.sockets.connected[keys[index]].handshake.query.ClientInformation);
                                            connectedSockets.push({ SocketId: _io.sockets.connected[keys[index]].id, ApiKey: data.Values.ApiKey, ClientInformation: socketClientInformation })
                                        }
                                        catch(e){
                                            _console.log('Socket hasnt client information: ' + _io.sockets.connected[keys[index]].id, 'error');
                                        }
                                        
                                    }
                                }

                            }
                            socket.emit('Coplest.Flinger.RAT', { Command: "GetAllConnectedSocketsByApiKey#Response", Values: connectedSockets });
                            break;
                        case 'GetEndpointRPN#Request':
                            socket.emit('Coplest.Flinger.RAT', { Command: "GetEndpointRPN#Response", Values: { Endpoint: '/rat-pool-namespace' } });
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
            _console.log('Client connected: ' + socket.handshake.query.ClientInformation, 'socket-message');

            /// Add a pageview Heatmap Insights
            _database.Site().IncreasePageviewsHeatmaps({ ApiKey: socket.handshake.query.ApiKey }, function (response) { })

            _database.Site().IncreaseUsersOnlineRATByApiKey({ ApiKey: socket.handshake.query.ApiKey }, function (response) {
                _usersconnectedClients.push({ SocketId: socket.id, ApiKey: socket.handshake.query.ApiKey, ClientInformation: JSON.parse(socket.handshake.query.ClientInformation) })
            })

            /// Emit a welcome message to new connection
            socket.emit('Welcome', { Message: 'Welcome to Coplest.Flinger', SocketId: socket.id });

            /// Catch when this connection is closed
            socket.on('disconnect', function () {
                _console.log('Client disconnected: ' + socket.id, 'socket-message');

                _database.Site().DecreaseUsersOnlineRATByApiKey({ ApiKey: socket.handshake.query.ApiKey }, function (response) {
                    _usersconnectedClients.push({ SocketId: socket.id, ApiKey: socket.handshake.query.ApiKey })

                    /// Delete an element in array: http://stackoverflow.com/questions/15287865/remove-array-element-based-on-object-property
                    _usersconnectedClients = _usersconnectedClients.filter(function (obj) {
                        return obj.SocketId !== socket.id;
                    });
                })

                adminPoolNamespace.emit('Coplest.Flinger.RAT', { Command: 'UnsubscribeSocketToApiKey#Request', Values: { SocketId: socket.id, ApiKey: socket.ApiKey, ClientInformation: JSON.parse(socket.handshake.query.ClientInformation) } });
            });


            socket.on('Coplest.Flinger.AddApiKeyToSocket', function (data) {
                if (data.ApiKey != undefined) {
                    //Set Api Key to connected socket                    
                    var connectedSocket = _io.sockets.connected[socket.id.split('#')[1]];
                    connectedSocket.ApiKey = data.ApiKey;

                    adminPoolNamespace.emit('Coplest.Flinger.RAT', { Command: 'SubscribeSocketToApiKey#Request', Values: { SocketId: socket.id.split('#')[1], ApiKey: data.ApiKey, ClientInformation: JSON.parse(socket.handshake.query.ClientInformation) } });
                }
            })

            socket.on('Coplest.Flinger.ICanUseHeatmaps', function (data) {
                /// Request all insights queue
                socket.emit('Coplest.Flinger.ServerEvent', { Command: 'InsightsQueue' });
            })

            socket.on('Coplest.Flinger.CanISendData', function (data) {
                _database.Subscription().CheckIfCanUseHeatmaps(data, function (result) {
                    socket.emit('Coplest.Flinger.ServerEvent', { Command: 'CanUseHeatmaps', Values: result });
                })
            });

            socket.on('Coplest.Flinger.PushInsight', function (data) {
                if (data.Command != undefined) {
                    switch (data.Command) {
                        case 'Click':
                            _geolocate.Locate({ IP: socket.handshake.address }, function (geolocateResponse) {
                                data.Values.Event.Location = geolocateResponse.result == null ? null : geolocateResponse.result;

                                _database.Click().CreateClick(data.Values, function () {
                                    //console.log('Click Saved');
                                    _database.Site().IncreaseClickHeatmaps({ ApiKey: data.Values.ApiKey }, function (response) { })
                                    _database.Site().IncreaseHeatmapClientsBehaviorByApiKey({ ApiKey: data.Values.ApiKey }, function (response) { })
                                });
                            });
                            break;
                        case 'Movement':
                            _geolocate.Locate({ IP: socket.handshake.address }, function (geolocateResponse) {
                                data.Values.Event.Location = geolocateResponse.success == false ? null : geolocateResponse.result;

                                _database.Movement().CreateMovement(data.Values, function () {
                                    //console.log('Movement Saved');
                                    _database.Site().IncreaseMovementHeatmaps({ ApiKey: data.Values.ApiKey }, function (response) { })
                                    _database.Site().IncreaseHeatmapClientsBehaviorByApiKey({ ApiKey: data.Values.ApiKey }, function (response) { })
                                })
                            });
                            break;
                        case 'Scroll':
                            _geolocate.Locate({ IP: socket.handshake.address }, function (geolocateResponse) {
                                data.Values.Event.Location = geolocateResponse.result == null ? null : geolocateResponse.result;

                                _database.Scroll().CreateScroll(data.Values, function () {
                                    //console.log('Scroll Saved');
                                    _database.Site().IncreaseScrollHeatmaps({ ApiKey: data.Values.ApiKey }, function (response) { })
                                    _database.Site().IncreaseHeatmapClientsBehaviorByApiKey({ ApiKey: data.Values.ApiKey }, function (response) { })
                                })
                            });
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