//  MODEL
var model = {
    partners: [
        { id: 1, name: "Raúl Royer" },
        { id: 2, name: "Lamine Yamal" },
        { id: 3, name: "Ferran Torres" },
        { id: 1, name: "Raúl Royer" },
        { id: 2, name: "Lamine Yamal" },
        { id: 3, name: "Ferran Torres" },
        { id: 1, name: "Raúl Royer" },
        { id: 2, name: "Lamine Yamal" },
        { id: 3, name: "Ferran Torres" },
        { id: 1, name: "Raúl Royer" },
        { id: 2, name: "Lamine Yamal" },
        { id: 3, name: "Ferran Torres" },
        { id: 1, name: "Raúl Royer" },
        { id: 2, name: "Lamine Yamal" },
        { id: 3, name: "Ferran Torres" },
        { id: 1, name: "Raúl Royer" },
        { id: 2, name: "Lamine Yamal" },
        { id: 3, name: "Ferran Torres" }
    ],
    currentPartner: { id: null, name: "" }
};

function getPartnerById (id) {
    for (var partner of model.partners) {
        if (partner.id == id) {
            return partner;
        }
    }
    return null;
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


// FORM POPUP
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


// TABLE
function clearTable (table) {
    var tbody = table.querySelector("tbody");
    while(tbody.hasChildNodes()) {
        tbody.removeChild(tbody.firstChild);
    }
}

// PARTNERS
var partnersTable = partnersPanel.querySelector("table");
var partnerAddBtn = partnersPanel.querySelector("#partners-panel .panel-add-btn");
var partnerFormPopup = document.querySelector("#partner-form-popup");
var partnerIdInput = partnerFormPopup.querySelector(".id-input");
var partnerNameInput = partnerFormPopup.querySelector(".name-input");

function addPartnerRow (partner) {
    var tbody = partnersTable.querySelector("tbody");
    var tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${partner.id}</td>
        <td>${partner.name}</td>
        <td class="btns-td"><button data-partner-id="${partner.id}" class="custom-btn-1">&#x270E;</button></td>`;
    tbody.appendChild(tr);

    tr.querySelector("button").addEventListener("click", onEditPartnerBtnClick);
}
function loadPartnersTable () {
    clearTable(partnersTable);

    for (var i = 0; i < model.partners.length; i++) {
        addPartnerRow(model.partners[i]);
    }
}
function loadPartnerForm () {
    partnerIdInput.value = model.currentPartner.id;
    partnerNameInput.value = model.currentPartner.name;
}
function onEditPartnerBtnClick (evt) {
    model.currentPartner = getPartnerById(evt.target.dataset.partnerId);

    console.log(partnerFormPopup.style.visibility);
    // popup.getBoundingClientRect() hack
    partnerFormPopup.style.visibility = "hidden";
    partnerFormPopup.style.display = "block";

    // ubica el popup junto al botón

    partnerFormPopup.style.right = `${window.innerWidth - evt.target.getBoundingClientRect().right}px`;
    
    viewportDistBelowTarget = window.innerHeight - evt.target.getBoundingClientRect().bottom;

    console.log(viewportDistBelowTarget, partnerFormPopup.getBoundingClientRect().height);

    if (viewportDistBelowTarget > partnerFormPopup.getBoundingClientRect().height) {
        partnerFormPopup.style.top = `${window.scrollY + evt.target.getBoundingClientRect().bottom + 5}px`;
    } else {
        partnerFormPopup.style.top = `${window.scrollY + evt.target.getBoundingClientRect().top - partnerFormPopup.getBoundingClientRect().height - 5}px`;
    }

    loadPartnerForm();
    openFormPopup(partnerFormPopup);
}

loadPartnersTable();

partnerAddBtn.addEventListener("click", () => {
    partnerFormPopup.style.right = `${window.innerWidth - partnerAddBtn.getBoundingClientRect().right}px`;
    partnerFormPopup.style.top = `${partnerAddBtn.getBoundingClientRect().bottom + 5}px`;

    openFormPopup(partnerFormPopup);
});


// document.querySelectorAll("#partners-panel td").forEach((node) => {
//     node.addEventListener("click", () => {
//         partnerPopup.setAttribute("open", "");
//     });
// });

// document.querySelector("#partner-form-popup .close-btn").addEventListener("click", () => {
//     partnerFormPopup.removeAttribute("open");
// });
