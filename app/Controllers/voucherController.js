function VoucherController(dependencies) {

    /// Dependencies   
    var _mongoose;
    var _stripeController;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _stripeController = dependencies.stripeController;

        _entity = require('../Models/Voucher')(dependencies);
        _entity.Initialize();
    }

    var createVoucher = function (data, callback) {

        var voucher = new _entity.GetModel()(
            {
                _id: _mongoose.Types.ObjectId(),
                StripeData: data.StripeData,
                State: _entity.GetStates().Unremeeded,
                VoucherId: data.VoucherId
            });

        voucher.save().then(function (result) {
            // When database return a result call the return
            callback({ success: true, message: 'CreateVoucher', result: result });
        }, function (err) {
            console.log(err);
            callback({ success: false, message: 'Something went wrong when creating your voucher, try again.', result: null });
        });
    }

    var deleteVoucher = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            if (err) {
                console.log(err);
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
                console.log(err);
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
                console.log(err);
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
                console.log(err);
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
                console.log(err);
                callback({ success: false, message: 'Something went wrong when retrieving your vouchers, try again.', result: null });
            }
            else {
                callback({ success: true, message: 'GetAllVoucher', result: result });
            }
        })
    }

    var verifyByStripeId = function (data, callback) {
        /// Verify if exist in database
        _entity.GetModel().findOne({ "StripeData.id": data.id }, function (err, voucherResult) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went wrong when retrieving your voucher, try again.', result: null });
            }
            else {
                if (voucherResult !== undefined && voucherResult !== null) {
                    if (voucherResult.StripeData.id !== undefined && voucherResult.StripeData.id !== null) {
                        _stripeController.VerifyDiscountVoucher(voucherResult.StripeData.id, function (result) {
                            callback(result);
                        });
                    }
                }
            }
        });
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
        Entity: getEntity
    }
}

module.exports = VoucherController;