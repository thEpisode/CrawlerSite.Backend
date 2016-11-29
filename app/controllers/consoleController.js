function ConsoleController(dependencies){

    /// Dependencies   
    var _colors;

    var constructor = function(){
        _colors = dependencies.colors;
    }

    var log = function(message, type){
        switch(type){
            case 'server-success':
                console.log(dependencies.colors.green(' Flinger: ') + message);
                break;
            case 'socket-message':
                console.log(dependencies.colors.gray(' Socket Message: ') + message);
                break;
        }
    }

    return {
        Initialize          : constructor,
        log                 : log
    }
}

module.exports = ConsoleController;