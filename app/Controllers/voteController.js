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

    var createVote = function (data, next) {

        var vote = new _entity.GetModel()(
            {
                _id: _mongoose.Types.ObjectId(),
                Feature: data.Feature,
                UserId: data.UserId,
                State: _entity.GetStates().Valid
            });

        vote.save().then(function (result) {
            next({ success: true, message: 'CreateVote', result: result });
        }, function (err) {
            _console.log(err, 'error');
            next({ success: false, message: 'Something went wrong when creating your vote, try again.', result: null });
        })
    }

    var deleteVote = function (data, next) {
        _entity.GetModel().findOneAndRemove(data, function (err, result) {
            next(result);
        })
    }

    var getVoteById = function (data, next) {
        _entity.GetModel().findOne({ "_id": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getVoteByFeature = function (data, next) {
        _entity.GetModel().findOne({ "Feature": data }, function (err, result) {
            if (err){
                _console.log(err, 'error');
            }

            next(result);
        })
    }

    var getAllVote = function (data, next) {
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
        CreateVote: createVote,
        DeleteVote: deleteVote,
        GetVoteById: getVoteById,
        GetVoteByFeature: getVoteByFeature,
        GetAllVote: getAllVote,
        Entity: getEntity
    }
}

module.exports = VoteController;