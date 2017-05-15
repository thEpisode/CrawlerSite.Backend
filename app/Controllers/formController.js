function FormController(dependencies) {

    /// Dependencies  
    var _console; 
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;

        _entity = require('../Models/Form')(dependencies);
        _entity.Initialize();
    }

    var createForm = function (data, callback) {

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
            callback();
        })
    }

    var deleteForm = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            callback(result);
        })
    }

    var getFormById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            callback(result);
        })
    }

    var getFormByApiKey = function (data, callback) {
        _entity.GetModel().findOne({ "ApiKey": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            callback(result);
        })
    }

    var getAllForm = function (data, callback) {
        _entity.GetModel().find({}, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            callback(result);
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