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



// MENU NAVIGATION
var menuLinks = document.querySelectorAll("#menu li");
var currentPanel;

function setOpenedPanel (key) {
    var selectedPanel = document.querySelector(`#${key}-panel`);
    if (selectedPanel == null) {
        console.log(`#${key}-panel not found`);
        return;
    }

    if (currentPanel) {
        currentPanel.removeAttribute("open");
    }
    selectedPanel.setAttribute("open", "");
    currentPanel = selectedPanel;

}

function onMenuLinkClick (evt) {
    setOpenedPanel(evt.target.dataset.section);

    menuLinks.forEach((li) => {
        li.removeAttribute("selected");
    });
    evt.target.setAttribute("selected", "");
}

menuLinks.forEach((li) => {
    li.addEventListener("click", onMenuLinkClick);
});