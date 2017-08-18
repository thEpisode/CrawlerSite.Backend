function FrontEndReviewController(dependencies) {

    /// Dependencies   
    var _console;
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _console = dependencies.console;

        _entity = require('../Models/FrontEndReview')(dependencies);
        _entity.Initialize();
    }

    var createFrontEndReview = function (data, next) {

        var frontendReview = new _entity.GetModel()(
            {
                UserId: data.UserId,
                Path: data.Path,
                Like: data.Like,
                ScreenshotId: data.ScreenshotId,
                Description: data.Description,
                Logs: data.Logs,
                ReportBug: data.ReportBug,
                Version: data.Version
            });

        frontendReview.save().then(function (result) {
            // When database return a result call the return
            next(result);
        }, function(err){
            _console.log(err, 'error');
            next(null);
        });
    }

    var deleteFrontEndReview = function (data, next) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            if (err) {
                _console.log(err, 'error');
                next(false);
            }

            next(true);
        })
    }

    var getFrontEndReviewById = function (data, next) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getFrontEndReviewByUserId = function (data, next) {
        _entity.GetModel().find({ "UserId": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getAllFrontEndReview = function (data, next) {
        _entity.GetModel().find({}, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getEntity = function () {
        return _entity;
    }

    return {
        Initialize: constructor,
        CreateFrontEndReview: createFrontEndReview,
        DeleteFrontEndReview: deleteFrontEndReview,
        GetFrontEndReviewById: getFrontEndReviewById,
        GetFrontEndReviewByUserId: getFrontEndReviewByUserId,
        GetAllFrontEndReview: getAllFrontEndReview,
        Entity: getEntity
    }
}

module.exports = FrontEndReviewController;