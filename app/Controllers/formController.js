function FormController(dependencies) {

    /// Dependencies  
    var _console; 
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _console = dependencies.console;

        _entity = require('../Models/Form')(dependencies);
        _entity.Initialize();
    }

    var createForm = function (data, next) {

        var form = new _entity.GetModel()(
            {
                ApiKey: data.ApiKey,
                Name: data.Name,
                Tags: data.Tags,
                Path: data.Path,
                State: data.State
            });

        form.save().then(function (result) {
            // When database return a result call the return
            next();
        })
    }

    var deleteForm = function (data, next) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            next(result);
        })
    }

    var getFormById = function (data, next) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getFormByApiKey = function (data, next) {
        _entity.GetModel().findOne({ "ApiKey": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getAllForm = function (data, next) {
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
        CreateForm: createForm,
        DeleteForm: deleteForm,
        GetFormById: getFormById,
        GetFormByApiKey: getFormByApiKey,
        GetAllForm: getAllForm,
        Entity: getEntity
    }
}

module.exports = FormController;