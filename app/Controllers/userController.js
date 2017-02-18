function UserController(dependencies) {

    /// Dependencies   
    var _mongoose;
    var _app;
    var _jwt;

    /// Properties
    var _entity;
    var _schema;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _schema = _mongoose.Schema;
        _app = dependencies.app;
        _jwt = dependencies.jwt;

        _entity = require('../Models/User')(dependencies);
        _entity.Initialize();
    }

    var createUser = function (data, callback) {

        _entity.GetModel().findOne({ "Email": data.Email }, function (err, user) {
            if (err) console.log(err);

            if (user != null) {
                callback({ success: false, message: 'This email is already registered' });
            }
            else {
                var user = new _entity.GetModel()(
                    {
                        _id: _mongoose.Types.ObjectId(),
                        CustomerId: undefined,
                        PlanId: undefined,
                        SubscriptionId: undefined,
                        FirstName: data.FirstName,
                        LastName: data.LastName,
                        Email: data.Email,
                        Password: data.Password,
                        Work: data.Work,
                        City: data.City,
                        Country: data.Country,
                        AcceptTerms: data.AcceptTerms,
                        State: data.State,
                        Settings: []
                    });

                user.save().then(function (result) {
                    // When database return a result call the return
                    callback({ success: true, message: 'CreateUser', result: result });
                }, function (err) {
                    console.log('Error while saving:')
                    console.log(err)
                })
            }
        })


    }

    var deleteUser = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            if (err) {
                console.log(err);
                callback(false);
            }

            callback(true);
        })
    }

    var getUserById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getUserByEmail = function (data, callback) {

        _entity.GetModel().findOne({ "Email": data }, function (err, result) {
            if (err) console.log(err);
            callback(result);
        })
    }

    var getUserByCredentials = function (data, callback) {

        _entity.GetModel().findOne({ "Email": data.Email }, function (err, user) {
            if (err) console.log(err);

            if (user == null) {
                callback({ Success: false, Message: 'The username and password you entered did not match our records. Please double-check and try again.' });
            }
            else if (user != null) {
                if (user.Password != data.Password) {
                    callback({ Success: false, Message: 'The username and password you entered did not match our records. Please double-check and try again.' });
                }
                else {
                    var secret = _app.get('FlingerSecretJWT');
                    // creatingJson Web Token
                    var token = _jwt.sign(user, secret, {
                        expiresIn: '24h' // expires in 24 hours
                    });

                    callback({
                        UserId: user._id,
                        Success: true,
                        Message: 'Authentication succesfuly',
                        AuthToken: token
                    });
                }
            }
        })
    }

    var getAllUser = function (data, callback) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getEntity = function () {
        return _entity;
    }

    var editUser = function (data, callback) {

        _entity.GetModel().findOneAndUpdate({ "_id": data._id }, { $set: { Email: data.Email, FirstName: data.FirstName, LastName: data.LastName } }, { upsert: false }, function (err, result) {
            if (err) {
                console.log(err);
                callback(false);
            }

            callback(result);
        })
    }

    var updatePaymentData = function(data, callback){
        _entity.GetModel().findOneAndUpdate({ "_id": data._id }, { $set: { CustomerId: data.CustomerId, PlanId: data.PlanId, SubscriptionId: data.SubscriptionId } }, { upsert: false }, function (err, result) {
            if (err) {
                console.log(err);
                callback(null);
            }

            callback(result);
        })
    }

    return {
        Initialize: constructor,
        CreateUser: createUser,
        DeleteUser: deleteUser,
        GetUserById: getUserById,
        GetUserByEmail: getUserByEmail,
        GetUserByCredentials: getUserByCredentials,
        GetAllUser: getAllUser,
        EditUser: editUser,
        UpdatePaymentData: updatePaymentData,
        Entity: getEntity
    }
}

module.exports = UserController;