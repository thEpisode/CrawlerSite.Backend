function StripeController(dependencies) {

    /// Dependencies   
    var _stripe;
    var _cross;
    var _database;

    /// Configuration
    var stripe_pk = '';

    var constructor = function () {
        _cross = dependencies.cross;
        _database = dependencies.database;

        stripe_pk = _cross.GetStripePrivateKey();

        _stripe = new dependencies.stripe(stripe_pk);
    }

    var getStandardPlan = function () {
        stripe.plans.retrieve(
            "standard",
            function (err, plan) {
                return plan;
            })
    }

    var getBasicPlan = function () {
        stripe.plans.retrieve(
            "basic",
            function (err, plan) {
                return plan;
            })
    }

    var getPremiumPlan = function () {
        stripe.plans.retrieve(
            "premium",
            function (err, plan) {
                return plan;
            })
    }

    var getFreePlan = function () {
        stripe.plans.retrieve(
            "free",
            function (err, plan) {
                return plan;
            })
    }

    var getPlan = function (planId) {
        switch (planId) {
            case 'standard':
                return getStandardPlan();
            case 'basic':
                return getBasicPlan();
            case 'premium':
                return getPremiumPlan();
            case 'free':
                return getFreePlan();
            default:
                return null;
        }
    }

    var updateSubscription = function (planId, customerData, callback) {

        // Find in mongo user by email
        _database.User.GetUserByEmail(customerData.Email, function (userResult) {

            if (userResult != null) {
                // if user has not a customer id
                if (userResult.CustomerId == undefined) {
                    /// Create a customer in Stripe
                    _stripe.customers.create({
                        description: customerData.Description,
                        source: customerData.CustomerId // obtained with Stripe.js
                    }, function (err, customer) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: err, result: null });
                        }

                        //// Create a new subscription
                        var plan = getPlan(customerData.Plan);
                        if (plan != null) {
                            stripe.subscriptions.create({
                                customer: customer.id,
                                plan: plan.id
                            }, function (err, subscription) {
                                if (err) {
                                    console.log(err);
                                    callback({ success: false, message: err, result: null });
                                }

                                //// Save customer on mongo
                                userResult.CustomerId = customerData.CustomerId;
                                userResult.PlanId = plan.id;

                                _database.User.UpdatePaymentData(userResult, function (result) {
                                    if (result == null) {
                                        callback({ success: false, message: 'Something went ocurr wrong, try again.', result: result });
                                    }
                                    else {
                                        callback({ success: true, message: 'Payment saved succesfuly', result: result })
                                    }
                                })
                            });
                        }

                    });
                }
                // if exist retrieve the customer
                else {
                    //// Update subscription
                    var plan = getPlan(customerData.Plan);

                    stripe.subscriptions.update(
                        userResult.CustomerId,
                        { plan: plan.id },
                        function (err, subscription) {
                            if (err) {
                                console.log(err);
                                callback({ success: false, message: err, result: null });
                            }

                            //// Update customer on mongo
                            userResult.CustomerId = customerData.CustomerId;
                            userResult.PlanId = plan.id;

                            _database.User.UpdatePaymentData(userResult, function (result) {
                                if (result == null) {
                                    callback({ success: false, message: 'Something went ocurr wrong, try again.', result: result });
                                }
                                else {
                                    callback({ success: true, message: 'Payment saved succesfuly', result: result })
                                }
                            })
                        }
                    );
                }
            }
        });
    }

    return {
        Initialize: constructor,
        GetFreePlan: getFreePlan,
        GetBasicPlan: getBasicPlan,
        GetStandardPlan: getStandardPlan,
        GetPremiumPlan: getPremiumPlan,
        UpdateSubscription: updateSubscription
    }
}

module.exports = StripeController;