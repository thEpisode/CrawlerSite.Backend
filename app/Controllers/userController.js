function UserController(dependencies) {

    /// Dependencies
    var _database;
    var _mongoose;
    var _app;
    var _jwt;
    var _stripeController;

    /// Properties
    var _entity;
    var _schema;

    var constructor = function () {
        _database = dependencies.database;
        _mongoose = dependencies.mongoose;
        _schema = _mongoose.Schema;
        _app = dependencies.app;
        _jwt = dependencies.jwt;
        _stripeController = dependencies.stripeController;

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
                        StripeToken: '',
                        CustomerId: '',
                        PlanId: '',
                        SubscriptionId: '',
                        FirstNameCard: '',
                        LastNameCard: '',
                        FirstName: data.FirstName,
                        LastName: data.LastName,
                        Email: data.Email,
                        Password: data.Password,
                        Work: data.Work,
                        City: data.City,
                        Country: data.Country,
                        AcceptTerms: data.AcceptTerms,
                        State: data.State,
                        Settings: [],

                    });

                user.save().then(function (result) {
                    // When database return any result call the "return" named callback
                    _stripeController.CreateInitialCustomer(result, function (stripeResult) {
                        callback(stripeResult);
                    });
                }, function (err) {
                    console.log('Error while saving:')
                    console.log(err)
                })
            }
        })
    }

    var deleteUser = function (data, callback) {
        _database.Site().GetAllSitesByUserId(data.UserId, function (sitesResult) {


            if (sitesResult.result.length > 0) {
                for (var i = 0; i < sitesResult.result.length; i++) {
                    if (sitesResult.result[i].UsersId.length == 1) {
                        if (sitesResult.result[i].UsersId[0] == data.UserId) {
                            _database.Site().DeleteSite(sitesResult.result[i]._id, function () { });
                        }
                    }
                }
            }

            _entity.GetModel().findOneAndRemove(data.UserId, function (err, result) {
                if (err) {
                    console.log(err);
                    callback({ success: false, message: 'Something went wrong when updating password, try again.', result: null });
                }

                callback({ success: true, message: 'ChangePasswordByUserId', result: result });
            })
        });

    }

    var changePasswordByUserId = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data.UserId }, function (err, userResult) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when updating password, try again.', result: null });
            }
            else {
                // Decrypt password and compare
                if (userResult.Password === data.OldPassword) {
                    _entity.GetModel().findOneAndUpdate({ "_id": data.UserId }, { $set: { Password: data.NewPassword } }, { upsert: false }, function (err, result) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: 'Something went wrong when updating password, try again.', result: null });
                        }

                        callback({ success: true, message: 'ChangePasswordByUserId', result: result });
                    })
                }
                else {
                    callback({ success: false, message: 'Old password isn\'t valid, try again.', result: null });
                }
            }
        })
    }

    var getUserById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) console.log(err);

            result.StripeToken = '';

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
            if (err) {
                console.log(err);
                callback({ success: false, message: 'GetAllUser', result: null });
            }

            callback({ success: true, message: 'GetAllUser', result: result });
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

    var updatePaymentData = function (data, callback) {
        _entity.GetModel().findOneAndUpdate({ "_id": data._id }, { $set: { StripeToken: data.StripeToken, CustomerId: data.CustomerId, PlanId: data.PlanId, SubscriptionId: data.SubscriptionId, FirstNameCard: data.FirstNameCard, LastNameCard: data.LastNameCard } }, { upsert: false }, function (err, result) {
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
        DeleteAccountByUserId: deleteUser,
        ChangePasswordByUserId: changePasswordByUserId,
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