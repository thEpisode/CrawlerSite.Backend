function StripeController(dependencies) {

    /// Dependencies   
    var _stripe;
    var _cross;

    /// Configuration
    var stripe_pk = '';

    var constructor = function () {
        _cross = dependencies.cross;

        stripe_pk = _cross.GetStripePrivateKey();

        stripe = new dependencies.stripe(stripe_pk);

    }

    return {
        Initialize: constructor,
    }
}

module.exports = StripeController;