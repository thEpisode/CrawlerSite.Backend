/*! crawlersite.kernel - v0.0.1 - 2017-05-16 */
var Cross = (function () {
    var _timeStamp;
    var _serverUri;
    var _coreUri;
    var _clientInformation;
    var _clientStrings = [
        { s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/ },
        { s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
        { s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
        { s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
        { s: 'Windows Vista', r: /Windows NT 6.0/ },
        { s: 'Windows Server 2003', r: /Windows NT 5.2/ },
        { s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
        { s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
        { s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
        { s: 'Windows 98', r: /(Windows 98|Win98)/ },
        { s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
        { s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
        { s: 'Windows CE', r: /Windows CE/ },
        { s: 'Windows 3.11', r: /Win16/ },
        { s: 'Android', r: /Android/ },
        { s: 'Open BSD', r: /OpenBSD/ },
        { s: 'Sun OS', r: /SunOS/ },
        { s: 'Linux', r: /(Linux|X11)/ },
        { s: 'iOS', r: /(iPhone|iPad|iPod)/ },
        { s: 'Mac OS X', r: /Mac OS X/ },
        { s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
        { s: 'QNX', r: /QNX/ },
        { s: 'UNIX', r: /UNIX/ },
        { s: 'BeOS', r: /BeOS/ },
        { s: 'OS/2', r: /OS\/2/ },
        { s: 'Search Bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/ }
    ];
    var _clientLocation;
    var _apiKey;
    var _canUseHeatmaps;
    var _canUseRAT;
    var _canUseFunnels;
    var _canUseScreenRecorder;
    var _canUseFormAnalysis;
    var _flingerObj;

    var constructor = function (params) {
        if (params != undefined) {
            _debug = params.Debug;
        }

        _timeStamp = new Date();
        _serverUri = "//crawlerbackend.azurewebsites.net";
        _coreUri = "//crawlersite-kernel.azurewebsites.net";
        if (inIframe() == false) {
            setApiKey();
            analyzeClient();
            setUseHeatmaps(null);
            setUseRAT(null);
            setUseFunnels(null);
            setUseScreenRecorder(null);
            setUseFormAnalysis(null);
            createStringToDOMPrototype();
            setFlingerObj({});
            querySelectorPolyfill();
        }
    }

    var querySelectorPolyfill = function () {
        if (!document.querySelectorAll) {
            document.querySelectorAll = function (selectors) {
                var style = document.createElement('style'), elements = [], element;
                document.documentElement.firstChild.appendChild(style);
                document._qsa = [];

                style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
                window.scrollBy(0, 0);
                style.parentNode.removeChild(style);

                while (document._qsa.length) {
                    element = document._qsa.shift();
                    element.style.removeAttribute('x-qsa');
                    elements.push(element);
                }
                document._qsa = null;
                return elements;
            };
        }

        if (!document.querySelector) {
            document.querySelector = function (selectors) {
                var elements = document.querySelectorAll(selectors);
                return (elements.length) ? elements[0] : null;
            };
        }
    }

    var setFlingerObj = function (obj) {
        _flingerObj = obj;
    }

    var getFlingerObj = function () {
        return _flingerObj;
    }

    var setApiKey = function () {
        _flingerElement = document.querySelector('[data-flinger]');
        _apiKey = _flingerElement.dataset.flinger == undefined ? false : _flingerElement.dataset.flinger;
    }

    var timeStamp = function () {
        return _timeStamp.getTime();
    }

    var analyzeClient = function () {
        var unknown = '-';

        // screen
        var screenSize = {};
        if (screen.width) {
            width = (screen.width) ? screen.width : '';
            height = (screen.height) ? screen.height : '';
            screenSize.width = width;
            screenSize.height = height;
        }

        // browser size
        var browserSize = {};
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight || e.clientHeight || g.clientHeight;
        browserSize.width = x;
        browserSize.height = y;

        // browser
        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browser = navigator.appName;
        var version = '' + parseFloat(navigator.appVersion);
        var majorVersion = parseInt(navigator.appVersion, 10);
        var nameOffset, verOffset, ix;

        // Opera
        if ((verOffset = nAgt.indexOf('Opera')) != -1) {
            browser = 'Opera';
            version = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // Opera Next
        if ((verOffset = nAgt.indexOf('OPR')) != -1) {
            browser = 'Opera';
            version = nAgt.substring(verOffset + 4);
        }
        // Edge
        else if ((verOffset = nAgt.indexOf('Edge')) != -1) {
            browser = 'Microsoft Edge';
            version = nAgt.substring(verOffset + 5);
        }
        // MSIE
        else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
            browser = 'Microsoft Internet Explorer';
            version = nAgt.substring(verOffset + 5);
        }
        // Chrome
        else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
            browser = 'Chrome';
            version = nAgt.substring(verOffset + 7);
        }
        // Safari
        else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
            browser = 'Safari';
            version = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // Firefox
        else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
            browser = 'Firefox';
            version = nAgt.substring(verOffset + 8);
        }
        // MSIE 11+
        else if (nAgt.indexOf('Trident/') != -1) {
            browser = 'Microsoft Internet Explorer';
            version = nAgt.substring(nAgt.indexOf('rv:') + 3);
        }
        // Other browsers
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            browser = nAgt.substring(nameOffset, verOffset);
            version = nAgt.substring(verOffset + 1);
            if (browser.toLowerCase() == browser.toUpperCase()) {
                browser = navigator.appName;
            }
        }
        // trim the version string
        if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

        majorVersion = parseInt('' + version, 10);
        if (isNaN(majorVersion)) {
            version = '' + parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion, 10);
        }

        // mobile version
        var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

        // cookie
        var cookieEnabled = (navigator.cookieEnabled) ? true : false;

        if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
            document.cookie = 'testcookie';
            cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
        }

        // system
        var os = unknown;

        for (var id in _clientStrings) {
            var cs = _clientStrings[id];
            if (cs.r.test(nAgt)) {
                os = cs.s;
                break;
            }
        }

        var osVersion = unknown;

        if (/Windows/.test(os)) {
            osVersion = /Windows (.*)/.exec(os)[1];
            os = 'Windows';
        }

        switch (os) {
            case 'Mac OS X':
                osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'Android':
                osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'iOS':
                osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                break;
        }

        // flash
        var hasFlash = false;
        try {
            hasFlash = Boolean(new ActiveXObject('ShockwaveFlash.ShockwaveFlash'));
        }
        catch (exception) {
            hasFlash = ('undefined' != typeof navigator.mimeTypes['application/x-shockwave-flash']);
        }

        _clientInformation = {
            screen: screenSize,
            browserSize: browserSize,
            browser: browser,
            browserVersion: version,
            browserMajorVersion: majorVersion,
            mobile: mobile,
            os: os,
            osVersion: osVersion,
            cookies: cookieEnabled,
            flash: hasFlash,
            fullUserAgent: navigator.userAgent
        }
    }

    var userLocationLibrary_loaded = function () {
        geoip2.city(locationSuccesfuly, locationFails);
    }

    var locationSuccesfuly = function (clientLocation) {
        _clientLocation = clientLocation;
    }

    var locationFails = function () {
        _clientLocation = null;
    }

    var getScrollPosition = function () {
        return { X: window.pageXOffset, Y: window.pageYOffset }
    }

    var getServerUri = function () {
        return _serverUri;
    }

    var getCoreUri = function () {
        return _coreUri;
    }

    var getClientInformation = function () {
        return _clientInformation;
    }

    var getApiKey = function () {
        return _apiKey;
    }

    var setUseHeatmaps = function (canUse) {
        _canUseHeatmaps = canUse;
    }

    var setUseRAT = function (canUse) {
        _canUseRAT = canUse;
    }

    var setUseFunnels = function (canUse) {
        _canUseFunnels = canUse;
    }

    var setUseScreenRecorder = function canUse() {
        _canUseScreenRecorder = canUse;
    }

    var setUseFormAnalysis = function (canUse) {
        _canUseFormAnalysis = canUse;
    }

    var canUseHeatmaps = function () {
        return _canUseHeatmaps;
    }

    var canUseRAT = function () {
        return _canUseRAT;
    }

    var canUseFunnels = function () {
        return _canUseFunnels;
    }

    var canUseScreenRecorder = function () {
        return _canUseScreenRecorder;
    }

    var canUseFormAnalysis = function () {
        return _canUseFormAnalysis;
    }

    var searchObjectByIdOnArray = function (nameKey, _array) {
        for (var i = 0; i < _array.length; i++) {
            if (_array[i].Id === nameKey) {
                return _array[i];
            }
        }
        return null;
    }

    var createStringToDOMPrototype = function () {
        String.prototype.toDOM = function () {
            var d = document
                , i
                , a = d.createElement("div")
                , b = d.createDocumentFragment();
            a.innerHTML = this;
            while (i = a.firstChild) b.appendChild(i);
            return b;
        };
    }

    function inIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    function removejscssfile(filename, filetype) {
        var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "link" : "none" //determine element type to create nodelist from
        var targetattr = (filetype == "js") ? "src" : (filetype == "css") ? "href" : "none" //determine corresponding attribute to test for
        var allsuspects = document.getElementsByTagName(targetelement)
        for (var i = allsuspects.length; i >= 0; i--) { //search backwards within nodelist for matching elements to remove
            if (allsuspects[i] && allsuspects[i].getAttribute(targetattr) != null && allsuspects[i].getAttribute(targetattr).indexOf(filename) != -1)
                allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
        }
    }

    return {
        Initialize: constructor,
        TimeStamp: timeStamp,
        GetScrollPosition: getScrollPosition,
        GetServerUri: getServerUri,
        GetCoreUri: getCoreUri,
        GetClientInformation: getClientInformation,
        GetApiKey: getApiKey,
        SearchObjectByIdOnArray: searchObjectByIdOnArray,
        CanUseHeatmaps: canUseHeatmaps,
        CanUseRAT: canUseRAT,
        CanUseFunnels: canUseFunnels,
        CanUseScreenRecorder: canUseScreenRecorder,
        CanUseFormAnalysis: canUseFormAnalysis,
        SetUseHeatmaps: setUseHeatmaps,
        SetUseRAT: setUseRAT,
        SetUseFunnels: setUseFunnels,
        SetUseScreenRecorder: setUseScreenRecorder,
        SetUseFormAnalysis: setUseFormAnalysis,
        CreateStringToDOMPrototype: createStringToDOMPrototype,
        SetFlingerObj: setFlingerObj,
        GetFlingerObj: getFlingerObj,
        InIframe: inIframe,
        RemoveJSCSSfile: removejscssfile,
    };
})();

Cross.Initialize();
var SocketHub = (function () {

    /// Properties
    var _debug;
    var _socket;
    var _socketEvent;
    var _ratSocketPoolNamespace;
    var _ratServiceSocket;
    var _socketId;

    /// Initialize component
    var constructor = function (params) {
        if (params != undefined) {
            _debug = params.Debug;
        }

        injectSocketClientLibrary();
    }

    var injectSocketClientLibrary = function () {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.onload = socketLibrary_loaded;
        script.src = '//crawlerbackend.azurewebsites.net/socket.io-1.4.5.js';
        head.appendChild(script);
    }

    /// When Socket library is loaded 
    var socketLibrary_loaded = function () {
        connectUserPoolNamespaceSocket();
        if (_debug !== undefined) {
            if (_debug) {
                console.log('Socket Library is loaded succesfully');
            }
        }
    }

    /// Connection to Socket Server
    var connectUserPoolNamespaceSocket = function () {
        if (_debug !== undefined) {
            if (_debug) {
                console.log('Connecting to server...');
            }
        }
        _socket = io(Cross.GetServerUri() + '/user-pool-namespace', { query: 'ApiKey=' + Cross.GetApiKey() + '&ClientInformation=' + JSON.stringify(Cross.GetClientInformation()) });
        socketDefinition();
    }

    /// Define all events from socket
    var socketDefinition = function () {
        _socket.on('connect', function () {
            if (_debug !== undefined) {
                if (_debug) {
                    console.log('Connection to server succesfully');
                }
            }

            _socket.emit('Coplest.Flinger.AddApiKeyToSocket', { ApiKey: Cross.GetApiKey() })

            _socket.emit('Coplest.Flinger.CanISendData', { ApiKey: Cross.GetApiKey() })
        });
        _socket.on('Coplest.Flinger.ServerEvent', function (data) {
            pullEvent(data.Command, data.Values)
        });
        _socket.on('disconnect', function () {
            if (_debug !== undefined) {
                if (_debug) {
                    console.log('Disconected from server')
                }
            }
        });
        _socket.on('Coplest.Flinger.RAT', function (data) {
            if (data.Command != undefined) {
                switch (data.Command) {
                    case 'RATPoolConnection#Request':
                        ratPoolNamespace(data.Values);
                        break;

                    default:
                        break;
                }
            }
        })
    }

    var ratPoolNamespace = function (ratNamespaceValues) {
        console.log(Cross.GetServerUri() + ratNamespaceValues.RPN)
        _ratSocketPoolNamespace = io(Cross.GetServerUri() + ratNamespaceValues.RPN, { query: 'ApiKey=' + Cross.GetApiKey() + '&ClientInformation=' + JSON.stringify(Cross.GetClientInformation()) });
        ratPoolSocketDefinition(ratNamespaceValues);
    }

    var ratPoolSocketDefinition = function (ratNamespaceValues) {
        _ratSocketPoolNamespace.on('connect', function (data) {
            if (_debug !== undefined) {
                if (_debug) {
                    console.log('Connection to RAT Pool Namespace succesfully');
                }
            }
        })

        _ratSocketPoolNamespace.on('Coplest.Flinger.RAT', function (data) {
            if (data.Command != undefined) {
                switch (data.Command) {
                    case 'ConnectedToRPN#Response':
                        if (_debug !== undefined) {
                            if (_debug) {
                                console.log('Socket Event: ConnectedToRPN#Response');
                            }
                        }
                        _socketId = data.Values.SocketId;
                        _ratSocketPoolNamespace.emit('Coplest.Flinger.RAT', { Command: 'ConnectToRATServiceNamespace#Request', Values: { Namespace: ratNamespaceValues.Namespace } }, function (data) {
                            if (_debug !== undefined) {
                                if (_debug) {
                                    console.log('Socket Event: ConnectToRATServiceNamespace#Request');
                                }
                            }
                            ratServiceNamespace(data.Values, ratNamespaceValues);
                        });
                        break;

                    default:
                        break;
                }
            }
        })
    }

    var ratServiceNamespace = function (data, ratNamespaceData) {
        var ns = (Cross.SearchObjectByIdOnArray(ratNamespaceData.Namespace.Id, data.Namespace));
        if (ns != null) {
            console.log('RAT Service Socket URI: ' + Cross.GetServerUri() + '/' + ns.Id);
            _ratServiceSocket = io(Cross.GetServerUri() + '/' + ns.Id, { query: 'ApiKey=' + Cross.GetApiKey() + '&ClientInformation=' + JSON.stringify(Cross.GetClientInformation())});
            ratServiceSocketDefinition(data, ratNamespaceData);
        }
    }

    var ratServiceSocketDefinition = function (data, ratNamespaceData) {
        _ratServiceSocket.on('Coplest.Flinger.RAT', function (data) {
            if (data.Command != undefined) {
                switch (data.Command) {
                    case 'ConnectedToRSN#Response':
                        if (_debug !== undefined) {
                            if (_debug) {
                                console.log('Socket Event: ConnectedToRSN#Response');
                            }
                        }
                        _socketId = data.Values.SocketId;
                        _ratServiceSocket.emit('Coplest.Flinger.RAT', { Command: 'UserJoinToPrivateRoom#Request', Values: { SocketId: _ratServiceSocket.id, RoomId: ratNamespaceData.RoomId } });
                        break;
                    case 'UserJoinToPrivateRoom#Response':
                        if (_debug !== undefined) {
                            if (_debug) {
                                console.log('Socket Event: UserJoinToPrivateRoom#Response');
                            }
                        }
                        _ratServiceSocket.emit('Coplest.Flinger.RAT', { Command: 'TakeMyUserSocketId#Request', Values: { SocketId: _ratServiceSocket.id, RoomId: ratNamespaceData.RoomId } });
                        break;
                    case 'AllowControl#Request':
                        if (_debug !== undefined) {
                            if (_debug) {
                                console.log('AllowControl#Request');
                            }
                        }
                        RATHub.InjectModal(data.Values);
                        break;
                    case 'HideRealCursor#Request':
                        if (_debug !== undefined) {
                            if (_debug) {
                                console.log('HideRealCursor#Request');
                            }
                        }
                        RATHub.HideRealCursor();
                        break;
                    case 'PrintCursor#Request':
                        if (_debug !== undefined) {
                            if (_debug) {
                                console.log('PrintCursor#Request');
                            }
                        }
                        RATHub.PrintCursor();
                        break;
                    case 'SetInitialPositionCursor#Request':
                        if (_debug !== undefined) {
                            if (_debug) {
                                console.log('SetInitialPositionCursor#Request');
                            }
                        }
                        RATHub.SetInitialPositionCursor(data.Values);
                        break;
                    case 'SetScreenshotInterval#Request':
                        if (_debug !== undefined) {
                            if (_debug) {
                                console.log('SetScreenshotInterval#Request');
                            }
                        }
                        RATHub.SetScreenshotInterval(data.Values);
                        break;
                    case 'SetPositionMouse#Request':
                        if (_debug !== undefined) {
                            if (_debug) {
                                console.log('SetPositionMouse#Request');
                            }
                        }
                        RATHub.SetMousePosition(data.Values);
                        break;
                    case 'SetScrollDelta#Request':
                        if (_debug !== undefined) {
                            if (_debug) {
                                console.log('SetScrollDelta#Request');
                            }
                        }
                        RATHub.SetScrollDelta(data.Values);
                        break;
                    case 'Click#Request':
                        if (_debug !== undefined) {
                            if (_debug) {
                                console.log('Click#Request');
                            }
                        }
                        RATHub.VirtualClick(data.Values);
                        break;
                    default:
                        //console.log(data.Command);
                        break;
                }
            }
        })
    }

    var pushEventRAT = function (data) {
        if (_ratServiceSocket != undefined) {
            if (Cross.GetApiKey() != undefined && Cross.GetApiKey().length > 0) {
                _ratServiceSocket.emit('Coplest.Flinger.RAT', { Command: data.Command, Values: data.Values });
            }
        }
    }

    var pushEvent = function (data) {
        if (_socket != undefined) {
            if (Cross.GetApiKey() != undefined && Cross.GetApiKey().length > 0) {
                _socket.emit(data.Command, data.Values);
            }
        }
    }

    /// Push an insight to server
    var pushInsight = function (data) {
        if (_socket != undefined) {
            if (Cross.GetApiKey() != undefined && Cross.GetApiKey().length > 0) {
                _socket.emit('Coplest.Flinger.PushInsight', data);
            }
        }
    }

    var pushScreenshot = function (data) {
        if (_socket != undefined) {
            if (Cross.GetApiKey() != undefined && Cross.GetApiKey().length > 0) {
                _socket.emit('Coplest.Flinger.PushScreenshot', data);
            }
        }
    }

    /// Pull an event when server send a message
    var pullEvent = function (type, data) {
        _socketEvent = new CustomEvent(type, { detail: data });

        document.dispatchEvent(_socketEvent);
        /// Example to cath event
        //document.addEventListener("type", handlerFunction, false);
    }

    var getSocket = function () {
        return _socket;
    }

    return {
        Initialize: constructor,
        ConnectUserPoolNamespaceSocket: connectUserPoolNamespaceSocket,
        GetSocket: getSocket,
        PushInsight: pushInsight,
        PushScreenshot: pushScreenshot,
        PushEvent: pushEvent,
        PushEventRAT: pushEventRAT,
    };
})();
var EventHub = (function () {
    /// Properties
    var _debug;
    var _mouseClickEvents = [];
    var _mouseMovementEvents = [];
    var _mouseScrollEvents = [];

    /// Global Events
    document.addEventListener("InsightsQueue", function () {
        if (_mouseClickEvents.length > 0) {
            _mouseClickEvents.forEach(function (clickEvent) {
                SocketHub.PushInsight({ Command: 'Click', Values: { ApiKey: Cross.GetApiKey(), Event: clickEvent } })
            });
            _mouseClickEvents.length = 0
        }

        if (_mouseMovementEvents.length > 0) {
            _mouseMovementEvents.forEach(function (movementEvent) {
                SocketHub.PushInsight({ Command: 'Movement', Values: { Api: Cross.GetApiKey(), Event: movementEvent } })
            });
            _mouseMovementEvents.length = 0
        }

        if (_mouseScrollEvents.length > 0) {
            _mouseScrollEvents.forEach(function (scrollEvent) {
                SocketHub.PushInsight({ Command: 'Scroll', Values: { Api: Cross.GetApiKey(), Event: scrollEvent } })
            });
            _mouseScrollEvents.length = 0
        }

    }, false);

    document.addEventListener("CanUseHeatmaps", function (event) {
        if (_debug !== undefined) {
            if (_debug) {
                console.log('CanUseHeatmaps:');
                console.log(event)
            }
        }
        if (event.detail.success == true) {
            Cross.SetUseHeatmaps(event.detail.result);
            
            if(event.detail.result == true){
                SocketHub.PushEvent({ Command: 'Coplest.Flinger.ICanUseHeatmaps', Values: {} }); 
            }
        }
    }, false)

    /// Initialize component
    var constructor = function (params) {
        if (params != undefined) {
            _debug = params.Debug;
            injectMouseDotStyle();
        }
    }

    /// Make a click listener to all document 
    var injectMouseClickEventListener = function () {
        document.addEventListener('click', getMouseClickCoords);
    }

    var injectMouseMovementEventListener = function () {
        document.onmousemove = getMouseMovementCoords;
    }

    var injectMouseScrollEventListener = function () {
        window.addEventListener("scroll", getMouseScrollCoords, false);
    }

    var injectMouseDotStyle = function () {
        var css = '.dot {width: 1px; height: 1px; background-color: #000000; position: absolute;}';
        var head = document.getElementsByTagName('head')[0];
        var s = document.createElement('style');
        if (s.styleSheet) {   // IE
            s.styleSheet.cssText = css;
        } else {
            s.appendChild(document.createTextNode(css));
        }
        head.appendChild(s);
    }

    /// Catch all mouse scroll movement
    var getMouseScrollCoords = function (event) {
        var scrollEvent = {
            Position: { X: this.scrollX, Y: this.scrollY },
            TimeStamp: Cross.TimeStamp(),
            Client: Cross.GetClientInformation(),
            Location: {}
        }

        if (SocketHub.GetSocket() != undefined && SocketHub.GetSocket().connected === true) {
            if (Cross.CanUseHeatmaps() != undefined && Cross.CanUseHeatmaps() != null) {
                if(Cross.CanUseHeatmaps() == true){
                    SocketHub.PushInsight({ Command: 'Scroll', Values: { ApiKey: Cross.GetApiKey(), Event: scrollEvent, Pathname: window.location.pathname } })
                }
            }
        }
        else {
            _mouseScrollEvents.push(scrollEvent);
        }
    }

    /// Catch all mouse movement
    var getMouseMovementCoords = function (event) {
        var dot, eventDoc, doc, body, pageX, pageY;

        event = event || window.event; // IE-ism

        // If pageX/Y aren't available and clientX/Y are,
        // calculate pageX/Y - logic taken from jQuery.
        // (This is to support old IE)
        if (event.pageX == null && event.clientX != null) {


            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
                (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
                (doc && doc.scrollTop || body && body.scrollTop || 0) -
                (doc && doc.clientTop || body && body.clientTop || 0);
        }

        if (_debug !== undefined) {
            if (_debug) {
                // Add a dot to follow the cursor
                dot = document.createElement('div');
                dot.className = "dot";
                dot.style.left = event.pageX + "px";
                dot.style.top = event.pageY + "px";
                document.body.appendChild(dot);
            }
        }

        var movementEvent = {
            Position: { X: event.pageX, Y: event.pageY },
            Scroll: Cross.GetScrollPosition(),
            TimeStamp: Cross.TimeStamp(),
            Client: Cross.GetClientInformation(),
            Location: {}
        }

        if (SocketHub.GetSocket() != undefined && SocketHub.GetSocket().connected === true) {
            if (Cross.CanUseHeatmaps() != undefined && Cross.CanUseHeatmaps() != null) {
                if(Cross.CanUseHeatmaps() == true){
                    SocketHub.PushInsight({ Command: 'Movement', Values: { ApiKey: Cross.GetApiKey(), Event: movementEvent, Pathname: window.location.pathname } })
                }
            }
        }
        else {
            _mouseMovementEvents.push(movementEvent);
        }
    }

    /// Catch all mouse click
    var getMouseClickCoords = function (event) {
        var clickEvent = {
            Position: { X: event.clientX, Y: event.clientY },
            Scroll: Cross.GetScrollPosition(),
            TimeStamp: Cross.TimeStamp(),
            Client: Cross.GetClientInformation(),
            Location: {}
        };

        if (_debug !== undefined) {
            if (_debug) {
                console.log('Mouse coords: (' + event.clientX + ', ' + event.clientY + ')');
            }
        }
        if (SocketHub.GetSocket() != undefined && SocketHub.GetSocket().connected === true) {
            if (Cross.CanUseHeatmaps() != undefined && Cross.CanUseHeatmaps() != null) {
                if(Cross.CanUseHeatmaps() == true){
                    SocketHub.PushInsight({ Command: 'Click', Values: { ApiKey: Cross.GetApiKey(), Event: clickEvent, Pathname: window.location.pathname } })
                }
            }
        }
        else {
            _mouseClickEvents.push(clickEvent);
        }
    }

    var getNotSentMouseClickEvents = function () {
        return _mouseClickEvents;
    }

    var getNotSentMouseMovementEvents = function () {
        return _mouseMovementEvents;
    }

    var getNotSentMouseScrollEvents = function () {
        return _mouseScrollEvents;
    }

    return {
        Initialize: constructor,
        ListenMouseClick: injectMouseClickEventListener,
        ListenMouseMovement: injectMouseMovementEventListener,
        ListenMouseScroll: injectMouseScrollEventListener,
        GetNotSentMouseClickEvents: getNotSentMouseClickEvents,
        GetNotSentMouseMovementEvents: getNotSentMouseMovementEvents,
        GetNotSentMouseScrollEvents: getNotSentMouseScrollEvents
    };
})();
var RATHub = (function () {

	/// Properties
	var _debug;
	var _screenshotIntervalTime = 5000;
	var _screenshotInterval = null;
	var _cursorCSS = '.virtual-cursor {width: 10px; height: 17px; position: absolute;z-index:999999999;pointer-events: none!important;}';
	var _cursorHTML = '<img src="{CURSORSRC}" alt="virtual cursor" id="virtual-cursor" class="virtual-cursor">';
	var _hideRealCursorCSS = '.hide-real-cursor {cursor:none!important;}';
	var _scrollPos = 0;
	var _cursorPos = { X: 0, Y: 0 };
	var _roomId = '';

	/// Initialize component
	var constructor = function (params) {
		if (params != undefined) {
			_debug = params.Debug;
		}
	}

	var injectModal = function (socketData) {
		_roomId = socketData.RoomId;
		injectModernizrScript(function () {
			injectModalStyles(function () {
				injectModalScripts(function () {
					injectModalHTML(function () {
						var $CrawlerSite = Cross.GetFlingerObj();
						$CrawlerSite.RATDialog = {
							_dlg: {},
							Initialize: function () {
								var dialog = document.getElementById("rat-dialog");
								this._dlg = new DialogFx(dialog);
							},
							Toggle: function () {
								this._dlg.toggle();
							},
							SetData: function (title, text, acceptBtnText, closeBtnText) {
								document.querySelector("#rat-dialog>.dialog__content>h2").textContent = title == undefined ? "Remote Administration Tool" : title;
								document.querySelector("#rat-dialog>.dialog__content>h4").textContent = text == undefined ? "Web site administrator want to control your session, do you want to accept?" : text;
								document.querySelector("#rat-dialog>.dialog__content>div>.accept-button").textContent = acceptBtnText == undefined ? "ALLOW" : acceptBtnText;
								document.querySelector("#rat-dialog>.dialog__content>div>.cancel-button").textContent = closeBtnText == undefined ? "CLOSE" : closeBtnText;
							},
							Destroy: function (callback) {
								document.querySelector('#rat-dialog').parentNode.removeChild(document.querySelector('#rat-dialog'));
								Cross.RemoveJSCSSfile("modernizr.custom.js", "js");
								Cross.RemoveJSCSSfile("dialog.css", "css");
								Cross.RemoveJSCSSfile("dialogFx.js", "js");
								Cross.GetFlingerObj().RATDialog = undefined;

								callback();
							}
						}

						Cross.SetFlingerObj($CrawlerSite);

						Cross.GetFlingerObj().RATDialog.Initialize();
						Cross.GetFlingerObj().RATDialog.SetData();

						document.getElementById('allow-control').onclick = function () {
							allowControl();
						}

						document.getElementById('deny-control').onclick = function () {
							denyControl();
						}

						Cross.GetFlingerObj().RATDialog.Toggle();
					});
				});
			});
		})

	}

	var denyControl = function () {
		Cross.GetFlingerObj().RATDialog.Destroy(function () {
			SocketHub.PushEventRAT({ Command: 'UserDenyControl#Response', Values: { RoomId: _roomId } });
			//SocketHub.ConnectUserPoolNamespaceSocket();
		})
	}

	var allowControl = function () {
		Cross.GetFlingerObj().RATDialog.Destroy(function () {
			SocketHub.PushEventRAT({ Command: 'UserAllowControl#Response', Values: { RoomId: _roomId } });

			var dom = ScreenshotHub.TakeDOMScreenshot();
			SocketHub.PushEventRAT({ Command: 'UserScreenshot#Request', Values: { RoomId: _roomId, Screenshot: dom } });
		});
	}

	var injectModalHTML = function (callback) {
		var html = '<div id="rat-dialog" class="dialog"><div class="dialog__overlay"></div><div class="dialog__content"><h2></h2><h4></h4><div><button id="allow-control" class="action accept-button">Accept</button><button id="deny-control" class="action cancel-button" data-dialog-close>Close</button></div></div></div>';
		var range = document.createRange();
		range.selectNode(document.body);

		var fragment = range.createContextualFragment(html);
		document.body.appendChild(fragment);

		callback();
	}

	var injectModalStyles = function (callback) {
		var link = document.createElement('link');
		link.type = 'text/css';
		link.rel = 'stylesheet';
		link.onload = function () { callback(); };
		link.href = '//crawlersite-kernel.azurewebsites.net/build/assets/dialog.css';

		var head = document.getElementsByTagName('head')[0];
		head.appendChild(link);
	}

	var injectModalScripts = function (callback) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.onload = function () { callback(); };
		script.src = '//crawlersite-kernel.azurewebsites.net/build/assets/dialogFx.js';
		head.appendChild(script);
	}

	var injectModernizrScript = function (callback) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.onload = function () { callback(); };
		script.src = '//crawlersite-kernel.azurewebsites.net/build/assets/modernizr.custom.js';
		head.appendChild(script);
	}

	var mouseEventPolyfill = function () {
		try {
			new CustomEvent('test');
		} catch (e) {
			// Polyfills DOM4 CustomEvent
			function MouseEvent(eventType, params) {
				params = params || { bubbles: false, cancelable: false };
				var mouseEvent = document.createEvent('MouseEvent');
				mouseEvent.initMouseEvent(eventType, params.bubbles, params.cancelable, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

				return mouseEvent;
			}

			MouseEvent.prototype = Event.prototype;

			window.MouseEvent = MouseEvent;
		}


	}

	var hideRealCursor = function () {
		var head = document.getElementsByTagName('head')[0];
		var s = document.createElement('style');
		if (s.styleSheet) {   // IE
			s.styleSheet.cssText = _hideRealCursorCSS;
		} else {
			s.appendChild(document.createTextNode(_hideRealCursorCSS));
		}
		head.appendChild(s);

		var root = document.getElementsByTagName('html')[0];
		root.className += ' hide-real-cursor';
	}

	var setMousePosition = function (data) {
		if ((data.X != undefined && data.X != null) && (data.Y != undefined && data.Y != null)) {
			_cursorPos.X = data.X;
			_cursorPos.Y = data.Y;
			document.querySelector('#virtual-cursor').style.left = _cursorPos.X + 'px';
			document.querySelector('#virtual-cursor').style.top = (_scrollPos + _cursorPos.Y) + 'px';

			var selectedElement = document.elementFromPoint(_cursorPos.X, _cursorPos.Y);
			if (selectedElement != undefined && selectedElement != null) {
				var event = new MouseEvent("mouseover", {
					bubbles: true,
					cancelable: true,
					view: window
				});

				selectedElement.dispatchEvent(event);
				//console.log(selectedElement);
			}
		}
	}

	var virtualClick = function (data) {
		if ((data.X != undefined && data.X != null) && (data.Y != undefined && data.Y != null)) {
			_cursorPos.X = data.X;
			_cursorPos.Y = data.Y;

			var event = new MouseEvent("click", {
				bubbles: true,
				cancelable: true,
				view: window
			});

			document.elementFromPoint(_cursorPos.X, _cursorPos.Y).dispatchEvent(event);

			var dom = ScreenshotHub.TakeDOMScreenshot();
			SocketHub.PushEventRAT({ Command: 'UserScreenshot#Request', Values: { RoomId: _roomId, Screenshot: dom } });
		}
	}

	var printCursor = function () {
		// Inject virtual cursor style
		var head = document.getElementsByTagName('head')[0];
		var s = document.createElement('style');
		if (s.styleSheet) {   // IE
			s.styleSheet.cssText = _cursorCSS;
		} else {
			s.appendChild(document.createTextNode(_cursorCSS));
		}
		head.appendChild(s);

		var body = document.getElementsByTagName('body')[0];
		var cursor = _cursorHTML.replace('{CURSORSRC}', Cross.GetCoreUri() + '/build/assets/fake_cursor.png');
		var virtualCursor = cursor.toDOM();
		body.appendChild(virtualCursor);
	}

	var setInitialPositionCursor = function (data) {
		setMousePosition(data);
	}

	var setScreenshotInterval = function (data) {
		_screenshotIntervalTime = data.Interval;

		/*_screenshotInterval = setInterval(function(){
			var dom = ScreenshotHub.TakeDOMScreenshot();
			SocketHub.PushEventRAT({Command:'UserScreenshot#Request', Values: {RoomId: _roomId, Screenshot: dom}});
		}, _screenshotIntervalTime);*/

	}

	var setScrollDelta = function (data) {
		if (data.Delta != undefined && data.Delta != null) {
			var step = 80;
			var currentPosition = document.documentElement.scrollTop || document.body.scrollTop;
			_scrollPos = (currentPosition + (step * (data.Delta)) * -1);

			window.scrollTo(0, _scrollPos);
			setMousePosition(_cursorPos);
		}
	}

	return {
		Initialize: constructor,
		PrintCursor: printCursor,
		SetMousePosition: setMousePosition,
		SetInitialPositionCursor: setInitialPositionCursor,
		SetScreenshotInterval: setScreenshotInterval,
		HideRealCursor: hideRealCursor,
		SetScrollDelta: setScrollDelta,
		VirtualClick: virtualClick,
		InjectModal: injectModal,
	};
})();
var ScreenshotHub = (function () {
    /// Properties
    var _debug;
    var _isOnDescoveryMode;

    /// Initialize component
    var constructor = function (params) {
        if (params != undefined) {
            _debug = params.Debug;
        }
        injecthtml2canvasLibrary();
        getIfSiteIsInDiscoveryMode();
    }

    var injecthtml2canvasLibrary = function () {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.onload = injecthtml2canvasSVGLibrary;
        script.src = '//crawlersite-kernel.azurewebsites.net/build/assets/html2canvas.min.js'; 
        head.appendChild(script);
    }

    var injecthtml2canvasSVGLibrary = function () {
        var head = document.getElementsByTagName('head')[0];
        var script2 = document.createElement('script');
        script2.type = 'text/javascript';
        script2.onload = html2canvasLibrary_loaded;
        script2.src = '//crawlersite-kernel.azurewebsites.net/build/assets/html2canvas.svg.min.js';
        head.appendChild(script2);
    }

    var html2canvasLibrary_loaded = function () {
        var body = document.getElementsByTagName('body')[0];
        var div = document.createElement('div');
        div.id = 'screenshot-result';
        div.style.display = "none";

        if (_debug !== undefined) {
            if (_debug) {
                console.log('html2canvas Library is loaded succesfully');
                div.style.display = "block";

            }
        }
        body.appendChild(div);
        takeScreenshot(function () {
            //if (_isOnDescoveryMode == true) {
                saveScreenshot();
            //}
        });
    }

    var takeScreenshot = function (callback) {
        if (_debug !== undefined) {
            if (_debug) {
                console.log('takeScreenshot');
            }
        }
        html2canvas(document.body, {
            onrendered: function (html2canvasResult) {
                if (_debug !== undefined) {
                    if (_debug) {
                        console.log('takeScreenshot then');
                    }
                }
                /*var maxWidth = 850;
                var ratio = maxWidth / html2canvasResult.width;
                var height = html2canvasResult.height * ratio;
                var width = html2canvasResult.width * ratio

                var _canvas = document.createElement("canvas");
                _canvas.width = width;
                _canvas.height = height;

                var ctx = _canvas.getContext("2d");
                ctx.scale(ratio, ratio);
                ctx.drawImage(html2canvasResult, 0, 0);
                ctx.save();

                var base64Result = _canvas.toDataURL('image/jpeg', 1);*/
                //document.querySelector(".img-responsive").setAttribute('src', base64Result);
                document.getElementById('screenshot-result').appendChild(html2canvasResult);

                callback(html2canvasResult.toDataURL());
            }
        });
    }

    var saveScreenshot = function () {
        //if (_isOnDescoveryMode) {
            var canvas = document.querySelector('#screenshot-result>canvas');

            SocketHub.PushScreenshot({ Command: 'Scroll', Values: { Base64Data: canvas.toDataURL(), Endpoint: document.location.pathname, ApiKey: Cross.GetApiKey() } })
        //}
    }

    var getIfSiteIsInDiscoveryMode = function () {
        /*var endpoint = '/api/Site/DiscoveryMode/' + Cross.GetApiKey();

        function reqListener() {
            _isOnDescoveryMode = JSON.parse(this.responseText).result == undefined ? false : JSON.parse(this.responseText).result;
        }

        var ajaxRequest = new XMLHttpRequest();
        ajaxRequest.addEventListener("load", reqListener);
        ajaxRequest.open("GET", Cross.GetServerUri() + endpoint);
        ajaxRequest.send();*/
    }

    /* ====== NEW CODE */

    function urlsToAbsolute(nodeList) {
		if (!nodeList.length) {
			return [];
		}

		var attrName = 'href';
		if (nodeList[0].__proto__ === HTMLImageElement.prototype ||
			nodeList[0].__proto__ === HTMLScriptElement.prototype) {
			attrName = 'src';
		}

		nodeList = [].map.call(nodeList, function (el, i) {
			var attr = el.getAttribute(attrName);
			// If no src/href is present, disregard.
			if (!attr) {
				return;
			}

			var absURL = /^(https?|data):/i.test(attr);
			if (absURL) {
				return el;
			} else {
				// Set the src/href attribute to an absolute version. 
				// if (attr.indexOf('/') != 0) { // src="images/test.jpg"
				//        el.setAttribute(attrName, document.location.origin + document.location.pathname + attr);
				//      } else if (attr.match(/^\/\//)) { // src="//static.server/test.jpg"
				//        el.setAttribute(attrName, document.location.protocol + attr);
				//      } else {
				//        el.setAttribute(attrName, document.location.origin + attr);
				//      }

				// Set the src/href attribute to an absolute version. Accessing
				// el['src']/el['href], the browser will stringify an absolute URL, but
				// we still need to explicitly set the attribute on the duplicate.
				el.setAttribute(attrName, el[attrName]);
				return el;
			}
		});
		return nodeList;
	}

	// TODO: current limitation is css background images are not included.
	function screenshotPage() {
		// 1. Rewrite current doc's imgs, css, and script URLs to be absolute before
		// we duplicate. This ensures no broken links when viewing the duplicate.
		urlsToAbsolute(document.images);
		urlsToAbsolute(document.querySelectorAll("link[rel='stylesheet']"));
		urlsToAbsolute(document.scripts);

		// 2. Duplicate entire document.
		var screenshot = document.documentElement.cloneNode(true);

		// Use <base> to make anchors and other relative links absolute.
		var b = document.createElement('base');
		b.href = document.location.protocol + '//' + location.host;
		var head = screenshot.querySelector('head');
		head.insertBefore(b, head.firstChild);

		// 3. Screenshot should be readyonly, no scrolling, and no selections.
		screenshot.style.pointerEvents = 'none';
		screenshot.style.overflow = 'hidden';
		screenshot.style.webkitUserSelect = 'none';
		screenshot.style.mozUserSelect = 'none';
		screenshot.style.msUserSelect = 'none';
		screenshot.style.oUserSelect = 'none';
		screenshot.style.userSelect = 'none';

		// 4. Preserve current x,y scroll position of this page. See addOnPageLoad_().
		screenshot.dataset.scrollX = window.scrollX;
		screenshot.dataset.scrollY = window.scrollY;

		// 4.5. When the screenshot loads (e.g. as ablob URL, as iframe.src, etc.),
		// scroll it to the same location of this page. Do this by appending a
		// window.onDOMContentLoaded listener which pulls out the saved scrollX/Y
		// state from the DOM.
		var script = document.createElement('script');
		script.textContent = '(' + addOnPageLoad_.toString() + ')();'; // self calling.
		screenshot.querySelector('body').appendChild(script);

		// 5. Create a new .html file from the cloned content.
		var blob = new Blob([screenshot.outerHTML], { type: 'text/html' });

		return blob;
	}

	// NOTE: Not to be invoked directly. When the screenshot loads, it should scroll
	// to the same x,y location of this page.
	function addOnPageLoad_() {
		window.addEventListener('DOMContentLoaded', function (e) {
			var scrollX = document.documentElement.dataset.scrollX || 0;
			var scrollY = document.documentElement.dataset.scrollY || 0;
			window.scrollTo(scrollX, scrollY);
		});
	}

    return {
        Initialize: constructor,
        TakeScreenshot: takeScreenshot,
        TakeDOMScreenshot: screenshotPage,
    };
})();;
var Flinger = (function () {
	var _flingerElement;
	var _debugFlinger;

	var constructor = function () {
		if (Cross.InIframe() == false) {
			_flingerElement = document.querySelector('[data-flinger]');

			// Check if script is on debug mode
			_debugFlinger = _flingerElement.dataset.debug == undefined ? false : JSON.parse(_flingerElement.dataset.debug);
			if (_debugFlinger === true) {
				console.log('Flinger is on debug mode');
			}

			SocketHub.Initialize({ Debug: _debugFlinger });
			ScreenshotHub.Initialize({ Debug: _debugFlinger });
			RATHub.Initialize({ Debug: _debugFlinger });

			// Event Hub definition
			EventHub.Initialize({ Debug: _debugFlinger });
			EventHub.ListenMouseClick();
			EventHub.ListenMouseMovement();
			EventHub.ListenMouseScroll();
		}
	}

	return {
		Initialize: constructor,
		GetNotSentMouseClickEvents: EventHub.GetNotSentMouseClickEvents,
		GetNotSentMouseMovementEvents: EventHub.GetNotSentMouseMovementEvents,
		GetNotSentMouseScrollEvents: EventHub.GetNotSentMouseScrollEvents
	};
})();

Flinger.Initialize();