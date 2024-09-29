// PARTNERS

// MODEL
model.partners = [
    { id: 1, name: "Baggio", charges: [] },
    { id: 2, name: "Lamine Yamal", charges: [] },
    { id: 3, name: "Ferran Torres", charges: [
        {
            title: "Mensualidad",
            startDate: "2024-02-10",
            endDate: "",
            repetitionInterval: "monthly",
            amount: 7.00
        }
    ] }
];
model.currentPartner = { id: null, name: "", charges: [] };

// private
model._partnerIdMap = _getPartnerIdMap();
function _getPartnerIdMap () {
    return model.partners.reduce((partialResult, currentItem) => {
        partialResult[currentItem.id] = currentItem;
        return partialResult;
    }, {});
}
model._partnerListeners = [];
function _emitPartnersChange (arg) {
    for (var callbackFunc of model._partnerListeners) {
        callbackFunc(arg);
    }
}

// public
function addPartnersListener (callbackFunc) {
    if (!model._partnerListeners.includes(callbackFunc)) {
        model._partnerListeners.push(callbackFunc);
    }
}
function removePartnersListener (callbackFunc) {
    var index = model._partnerListeners.indexOf(callbackFunc);
    if (index != -1) {
        model._partnerListeners.splice(index, 1);
    }
}
function addPartner (partner) {
    model.partners.push(partner);

    // refresh id map
    model._partnerIdMap = _getPartnerIdMap();
    _emitPartnersChange({ add: partner });
}
function getPartnerById (id) {
    return model._partnerIdMap[id];
}
function removePartnerById (id) {
    var index = model.partners.findIndex((partner) => {
        return partner.id == id;
    });

    if (index != -1) {
        var removedPartners = model.partners.splice(index, 1);

        // refresh id map
        model._partnerIdMap = _getPartnerIdMap();
        _emitPartnersChange({ remove: removedPartners[0] });
    }
}
function nextNewPartnerId () {
    var id = 1;
    for (var partner of model.partners) {
        if (partner.id >= id) {
            id = partner.id + 1;
        }
    }
    return id;
}


// CONTROLLER
var partnersFilterInput = partnersPanel.querySelector(".filter-input");
var partnersTable = partnersPanel.querySelector("table");
var partnerCurrentTr;
var partnerAddBtn = partnersPanel.querySelector("#partners-panel .panel-add-btn");
var partnerFormPopup = document.querySelector("#partner-form-popup");
var partnerIdInput = partnerFormPopup.querySelector(".id-input");
var partnerNameInput = partnerFormPopup.querySelector(".name-input");
var partnerAddChargeBtn = partnerFormPopup.querySelector(".add-charge-btn");
var partnerSaveBtn = partnerFormPopup.querySelector(".btn-save");
var partnerChargesContainer = partnerFormPopup.querySelector(".charges-container");
var partnerChargeContainerTmpl = partnerFormPopup.querySelector(".charge-container-template");

function onAddPartnerBtnClick () {
    // popup.getBoundingClientRect() hack
    partnerFormPopup.style.visibility = "hidden";
    partnerFormPopup.style.display = "block";

    partnerFormPopup.style.right = `${(window.innerWidth - partnerFormPopup.getBoundingClientRect().width)/2}px`;
    partnerFormPopup.style.top = `${window.scrollY + 10}px`;

    model.currentPartner = { id: null, name: "", charges: [] };
    loadPartnerForm();
    openFormPopup(partnerFormPopup);

    partnerNameInput.focus();
}
function onEditPartnerBtnClick (evt) {
    // popup.getBoundingClientRect() hack
    partnerFormPopup.style.visibility = "hidden";
    partnerFormPopup.style.display = "block";

    partnerFormPopup.style.right = `${(window.innerWidth - partnerFormPopup.getBoundingClientRect().width)/2}px`;
    partnerFormPopup.style.top = `${window.scrollY + 10}px`;

    partnerCurrentTr = evt.target.closest("tr");

    model.currentPartner = getPartnerById(evt.target.dataset.partnerId);
    loadPartnerForm();
    openFormPopup(partnerFormPopup);
}
function onAddPartnerChargeBtnClick () {
    var clone = partnerChargeContainerTmpl.cloneNode(true);
    partnerChargesContainer.appendChild(clone);
    clone.querySelector(".remove-charge-btn").addEventListener("click", onPartnerRemoveChargeBtnClick);
}
function onPartnerRemoveChargeBtnClick (evt) {
    evt.target.closest(".charge-container").remove();
}
function onSavePartnerBtnClick () {
    // get charges from ui
    var charges = [];
    partnerFormPopup.querySelectorAll(".charge-container").forEach(chargeContainer => {
        charges.push({
            title: chargeContainer.querySelector(".charge-title-input").value.trim(),
            startDate: chargeContainer.querySelector(".charge-start-date-input").value,
            endDate: chargeContainer.querySelector(".charge-end-date-input").value,
            repetitionInterval: chargeContainer.querySelector(".charge-interval-input").value,
            amount: parseFloat(chargeContainer.querySelector(".charge-amount-input").value)
        });
    });

    if (model.currentPartner.id) {
        // EDIT
        model.currentPartner.name = partnerNameInput.value.trim();
        model.currentPartner.charges = charges;
        partnerCurrentTr.querySelector(".name-td").innerHTML = model.currentPartner.name;
        
        _emitPartnersChange({ edit: model.currentPartner.name });
    } else {
        // INSERT
        var newPartner = {
            id: nextNewPartnerId(),
            name: partnerNameInput.value.trim(),
            charges: charges
        };
        addPartner(newPartner);
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

    while (partnerChargesContainer.firstChild) {
        partnerChargesContainer.removeChild(partnerChargesContainer.firstChild);
    }

    for (var i = 0; i < model.currentPartner.charges.length; i++) {
        var charge = model.currentPartner.charges[i];
        var clone = partnerChargeContainerTmpl.cloneNode(true);
        clone.querySelector(".charge-title-input").value = charge.title;
        clone.querySelector(".charge-start-date-input").value = charge.startDate;
        clone.querySelector(".charge-end-date-input").value = charge.endDate;
        clone.querySelector(".charge-interval-input").value = charge.repetitionInterval;
        clone.querySelector(".charge-amount-input").value = charge.amount.toFixed(2);
        partnerChargesContainer.appendChild(clone);
        clone.querySelector(".remove-charge-btn").addEventListener("click", onPartnerRemoveChargeBtnClick);
    }
}

partnerChargeContainerTmpl.remove();
loadPartnersTable();

partnerAddBtn.addEventListener("click", onAddPartnerBtnClick);
partnerAddChargeBtn.addEventListener("click", onAddPartnerChargeBtnClick);
partnerSaveBtn.addEventListener("click", onSavePartnerBtnClick);
partnersFilterInput.addEventListener("input", onPartnersFilterInputChange);
