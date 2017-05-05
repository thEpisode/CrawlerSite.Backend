function StripeController(dependencies) {

    /// Dependencies   
    var _stripe;
    var _cross;
    var _database;

    /// Configuration
    var stripe_pk = '';

    /// Properties
    var _plans = [];

    var constructor = function () {
        _cross = dependencies.cross;
        _database = dependencies.database;

        _stripe_pk = _cross.GetStripePrivateKey();

        _stripe = dependencies.stripe;

        createInitialPlans()
    }

    var createInitialPlans = function (callback) {
        createPlan({
            Id: 'free',
            Amount: 0,
            Interval:
            'month',
            Name: 'Free',
            Currency: 'usd',
            Metadata: {
                description: 'This is a Free plan',
                order: 0,
                maxPageviews: 400,
                maxRecordings: 50,
                maxAnalyzedForms: 1,
                maxMinutesRAT: 60,
                maxSites: 1
            }
        }, function (result) {
            if (result.success == true) {
                _console.log('Plan Free created succesfuly', 'server-success');
            }
        });
        createPlan({
            Id: 'basic',
            Amount: 999,
            Interval: 'month',
            Name: 'Basic',
            Currency: 'usd',
            Metadata: {
                description: 'This is a Basic plan',
                order: 1,
                maxPageviews: 2000,
                maxRecordings: 500,
                maxAnalyzedForms: 2,
                maxMinutesRAT: 480,
                maxSites: 5
            }
        }, function (result) {
            if (result.success == true) {
                _console.log('Plan Basic created succesfuly', 'server-success');
            }
        });
        createPlan({
            Id: 'standard',
            Amount: 1999,
            Interval: 'month',
            Name: 'Standard',
            Currency: 'usd',
            Metadata: {
                Description: 'This is a Standard plan',
                order: 2,
                maxPageviews: 5000,
                maxRecordings: 3500,
                maxAnalyzedForms: 5,
                maxMinutesRAT: 720,
                maxSites: 0
            }
        }, function (result) {
            if (result.success == true) {
                _console.log('Plan Standard created succesfuly', 'server-success');
            }
        });
        createPlan({
            Id: 'premium',
            Amount: 2500,
            Interval: 'month',
            Name: 'Premium',
            Currency: 'usd',
            Metadata: {
                description: 'This is a Premium plan',
                order: 3,
                maxPageviews: 15000,
                maxRecordings: 8000,
                maxAnalyzedForms: 20,
                maxMinutesRAT: 1440,
                maxSites: 0
            }
        }, function (result) {
            if (result.success == true) {
                _console.log('Plan Premium created succesfuly', 'server-success');
            }
        });
    }

    var createPlan = function (data, callback) {
        _stripe.plans.retrieve(data.Id, function (err, plan) {
            if (err) {
                if (err.statusCode == 404) {
                    _stripe.plans.create({
                        amount: data.Amount,
                        interval: data.Interval,
                        name: data.Name,
                        currency: data.Currency,
                        id: data.Id,
                        metadata: data.Metadata,
                    }, function (err, plan) {
                        if (err) {
                            callback({ success: false, message: 'Something went wrong when retrieving all plans, try again.', result: null });
                        }
                        else {
                            callback({ success: true, message: 'CreatePlan', result: plan })
                        }
                    })
                }
            }
            else {
                callback({ success: false, message: 'Plan already exists, try with another plan.', result: null });
            }
        });
    }

    var getAllPlans = function (callback) {
        _stripe.plans.list(
            { limit: 12 },
            function (err, plans) {
                if (err) {
                    console.log(err);
                    callback({ success: false, message: 'Something went wrong when retrieving all plans, try again.', result: null });
                }

                callback(plans);
            }
        );
    }

    var getPlan = function (planId, callback) {
        _stripe.plans.retrieve(
            (planId == null ? 'free' : planId),
            function (err, plan) {
                if (err) {
                    console.log(err);
                    callback({ success: false, message: 'Something went wrong when retrieving plans, try again.', result: null });
                }

                callback(plan);
            })
    }

    var createInitialCustomer = function (customerData, callback) {
        //// Create a new customer with email
        _stripe.customers.create({
            email: customerData.Email,
        }, function (err, customer) {
            if (err) {
                console.log(err);
                callback({ success: false, message: 'Something went error occurred when creating customer', result: null });
            }

            getPlan('free', function (plan) {
                if (plan != undefined && plan != null) {
                    //// Create a new subscription for this customer
                    _stripe.subscriptions.create({
                        customer: customer.id,
                        plan: plan.id
                    }, function (err, subscription) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: 'Something went error occurred when subscribing customer in plan', result: null });
                        }

                        //// Save credit card data
                        _database.CreditCard().CreateCreditCard({ CreditCardToken: null, FirstNameCard: null, LastNameCard: null }, function (creditCardResult) {
                            if (creditCardResult !== undefined && creditCardResult.result !== null) {
                                //// Save subscription
                                _database.Subscription().CreateSubscription({ CustomerId: customer.id, PlanId: plan.id, CurrentPlan: plan, SubscriptionId: subscription.id, CreditCard: creditCardResult.result }, function (subscriptionResult) {
                                    if (subscriptionResult !== undefined && subscriptionResult.result !== null) {
                                        callback({ success: true, message: 'User saved succesfuly', result: subscriptionResult })
                                    }
                                    else {
                                        callback({ success: false, message: 'Something went occurred wrong when update payment method, try again.', result: null });
                                    }
                                })
                            }
                            else {
                                callback({ success: false, message: 'Something went occurred wrong when update payment method, try again.', result: null });
                            }
                        });
                    });
                }
            });
        });
    }

    var updateSubscription = function (customerData, callback) {

        // Find in mongo user by email
        _database.User().GetUserByEmail(customerData.Email, function (userResult) {
            if (userResult != null) {
                // if user has not a customer id
                if (userResult.StripeToken == null) {
                    /// Create a customer in Stripe
                    _stripe.customers.update(userResult.CustomerId,
                        {
                            description: customerData.Description,
                            source: customerData.StripeToken // obtained with Stripe.js
                        }, function (err, customer) {
                            if (err) {
                                console.log(err);
                                callback({ success: false, message: 'Something went error occurred when creating customer', result: null });
                            }
                            //// Create a new subscription
                            getPlan(customerData.Plan, function (plan) {
                                if (plan != undefined && plan != null) {
                                    _stripe.subscriptions.create({
                                        customer: customer.id,
                                        plan: plan.id
                                    }, function (err, subscription) {
                                        if (err) {
                                            console.log(err);
                                            callback({ success: false, message: 'Something went error occurred when subscribing customer in plan', result: null });
                                        }

                                        //// Save credit card data
                                        _database.CreditCard().EditCreditCard({ CreditCardToken: customerData.StripeToken, FirstNameCard: customerData.Firstname, LastNameCard: customerData.Lastname }, function (creditCardResult) {
                                            if (creditCardResult !== undefined && creditCardResult.result !== null) {
                                                //// Save subscription
                                                _database.Subscription().EditSubscription({ CustomerId: customer.id, PlanId: plan.id, CurrentPlan: plan, SubscriptionId: subscription.id }, function (subscriptionResult) {
                                                    if (subscriptionResult !== undefined && subscriptionResult.result !== null) {
                                                        callback({ success: true, message: 'User saved succesfuly', result: subscriptionResult })
                                                    }
                                                    else {
                                                        callback({ success: false, message: 'Something went occurred wrong when update payment method, try again.', result: null });
                                                    }
                                                })
                                            }
                                            else {
                                                callback({ success: false, message: 'Something went occurred wrong when update payment method, try again.', result: null });
                                            }
                                        });
                                    });
                                }
                                else {
                                    callback({ success: false, message: 'Something went occurred wrong, try again.', result: result });
                                }
                            });

                        });
                }
                // if exist retrieve the customer
                else {
                    //// Update subscription
                    getPlan(customerData.Plan, function (plan) {
                        if (plan != undefined && plan != null) {
                            _stripe.subscriptions.update(
                                userResult.SubscriptionId,
                                { plan: plan.id },
                                function (err, subscription) {
                                    if (err) {
                                        console.log(err);
                                        callback({ success: false, message: err, result: null });
                                    }

                                    //// Save credit card data
                                    _database.CreditCard().EditCreditCard({ CreditCardToken: customerData.StripeToken, FirstNameCard: customerData.Firstname, LastNameCard: customerData.Lastname }, function (creditCardResult) {
                                        if (creditCardResult !== undefined && creditCardResult.result !== null) {
                                            //// Save subscription
                                            _database.Subscription().EditSubscription({ CustomerId: customer.id, PlanId: plan.id, CurrentPlan: plan, SubscriptionId: subscription.id }, function (subscriptionResult) {
                                                if (subscriptionResult !== undefined && subscriptionResult.result !== null) {
                                                    callback({ success: true, message: 'User saved succesfuly', result: subscriptionResult })
                                                }
                                                else {
                                                    callback({ success: false, message: 'Something went occurred wrong when update payment method, try again.', result: null });
                                                }
                                            })
                                        }
                                        else {
                                            callback({ success: false, message: 'Something went occurred wrong when update payment method, try again.', result: null });
                                        }
                                    });
                                }
                            );
                        }
                        else {
                            callback({ success: false, message: 'Something went occurred wrong, try again.', result: null });
                        }
                    });
                }
            }
            else {
                callback({ success: false, message: 'User not found, try again.', result: null });
            }
        });
    }

    var cancelSubscription = function (customerData, callback) {
        _database.User().GetUserByEmail(customerData.Email, function (userResult) {
            if (userResult != null) {
                if (userResult.CustomerId != undefined && userResult.CustomerId.length > 0) {
                    _stripe.subscriptions.del(
                        customerData.CustomerId,
                        function (err, confirmation) {
                            //// Update customer on mongo
                            userResult.CustomerId = "";
                            userResult.PlanId = "";
                            userResult.SubscriptionId = '';
                            userResult.FirstNameCard = '';
                            userResult.LastNameCard = '';
                            userResult.CurrentPlan = {};

                            _database.User().UpdatePaymentData(userResult, function (result) {
                                if (result == null) {
                                    callback({ success: false, message: 'Something went occurred wrong when update payment data, try again.', result: result });
                                }
                                else {
                                    callback({ success: true, message: 'Payment saved succesfuly', result: result })
                                }
                            })
                        }
                    );
                }
            }
        })
    }

    var changePlan = function (customerData, callback) {
        _database.User().GetUserById(customerData.UserId, function (userResult) {
            if (userResult != null) {
                if (userResult.CustomerId.length != 0) {
                    _stripe.subscriptions.update(
                        userResult.SubscriptionId,
                        { plan: customerData.PlanId },
                        function (err, subscription) {
                            if (err) {
                                console.log(err);
                                callback({ success: false, message: err, result: null });
                            }

                            userResult.PlanId = customerData.PlanId;
                            _database.User().UpdatePaymentData(userResult, function (result) {
                                if (result == null) {
                                    callback({ success: false, message: 'Something went occurred wrong when updating data, try again.', result: result });
                                }
                                else {
                                    callback({ success: true, message: 'Plan changed succesfuly', result: result })
                                }
                            });
                        }
                    );
                }
                else {
                    callback({ success: false, message: 'User has not any plan active, please first update payment method to change plan.', result: null });
                }
            }
        });
    }

    var getCustomerByUserId = function (customerData, callback) {
        _database.User().GetUserById(customerData.UserId, function (userResult) {
            if (userResult != null) {
                _stripe.customers.retrieve(
                    userResult.CustomerId,
                    function (err, customer) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: 'Something went wrong when retrieving customer, try again.', result: null });
                        }

                        callback({ success: true, message: 'GetCustomerByUserId', result: customer });
                    }
                );
            }
            else {
                callback({ success: false, message: 'User not found, try again.', result: null });
            }
        });
    }

    var getChargesByUserId = function (customerData, callback) {
        _database.User().GetUserById(customerData.UserId, function (userResult) {
            if (userResult != null) {
                _stripe.charges.list(
                    {
                        limit: 12,
                        customer: userResult.CustomerId,
                    },
                    function (err, charges) {
                        if (err) {
                            console.log(err);
                            callback({ success: false, message: 'Something went wrong when retrieving customer, try again.', result: null });
                        }

                        callback({ success: true, message: 'GetChargesByUserId', result: charges });
                    }
                );
            }
            else {
                callback({ success: false, message: 'User not found, try again.', result: null });
            }
        });
    }

    var processWebhook = function (webHookData, callback) {
        _stripe.events.retrieve(webHookData.id, function (err, event) {
            switch (webHookData.type) {
                case 'account.updated':
                case 'account.application.deauthorized':
                case 'account.external_account.created':
                case 'account.external_account.deleted':
                case 'account.external_account.updated':
                case 'application_fee.created':
                case 'application_fee.refunded':
                case 'application_fee.refund.updated':
                case 'balance.available':
                case 'bitcoin.receiver.created':
                case 'bitcoin.receiver.filled':
                case 'bitcoin.receiver.updated':
                case 'bitcoin.receiver.transaction.created':
                case 'charge.captured':
                case 'charge.failed':
                case 'charge.pending':
                case 'charge.refunded':
                case 'charge.succeeded':
                case 'charge.updated':
                case 'charge.dispute.closed':
                case 'charge.dispute.created':
                case 'charge.dispute.funds_reinstated':
                case 'charge.dispute.funds_withdrawn':
                case 'charge.dispute.updated':
                case 'coupon.created':
                case 'coupon.deleted':
                case 'coupon.updated':
                case 'customer.created':
                case 'customer.deleted':
                case 'customer.updated':
                case 'customer.discount.created':
                case 'customer.discount.deleted':
                case 'customer.discount.updated':
                case 'customer.source.created':
                case 'customer.source.deleted':
                case 'customer.source.updated':
                case 'customer.subscription.created':
                case 'customer.subscription.deleted':
                case 'customer.subscription.trial_will_end':
                case 'customer.subscription.updated':
                case 'invoice.created':
                case 'invoice.payment_failed':
                case 'invoice.payment_succeeded':
                case 'invoice.sent':
                case 'invoice.updated':
                case 'invoiceitem.created':
                case 'invoiceitem.deleted':
                case 'invoiceitem.updated':
                case 'order.created':
                case 'order.payment_failed':
                case 'order.payment_succeeded':
                case 'order.updated':
                case 'order_return.created':
                case 'plan.created':
                case 'plan.created':
                case 'plan.updated':
                case 'product.created':
                case 'product.deleted':
                case 'product.updated':
                case 'recipient.created':
                case 'recipient.deleted':
                case 'recipient.updated':
                case 'review.closed':
                case 'review.opened':
                case 'sku.created':
                case 'sku.deleted':
                case 'sku.updated':
                case 'source.canceled':
                case 'source.chargeable':
                case 'source.failed':
                case 'source.transaction.created':
                case 'transfer.created':
                case 'transfer.failed':
                case 'transfer.paid':
                case 'transfer.reversed':
                case 'transfer.updated':
                case 'ping':
                    /// Send notification or do Something
                    break;

                default:
                    break;
            }

            callback(true);
        });
    }

    return {
        Initialize: constructor,
        GetPlan: getPlan,
        CancelSubscription: cancelSubscription,
        UpdateSubscription: updateSubscription,
        GetAllPlans: getAllPlans,
        ChangePlan: changePlan,
        GetCustomerByUserId: getCustomerByUserId,
        GetChargesByUserId: getChargesByUserId,
        ProcessWebhook: processWebhook,
        CreateInitialCustomer: createInitialCustomer,
        CreatePlan: createPlan,
    }
}

module.exports = StripeController;