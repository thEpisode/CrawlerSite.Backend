function Invitation(dependencies) {

    /// Dependencies
    var _mongoose;
    var _schema;

    /// Properties
    var _model;

    var constructor = function () {
        _mongoose = dependencies.mongoose;
        _schema = _mongoose.Schema;

        _model = _mongoose.model('Invitation', new _schema(
            {
                Name: String,
                Date: String,
                Hour: String,
                Type: String
            },
            { timestamps: { createdAt: 'created_at' }, minimize: false, collection: 'Invitation' }
        ));
    }

    var getModel = function () {
        return _model;
    }

    return {
        Initialize: constructor,
        GetModel: getModel
    }
}

module.exports = Invitation;