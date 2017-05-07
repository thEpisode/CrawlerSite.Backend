function VoucherController(dependencies) {

    /// Dependencies   
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;

        _entity = require('../Models/Voucher')(dependencies);
        _entity.Initialize();
    }

    var createVoucher = function (data, callback) {

        var voucher = new _entity.GetModel()(
            {
                Feature: data.Feature,
                Voucher: data.Voucher,
                Type: data.Type,
                Description: data.Description,
                State: data.State
            });

        voucher.save().then(function (result) {
            // When database return a result call the return
            callback();
        })
    }

    var deleteVoucher = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            callback(result);
        })
    }

    var getVoucherById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getVoucherBySubscription = function (data, callback) {
        _entity.GetModel().find({ "SubscriptionId": data.SubscriptionId }, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getAllVoucher = function (data, callback) {
        _entity.GetModel().find({}, function (err, result) {
            if (err) console.log(err);

            callback(result);
        })
    }

    var getEntity = function () {
        return _entity;
    }

    return {
        Initialize: constructor,
        CreateVoucher: createVoucher,
        DeleteVoucher: deleteVoucher,
        GetVoucherById: getVoucherById,
        GetVoucherByFeature: getVoucherByFeature,
        GetAllVoucher: getAllVoucher,
        Entity: getEntity
    }
}

module.exports = VoucherController;