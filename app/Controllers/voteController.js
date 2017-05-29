function VoteController(dependencies) {

    /// Dependencies  
    var _console; 
    var _mongoose;

    /// Properties
    var _entity;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _console = dependencies.console;

        _entity = require('../Models/Vote')(dependencies);
        _entity.Initialize();
    }

    var createVote = function (data, callback) {

        var vote = new _entity.GetModel()(
            {
                _id: _mongoose.Types.ObjectId(),
                Feature: data.Feature,
                UserId: data.UserId,
                State: _entity.GetStates().Valid
            });

        vote.save().then(function (result) {
            callback({ success: true, message: 'CreateVote', result: result });
        }, function (err) {
            _console.log(err, 'error');
            callback({ success: false, message: 'Something went wrong when creating your vote, try again.', result: null });
        })
    }

    var deleteVote = function (data, callback) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            callback(result);
        })
    }

    var getVoteById = function (data, callback) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            callback(result);
        })
    }

    var getVoteByFeature = function (data, callback) {
        _entity.GetModel().findOne({ "Feature": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            callback(result);
        })
    }

    var getAllVote = function (data, callback) {
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
        CreateVote: createVote,
        DeleteVote: deleteVote,
        GetVoteById: getVoteById,
        GetVoteByFeature: getVoteByFeature,
        GetAllVote: getAllVote,
        Entity: getEntity
    }
}

module.exports = VoteController;