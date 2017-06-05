function UserController(dependencies) {

    /// Dependencies
    var _console;
    var _database;
    var _mongoose;
    var _app;
    var _jwt;
    var _stripeController;
    var _subscriptionController;

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
        _cross = dependencies.cross;
        _console = dependencies.console;

        _entity = require('../Models/User')(dependencies);
        _entity.Initialize();
    }

    var createUser = function (data, callback) {
        _entity.GetModel().findOne({ "Email": new RegExp('^' + data.Email, 'i') }, function (err, user) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something was wrong while creating user' });
            }
            else {
                if (user != null) {
                    callback({ success: false, message: 'This email is already registered' });
                }
                else {
                    var user = new _entity.GetModel()(
                        {
                            _id: _mongoose.Types.ObjectId(),
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
                            ChangePasswordNextLogin: data.ChangePasswordNextLogin != undefined ? data.ChangePasswordNextLogin : false,
                            HasCouponCode: data.VoucherId != undefined && data.VoucherId != '' ? true : false,
                            ReferCode: _cross.GetRandomString(5, 'ref-'),
                        });

                    user.save().then(function (userResult) {
                        // When database return any result call the "return" named callback
                        userResult.VoucherId = data.VoucherId;
                        _stripeController.CreateInitialCustomer(userResult, function (stripeResult) {
                            if (stripeResult != undefined && stripeResult != null) {
                                if (stripeResult.success == true) {
                                    // If has voucher
                                    if (data.VoucherId != undefined && data.VoucherId != '') {
                                        // Redeem voucher and validate it
                                        _stripeController.RedeemVoucher({ SubscriptionId: stripeResult.result.SubscriptionId, VoucherId: data.VoucherId }, function (redeemResult) {
                                            if (redeemResult != undefined && redeemResult != null) {
                                                if (redeemResult.success == true) {
                                                    callback({ success: true, message: 'CreateUser', result: stripeResult });
                                                }
                                                else {
                                                    callback({ success: false, message: 'Something was wrong while creating user', result: null });
                                                }
                                            }
                                            else {
                                                callback({ success: false, message: 'Something was wrong while creating user', result: null });
                                            }
                                        })
                                    }
                                    /// User has not voucher to redeem
                                    else {
                                        callback({ success: true, message: 'CreateUser', result: stripeResult });
                                    }
                                }
                                else {
                                    callback({ success: false, message: 'Something was wrong while creating user', result: null });
                                }
                            }
                            else {
                                callback({ success: false, message: 'Something was wrong while creating user', result: null });
                            }
                        });
                    }, function (err) {
                        _console.log(err, 'error');
                        callback({ success: false, message: 'Something was wrong while creating user', result: null });
                    })
                }
            }
        });
    }

    var createUserToSubscription = function (data, callback) {
        _database.Subscription().GetSubscriptionByUserId({ UserId: data.UserId }, function (subscriptionResult) {
            if (subscriptionResult !== undefined) {
                if (subscriptionResult.success === true) {
                    _entity.GetModel().findOne({ "Email": new RegExp('^' + data.Email, 'i') }, function (err, user) {
                        if (err) {
                            _console.log(err, 'error');
                            callback({ success: false, message: 'Something was wrong while creating user' });
                        }
                        else {
                            if (user != null) {
                                callback({ success: false, message: 'This email is already registered' });
                            }
                            else {
                                var user = new _entity.GetModel()(
                                    {
                                        _id: _mongoose.Types.ObjectId(),
                                        FirstName: data.FirstName,
                                        LastName: data.LastName,
                                        Email: data.Email,
                                        Password: (data.Password !== undefined && data.Password !== null ? data.Password : _cross.GetRandomString(10, '')),
                                        Work: data.Work,
                                        City: data.City,
                                        Country: data.Country,
                                        AcceptTerms: data.AcceptTerms,
                                        State: data.State,
                                        Settings: [],
                                        ChangePasswordNextLogin: data.ChangePasswordNextLogin != undefined ? data.ChangePasswordNextLogin : false,
                                        ReferCode: _cross.GetRandomString(5, 'ref-'),
                                    });

                                user.save().then(function (userResult) {
                                    _database.Subscription().AddUserToSubscription({ SubscriptionId: subscriptionResult.result._id, UserId: userResult._id }, function (addSubscriptionResult) {
                                        if (addSubscriptionResult !== undefined && addSubscriptionResult !== null) {
                                            if (addSubscriptionResult.success === true) {
                                                callback({ success: true, message: 'CreateUser', result: userResult });
                                            }
                                            else {
                                                callback({ success: false, message: 'Something was wrong while creating user', result: null });
                                            }
                                        }
                                        else {
                                            callback({ success: false, message: 'Something was wrong while creating user', result: null });
                                        }
                                    })
                                },
                                    function (err) {
                                        _console.log(err, 'error');
                                        callback({ success: false, message: 'Something was wrong while creating user', result: null });
                                    });
                            }
                        }
                    });
                }
                else {
                    callback({ success: false, message: 'Something was wrong while creating user', result: null });
                }
            }
            else {
                callback({ success: false, message: 'Something was wrong while creating user', result: null });
            }
        })
    }

    var deleteAccountByUserId = function (data, callback) {
        _database.Site().GetAllSitesByUserId({ "_id": data.UserId }, function (sitesResult) {

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
                    _console.log(err, 'error');
                    callback({ success: false, message: 'Something went wrong when updating password, try again.', result: null });
                }

                callback({ success: true, message: 'ChangePasswordByUserId', result: result });
            })
        });
    }

    var deleteUserByUserId = function (data, callback) {
        _entity.GetModel().findOneAndRemove({ "_id": data.UserId }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something went wrong when updating password, try again.', result: null });
            }

            callback({ success: true, message: 'ChangePasswordByUserId', result: result });
        })
    }

    var changePasswordByUserId = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data.UserId }, function (err, userResult) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something went wrong when updating password, try again.', result: null });
            }
            else {
                // Decrypt password and compare
                if (userResult.Password === data.OldPassword) {
                    _entity.GetModel().findOneAndUpdate({ "_id": data.UserId }, { $set: { Password: data.NewPassword } }, { upsert: false }, function (err, result) {
                        if (err) {
                            _console.log(err, 'error');
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
            if (err) {
                _console.log(err, 'error');
            }
            else {
                if (result != null) {
                    result.StripeToken = '';

                    callback(result);
                }

            }

        })
    }

    var getUserByEmail = function (data, callback) {
        _entity.GetModel().findOne({ "Email": data }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something went wrong while retrieving user, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'GetUserByEmail', result: result });
            }
        })
    }

    var getUserByCredentials = function (data, callback) {

        _entity.GetModel().findOne({ "Email": data.Email }, function (err, user) {
            if (err) _console.log(err, 'error');

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
                _console.log(err, 'error');
                callback({ success: false, message: 'GetAllUser', result: null });
            }

            callback({ success: true, message: 'GetAllUser', result: result });
        })
    }

    var getEntity = function () {
        return _entity;
    }

    var editUser = function (data, callback) {
        _entity.GetModel().findOneAndUpdate({ "_id": data._id }, { $set: { Email: data.Email, FirstName: data.FirstName, LastName: data.LastName, City: data.City, Country: data.Country } }, { upsert: false }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                callback(false);
            }

            callback(result);
        });
    }

    var setHasCouponCode = function (data, callback) {
        _entity.GetModel().findOneAndUpdate({ "Email": data.Email }, { $set: { HasCouponCode: data.HasCouponCode } }, { upsert: false }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something went wrong while updating your voucher, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'SetHasCouponCode', result: result });
            }
        });
    }

    return {
        Initialize: constructor,
        CreateUser: createUser,
        CreateUserToSubscription: createUserToSubscription,
        DeleteAccountByUserId: deleteAccountByUserId,
        DeleteByUserId: deleteUserByUserId,
        ChangePasswordByUserId: changePasswordByUserId,
        GetUserById: getUserById,
        GetUserByEmail: getUserByEmail,
        GetUserByCredentials: getUserByCredentials,
        GetAllUser: getAllUser,
        EditUser: editUser,
        SetHasCouponCode: setHasCouponCode,
        Entity: getEntity
    }
}

module.exports = UserController;