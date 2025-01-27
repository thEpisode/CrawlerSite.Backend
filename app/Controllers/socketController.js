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

    var userPoolNamespace;
    var adminPoolNamespace;
    var ratPoolNamespace;

    var constructor = function () {
        _io = dependencies.io;
        _database = dependencies.database;
        _console = dependencies.console;
        _fileHandler = dependencies.fileHandler;
        _cross = dependencies.cross;
        _uuid = dependencies.uuid;
        _geolocate = dependencies.geolocateController;
        _console = dependencies.console;

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
        userPoolNamespace = _io.of('/user-pool-namespace');
        adminPoolNamespace = _io.of('/admin-pool-namespace');
        ratPoolNamespace = _io.of('/rat-pool-namespace');

        //var dynamicNamespaces =[];

        /// RAT Service Namespace
        ///
        /// 1 to 1 connection between Admin and User, this connect every users and admins in one namespace and separate with private rooms
        function _ratServiceNamespace(ratPoolNamespaceSocket, namespace, next) {
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

                    socket.on('Coplest.Flinger.RAT', function (data, next) {
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
                                case 'SendReverseShellCommand#Request':
                                    data.Values.csrf = _cross.GenerateAntiForgeryToken();
                                    ratServiceNamespace.to(data.Values.RoomId).emit('Coplest.Flinger.RAT', { Command: 'ReverseShellCommand#Request', Values: data.Values })
                                    break;
                                case 'ValidateReverseShellCommandCSRF#Request':
                                    next({ IsValid: _cross.ValidateAntiForgeryToken(data.Values.csrf) });
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

            next({ Command: 'RATServiceNamespace', Values: { Namespace: _siteNamespaces } });
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

            socket.on('Coplest.Flinger.RAT', function (data, next) {
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
                                _ratServiceNamespace(socket, _namespace, next);
                            }
                            else {
                                _ratServiceNamespace(socket, _namespace, next);
                            }

                            //_ratServiceNamespace(data.Values.Namespace, next);
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

                                if (_io.sockets.connected[keys[index]].ApiKey !== undefined) {
                                    if (_io.sockets.connected[keys[index]].ApiKey == data.Values.ApiKey) {
                                        try {
                                            var socketClientInformation = _io.sockets.connected[keys[index]].ClientInformation;
                                            connectedSockets.push({ SocketId: _io.sockets.connected[keys[index]].id, ApiKey: data.Values.ApiKey, ClientInformation: socketClientInformation })
                                        }
                                        catch (e) {
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
            _console.log(`${socket.handshake.address} connected to ${socket.handshake.query.ApiKey}`, 'socket-message');

            /// Add a pageview Heatmap Insights
            _database.Site().IncreasePageviewsHeatmaps({ ApiKey: socket.handshake.query.ApiKey }, function (response) { })

            _database.Site().IncreaseUsersOnlineRATByApiKey({ ApiKey: socket.handshake.query.ApiKey }, function (response) {
                _usersconnectedClients.push({ SocketId: socket.id, ApiKey: socket.handshake.query.ApiKey })
            })

            /// Emit a welcome message to new connection
            socket.emit('Welcome', { Message: 'Welcome to Crawler Site', SocketId: socket.id, PublicIP: socket.handshake.address });

            /// Catch when this connection is closed
            socket.on('disconnect', function () {
                _console.log(`${socket.handshake.address} disconnected from ${socket.handshake.query.ApiKey}`, 'socket-message');

                _database.Site().DecreaseUsersOnlineRATByApiKey({ ApiKey: socket.handshake.query.ApiKey }, function (response) {
                    _usersconnectedClients.push({ SocketId: socket.id, ApiKey: socket.handshake.query.ApiKey })

                    /// Delete an element in array: http://stackoverflow.com/questions/15287865/remove-array-element-based-on-object-property
                    _usersconnectedClients = _usersconnectedClients.filter(function (obj) {
                        return obj.SocketId !== socket.id;
                    });
                })

                adminPoolNamespace.emit('Coplest.Flinger.RAT', { Command: 'UnsubscribeSocketToApiKey#Request', Values: { SocketId: socket.id, ApiKey: socket.ApiKey } });
            });

            /* socket.on('Coplest.Flinger.IsBlocked?', function(data){
                _database.IP().
            }) */

            //Set Api Key and geolocation to connected socket
            socket.on('Coplest.Flinger.SubscribeSocketToApiKey', function (data) {
                if (data.ApiKey != undefined) {
                    var publicIP = socket.handshake.address.slice(7, 25)
                    if (data.ClientInformation.privateIP !== undefined && data.ClientInformation.privateIP !== null) {
                        _database.Ip().CheckIfIPIsBlockedByApiKey({
                            ApiKey: data.ApiKey,
                            PublicIP: publicIP,
                            QueryIP: data.ClientInformation.privateIP.IPv4
                        },
                            function (checkResult) {
                                _geolocate.Locate({ IP: publicIP }, function (geolocateResponse) {
                                    if (geolocateResponse !== undefined && geolocateResponse !== null) {
                                        if (geolocateResponse.success === true) {
                                            data.ClientInformation.Geolocation = geolocateResponse.result
                                        }
                                    }
                                    data.ClientInformation.PublicIP = publicIP;

                                    /// Set data to socket
                                    var connectedSocket = _io.sockets.connected[socket.id.split('#')[1]];
                                    connectedSocket.ApiKey = data.ApiKey;
                                    connectedSocket.ClientInformation = data.ClientInformation;

                                    if (checkResult !== undefined && checkResult !== null) {
                                        if (checkResult.success === true) {
                                            /// Check if IP is blocked
                                            if (checkResult.result.isBlocked === true) {
                                                _database.Site().GetSiteByApiKey({ ApiKey: data.ApiKey }, function (siteResult) {
                                                    socket.emit('Coplest.Flinger.ServerEvent', {
                                                        Command: 'BlockedUser', Values: {
                                                            SocketId: connectedSocket.id,
                                                            Message: siteResult.result.BlockUserText,
                                                            Location: data.ClientInformation.Geolocation,
                                                            PrivateIP: data.ClientInformation.privateIP.IPv4,
                                                            PublicIP: data.ClientInformation.PublicIP
                                                        }
                                                    });
                                                });
                                            }
                                            else {
                                                adminPoolNamespace.emit('Coplest.Flinger.RAT', { Command: 'SubscribeSocketToApiKey#Request', Values: { SocketId: socket.id.split('#')[1], ApiKey: data.ApiKey, ClientInformation: data.ClientInformation } });
                                            }
                                        }
                                    }

                                });

                            });
                    }
                    else {
                        adminPoolNamespace.emit('Coplest.Flinger.RAT', { Command: 'SubscribeSocketToApiKey#Request', Values: { SocketId: socket.id.split('#')[1], ApiKey: data.ApiKey, ClientInformation: data.ClientInformation } });
                    }
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

            socket.on('Coplest.Flinger.Screenshot', function (data) {
                if (data.Command != undefined) {
                    switch (data.Command) {
                        case 'PushScreenshot#Request':
                            _database.Site().WebCrawling(data.Values.ApiKey, data.Values.Endpoint, function (result) {
                                // if hasn't a screenshot
                                if (result == false) {
                                    _database.Screenshot().CreateScreenshot(data.Values, function (createScreenshotResult) {/*Screenshot saved*/ });
                                }
                            });
                            break;
                        case 'GetIfLastScreenshotIsObsoleteByApiKey#Request':
                            _database.Screenshot().GetIfLastScreenshotIsObsoleteByApiKey(data.Values, function (result) {
                                socket.emit('Coplest.Flinger.ServerEvent', { Command: 'GetIfLastScreenshotIsObsoleteByApiKey#Response', Values: result });
                            })
                            break;
                        default:
                            break;
                    }

                }
            })
        });
    }

    var blockUser = function (data, next) {console.log('blockUser catched');
    console.log(data);
        var connectedSocket = null;
        /// Search all connected sockets by ApiKey
        var keys = Object.keys(_io.sockets.connected)
        for (var index = 0; index < keys.length; index++) {
            console.log(`${keys[index]}`)
            if (_io.sockets.connected[keys[index]].id !== undefined) {console.log(`${_io.sockets.connected[keys[index]].id} ?? ${data.SocketId}`)
                if (_io.sockets.connected[keys[index]].id == data.SocketId) {console.log(`${_io.sockets.connected[keys[index]].id} == ${data.SocketId}`)
                    connectedSocket = _io.sockets.connected[keys[index]];
                    console.log('connectedSocket catched!')
                    break;
                }
            }
        }

        if (connectedSocket !== null) {console.log('connectedSocket != null')
            _database.Site().GetSiteByApiKey({ ApiKey: connectedSocket.ApiKey }, function (siteResult) {console.log('GetSiteByApiKey')
                userPoolNamespace.emit('Coplest.Flinger.ServerEvent', {
                    Command: 'BlockedUser',
                    Values: {
                        SocketId: connectedSocket.id,
                        Message: siteResult.result.BlockUserText,
                        Location: connectedSocket.ClientInformation.Geolocation,
                        PrivateIP: connectedSocket.ClientInformation.privateIP.IPv4,
                        PublicIP: connectedSocket.ClientInformation.PublicIP
                    }
                });console.log('finished emit')
                _database.Ip().CreateIP({ ApiKey: connectedSocket.ApiKey, PublicIP: connectedSocket.ClientInformation.PublicIP, PrivateIPs: connectedSocket.ClientInformation.privateIP.IPv4 }, function (result) {console.log('saved ip in database') });

                next({
                    success: true,
                    message: 'User blocked',
                    result: null
                });
            });
        }
    }

    return {
        Initialize: constructor,
        BlockUser: blockUser,
    }
}

module.exports = Socket;