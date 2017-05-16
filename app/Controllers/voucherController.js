function VoucherController(dependencies) {

    /// Dependencies   
    var _console;
    var _mongoose;
    var _stripeController;
    var _notificationHubController;
    var _database;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _stripeController = dependencies.stripeController;
        _notificationHubController = dependencies.notificationHub;
        _database = dependencies.database;
        _console = dependencies.console;

        _entity = require('../Models/Voucher')(dependencies);
        _entity.Initialize();
    }

    var createVoucher = function (data, callback) {
        _stripeController.GenerateDiscountVoucher(data, function (voucherResult) {
            var voucher = new _entity.GetModel()(
                {
                    _id: _mongoose.Types.ObjectId(),
                    StripeData: voucherResult.result,
                    State: _entity.GetStates().Unremeeded,
                    VoucherId: voucherResult.result.id
                });

            voucher.save().then(function (result) {
                // Voucher was sent only for email attached
                sendVoucher(result.StripeData, function (notificationResult) {
                    _database.User().SetHasCouponCode({ Email: result.StripeData.metadata.Email, HasCouponCode: true }, function (changedUserResult) {
                        // When database return a result call the return
                        callback({ success: true, message: 'CreateVoucher', result: result });
                    })
                });


            }, function (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something went wrong when creating your voucher, try again.', result: null });
            });
        })

    }

    var sendVoucher = function (data, callback) {
        _database.User().GetUserByEmail(data.metadata.Email, function (userResult) {
            if (userResult != undefined && userResult != null) {
                if (userResult.result != undefined && userResult.result != null) {
                    _notificationHubController.Send({
                        IsEmail: true,
                        IsInApp: true,
                        EmailData: {
                            Subject: 'Crawler Site Discount Voucher',
                            To: userResult.result.Email,
                            Text: 'Your voucher is: ' + data.id,
                            ComposedTitle: 'Crawler Site Discount Voucher',
                            ComposedBody: 'Your voucher is: <b>' + data.id + '</b>',
                            ComposedUrlAction: 'https://www.crawlersite.com',
                            ComposedTextAction: 'Open Crawler Site',
                        },
                        InAppData: {
                            UserId: userResult.result._id,
                            ShortMessage: 'You have a discount voucher!',
                            LongMessage: 'Your voucher is: <b>' + data.id + '</b>',
                            Uri: '/Billing/',
                            Type: _notificationHubController.GetNotificationTypes().Billing,
                            State: _notificationHubController.GetNotificationStates().Unread,
                        }
                    }, function (result) {
                        callback(result);
                    });
                }
                else {
                    _notificationHubController.Send({
                        IsEmail: true,
                        EmailData: {
                            Subject: 'Crawler Site Discount Voucher',
                            To: data.metadata.Email,
                            Text: 'Your voucher is: ' + data.id,
                            ComposedTitle: 'Crawler Site Discount Voucher',
                            ComposedBody: 'Welcome to Crawler Site and your have a voucher: <b>' + data.id + '</b><br>Redeem the code and feel free of cost.',
                            ComposedUrlAction: 'https://www.crawlersite.com',
                            ComposedTextAction: 'Open Crawler Site',
                        }
                    }, function (result) {
                        callback(result);
                    });
                }
            }
            else {
                callback({ success: false, message: 'Something went wrong while sending your voucher, try again.', result: null });
            }
        });
    }

    var deleteVoucher = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something went wrong when deleting your voucher, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'DeleteVoucher', result: result });
            }
        })
    }

    var getVoucherById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data._id }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something went wrong when retrieving your voucher, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'GetVoucherById', result: result });
            }
        })
    }

    var getVoucherByStripeId = function (data, callback) {
        /// Verify if exist in database
        _entity.GetModel().findOne({ "StripeData.id": data.id }, function (err, voucherResult) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something went wrong when retrieving your voucher, try again.', result: null });
            }
            else {
                if (voucherResult !== undefined && voucherResult !== null) {
                    if (voucherResult.StripeData.id !== undefined && voucherResult.StripeData.id !== null) {
                        _stripeController.GetDiscountVoucher(voucherResult.StripeData.id, function (result) {
                            callback(result);
                        });
                    }
                }
            }
        })
    }

    var getVoucherBySubscriptionId = function (data, callback) {
        _entity.GetModel().find({ "VoucherId": data.VoucherId }, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something went wrong when retrieving your voucher, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'GetVoucherById', result: result });
            }
        })
    }

    var getAllVoucher = function (data, callback) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something went wrong when retrieving your vouchers, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'GetAllVoucher', result: result });
            }
        })
    }

    var verifyByStripeId = function (data, callback) {
        /// Verify if exist in database
        _entity.GetModel().findOne({ "StripeData.id": data.VoucherId }, function (err, voucherResult) {
            if (err) {
                _console.log(err, 'error');
                callback({ success: false, message: 'Something went wrong when retrieving your voucher, try again.', result: null });
            }
            else {
                if (voucherResult !== undefined && voucherResult !== null) {
                    if (voucherResult.StripeData.id !== undefined && voucherResult.StripeData.id !== null) {
                        _stripeController.VerifyDiscountVoucher({ VoucherId: voucherResult.StripeData.id }, function (result) {
                            callback(result);
                        });
                    }
                    else {
                        callback({ success: false, message: 'Your voucher not exist, just copy and paste from our email.', result: null });
                    }
                }
                else {
                    callback({ success: false, message: 'Your voucher not exist, just copy and paste from our email.', result: null });
                }
            }
        });
    }

    var redeemVoucher = function (data, callback) {
        if (data.VoucherId != undefined && data.VoucherId != null) {
            _stripeController.RedeemVoucher({ VoucherId: data.VoucherId, SubscriptionId: data.SubscriptionId }, function (result) {
                callback(result);
            })
        }
        else {
            callback({ success: false, message: 'Something was wrong while redeeming your discount voucher', result: null });
        }
    }

    var redeemVoucherByUserId = function (data, callback) {
        if (data.VoucherId != undefined && data.VoucherId != null) {
            _database.Subscription().GetSubscriptionByUserId({ UserId: data.UserId }, function (SubscriptionResult) {
                if (SubscriptionResult != undefined && SubscriptionResult != null) {
                    _stripeController.RedeemVoucher({ VoucherId: data.VoucherId, SubscriptionId: SubscriptionResult.SubscriptionId }, function (result) {
                        callback(result);
                    })
                }
                else{
                    callback({ success: false, message: 'Something was wrong while redeeming your discount voucher', result: null });
                }
            })
        }
        else{
            callback({ success: false, message: 'Something was wrong while redeeming your discount voucher', result: null });
        }
    }

    var getEntity = function () {
        return _entity;
    }

    return {
        Initialize: constructor,
        CreateVoucher: createVoucher,
        DeleteVoucher: deleteVoucher,
        GetVoucherById: getVoucherById,
        GetVoucherByStripeId: getVoucherByStripeId,
        GetVoucherBySubscriptionId: getVoucherBySubscriptionId,
        GetAllVoucher: getAllVoucher,
        VerifyByStripeId: verifyByStripeId,
        RedeemVoucher: redeemVoucher,
        Entity: getEntity
    }
}

module.exports = VoucherController;