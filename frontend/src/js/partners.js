// PARTNERS
var partnersFilterInput = partnersPanel.querySelector(".filter-input");
var partnersTable = partnersPanel.querySelector("table");
var partnerCurrentTr;
var partnerAddBtn = partnersPanel.querySelector("#partners-panel .panel-add-btn");
var partnerFormPopup = document.querySelector("#partner-form-popup");
var partnerIdInput = partnerFormPopup.querySelector(".id-input");
var partnerNameInput = partnerFormPopup.querySelector(".name-input");
var partnerSaveBtn = partnerFormPopup.querySelector(".btn-save");

function onAddPartnerBtnClick () {
    partnerFormPopup.style.right = `${window.innerWidth - partnerAddBtn.getBoundingClientRect().right}px`;
    partnerFormPopup.style.top = `${partnerAddBtn.getBoundingClientRect().bottom + 5}px`;

    model.currentPartner = { id: null, name: "" };
    loadPartnerForm();
    openFormPopup(partnerFormPopup);

    partnerNameInput.focus();
}
function onEditPartnerBtnClick (evt) {
    // popup.getBoundingClientRect() hack
    partnerFormPopup.style.visibility = "hidden";
    partnerFormPopup.style.display = "block";

    // ubica el popup junto al botón

    partnerFormPopup.style.right = `${window.innerWidth - evt.target.getBoundingClientRect().right}px`;
    
    viewportDistBelowTarget = window.innerHeight - evt.target.getBoundingClientRect().bottom;

    if (viewportDistBelowTarget > partnerFormPopup.getBoundingClientRect().height) {
        partnerFormPopup.style.top = `${window.scrollY + evt.target.getBoundingClientRect().bottom + 5}px`;
    } else {
        partnerFormPopup.style.top = `${window.scrollY + evt.target.getBoundingClientRect().top - partnerFormPopup.getBoundingClientRect().height - 5}px`;
    }

    partnerCurrentTr = evt.target.closest("tr");

    model.currentPartner = getPartnerById(evt.target.dataset.partnerId);
    loadPartnerForm();
    openFormPopup(partnerFormPopup);
}
function onSavePartnerBtnClick () {
    if (model.currentPartner.id) {
        // EDIT
        model.currentPartner.name = partnerNameInput.value.trim();
        partnerCurrentTr.querySelector(".name-td").innerHTML = model.currentPartner.name;
        // loadPartnersTable();
    } else {
        // INSERT
        var newPartner = {
            id: nextNewPartnerId(),
            name: partnerNameInput.value.trim()
        };
        model.partners.push(newPartner);
        addPartnerRow(newPartner);
    }

    closeFormPopup();
}
function onDeletePartnerBtnClick (evt) {
    // popup.getBoundingClientRect() hack
    confirmationPopup.style.visibility = "hidden";
    confirmationPopup.style.display = "block";

    // ubica el popup junto al botón

    confirmationPopup.style.right = `${window.innerWidth - evt.target.getBoundingClientRect().right}px`;
    
    viewportDistBelowTarget = window.innerHeight - evt.target.getBoundingClientRect().bottom;

    if (viewportDistBelowTarget > confirmationPopup.getBoundingClientRect().height) {
        confirmationPopup.style.top = `${window.scrollY + evt.target.getBoundingClientRect().bottom + 5}px`;
    } else {
        confirmationPopup.style.top = `${window.scrollY + evt.target.getBoundingClientRect().top - confirmationPopup.getBoundingClientRect().height - 5}px`;
    }

    var partner = getPartnerById(evt.target.dataset.partnerId);
    openConfirmPopup(
        `Se va a eliminar el socio <strong>${partner.name}</strong> (${partner.id}). Esta acción también eliminará sus transacciones.`,
        (response) => {
            if (response === true) {
                removePartnerById(partner.id);
                evt.target.closest("tr").remove();
            }
        }
    );
}
function onPartnersFilterInputChange () {
    filterPartnersRow(partnersFilterInput.value);
}
function addPartnerRow (partner) {
    var tbody = partnersTable.querySelector("tbody");
    var tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${partner.id}</td>
        <td class="name-td">${partner.name}</td>
        <td class="btns-td">
        <button data-partner-id="${partner.id}" class="edit-btn custom-btn-1">&#x270E;</button>
        <button data-partner-id="${partner.id}" class="delete-btn custom-btn-1">&#10006;</button>
        </td>`;
    tbody.appendChild(tr);

    tr.querySelector(".edit-btn").addEventListener("click", onEditPartnerBtnClick);
    tr.querySelector(".delete-btn").addEventListener("click", onDeletePartnerBtnClick);
}
function loadPartnersTable () {
    clearTable(partnersTable);

    for (var i = 0; i < model.partners.length; i++) {
        addPartnerRow(model.partners[i]);
    }
}
function filterPartnersRow (filterText) {
    filterText = filterText.trim().toLowerCase();
    partnersTable.querySelectorAll("tbody tr").forEach((tr) => {
        if (tr.textContent.toLowerCase().includes(filterText)) {
            tr.style.display = "table-row";
        } else {
            tr.style.display = "none";
        }
    });
}
function loadPartnerForm () {
    partnerIdInput.value = model.currentPartner.id;
    partnerNameInput.value = model.currentPartner.name;
}

loadPartnersTable();

partnerAddBtn.addEventListener("click", onAddPartnerBtnClick);
partnerSaveBtn.addEventListener("click", onSavePartnerBtnClick);
// partnersFilterInput.addEventListener("change", onPartnersFilterInputChange);
partnersFilterInput.addEventListener("keyup", onPartnersFilterInputChange);
