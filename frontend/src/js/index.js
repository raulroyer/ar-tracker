var mdl = new Mdl(pubsub);

var arPopup = new ArPopup(mdl, document.querySelector("#ar-form-popup"));
var paymentPopup = new PaymentPopup(mdl, document.querySelector("#payment-form-popup"));

var arPanel = new ArPanel(
    mdl,
    document.querySelector("#ar-panel"),
    arPopup,
    paymentPopup
);
var paymentsPanel = new PaymentsPanel(
    mdl,
    document.querySelector("#payments-panel"),
    paymentPopup,
    arPopup
);

var partnersPanel = new PartnersPanel(mdl, document.querySelector("#partners-panel"));

