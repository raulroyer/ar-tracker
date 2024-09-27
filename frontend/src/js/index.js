//  MODEL
var model = {
    partners: [
        { id: 1, name: "Raúl Royer" },
        { id: 2, name: "Lamine Yamal" },
        { id: 3, name: "Ferran Torres" }
    ],
    currentPartner: { id: null, name: "" }
};

function getPartnerById (id) {
    var index = model.partners.findIndex((partner) => {
        return partner.id == id;
    });

    if (index == -1) {
        return null;
    } else {
        return model.partners[index];
    }
}
function removePartnerById (id) {
    var index = model.partners.findIndex((partner) => {
        return partner.id == id;
    });

    if (index != -1) {
        model.partners.splice(index, 1);
    }
}
function nextNewPartnerId () {
    var id = 1;
    for (var partner of model.partners) {
        console.log(partner.id, id);
        if (partner.id >= id) {
            id = partner.id + 1;
            console.log("assign", id);
        }
    }
    return id;
}

// MENU NAVIGATION
var txLink = document.querySelector(".tx-link");
var partnersLink = document.querySelector(".partners-link");
var reportLink = document.querySelector(".report-link");

var txPanel = document.querySelector("#tx-panel");
var partnersPanel = document.querySelector("#partners-panel");

var reportPanel = document.querySelector("#report-panel");
var currentPanel;

function setOpenedPanel (key) {
    var selectedPanel;
    switch (key) {
        case "tx":
            selectedPanel = txPanel;
            break;
        case "partners":
            selectedPanel = partnersPanel;
            break;
        case "report":
            selectedPanel = reportPanel;
            break;
        default:
            break;
    }

    if (currentPanel) {
        currentPanel.removeAttribute("open");
    }
    selectedPanel.setAttribute("open", "");
    currentPanel = selectedPanel;

}
function setSelectedMenuLink (linkNode) {
    txLink.removeAttribute("selected");
    partnersLink.removeAttribute("selected");
    reportLink.removeAttribute("selected");

    linkNode.setAttribute("selected", "");
}

txLink.addEventListener("click", (evt) => {
    setOpenedPanel("tx");
    setSelectedMenuLink(evt.target);
});

partnersLink.addEventListener("click", (evt) => {
    setOpenedPanel("partners");
    setSelectedMenuLink(evt.target);
});

reportLink.addEventListener("click", (evt) => {
    setOpenedPanel("report");
    setSelectedMenuLink(evt.target);
});


// POPUPS
var overlay = document.querySelector("#overlay");
var currentPopup;

function openFormPopup (popup) {
    overlay.style.display = "block";

    popup.style.display = "block";   
    // popup.getBoundingClientRect() hack
    popup.style.visibility = "visible";

    currentPopup = popup;
}
function closeFormPopup () {
    if (currentPopup) {
        overlay.style.display = "none";

        currentPopup.style.display = "none";
        // popup.getBoundingClientRect() hack
        currentPopup.style.visibility = "hidden";

        currentPopup = undefined;
    }
}

overlay.addEventListener("click", closeFormPopup);
document.querySelectorAll(".popup .close-btn").forEach((node) => {
    node.addEventListener("click", closeFormPopup);
});

// CONFIRMATION POPUP
var confirmationPopup = document.querySelector("#confirmation-popup");
var confirmPopupMessageNode = confirmationPopup.querySelector(".confirm-message");
var confirmPopupOkBtn = confirmationPopup.querySelector(".confirm-btn");
var confirmPopupDiscardBtn = confirmationPopup.querySelector(".discard-btn");
var confirmPopupResolveCallback;

function openConfirmPopup (message, resolveCallbackFunc) {
    confirmPopupResolveCallback = resolveCallbackFunc;

    confirmPopupMessageNode.innerHTML = message;
    openFormPopup(confirmationPopup);
}

confirmPopupOkBtn.addEventListener("click", () => {
    confirmPopupResolveCallback(true);
    closeFormPopup();
});
confirmPopupDiscardBtn.addEventListener("click", () => {
    confirmPopupResolveCallback(false);
    closeFormPopup();
});

// TABLE
function clearTable (table) {
    var tbody = table.querySelector("tbody");
    while(tbody.hasChildNodes()) {
        tbody.removeChild(tbody.firstChild);
    }
}
