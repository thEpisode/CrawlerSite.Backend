function InvitationController(dependencies) {

    /// Dependencies   
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;

        _entity = require('../Models/Invitation')(dependencies);
        _entity.Initialize();
    }

    var createInvite = function (data, callback) {

        var invitation = new _entity.GetModel()(
            {
                Name: data.Name,
                Date: data.Date,
                Hour: data.Hour,
                Type: data.Type,
                Email: data.Email,
                Tel: data.Tel
            });

        invitation.save().then(function (result) {
            // When database return a result call the return
            callback();
        })
    }

    

    var getEntity = function () {
        return _entity;
    }

    return {
        Initialize: constructor,
        CreateInvite: createInvite,
        Entity: getEntity
    }
}

module.exports = InvitationController;