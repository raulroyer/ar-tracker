// TRANSACTIONS

// MODEL
model.tx = [
    { id: 1, partner: 1, type: "Multa", paymentMethod: "ACH", amount: 34.65, date: "2024-09-14", note: "" },
    { id: 2, partner: 2, type: "Conexión", paymentMethod: "ACH", amount: 15.33, date: "2024-10-14", note: "lsdskl aslkdjas aslkd askl; as;dasd k;sa" }
    
];
model.currentTx = { id: null, partnerName: "", type: null, paymentMethod: null, amount: null, date: null, note: "" };

function getTxById (id) {
    var index = model.tx.findIndex((tx) => {
        return tx.id == id;
    });

    if (index == -1) {
        return null;
    } else {
        return model.tx[index];
    }
}
function removeTxById (id) {
    var index = model.tx.findIndex((tx) => {
        return tx.id == id;
    });

    if (index != -1) {
        model.tx.splice(index, 1);
    }
}
function removeTxByPartnerId (partnerId) {
    for (var i = model.tx.length -1; i >= 0; i--) {
        console.log(model.tx[i].partner, partnerId, model.tx[i].partner == partnerId);
        if (model.tx[i].partner == partnerId) {
            model.tx.splice(i, 1);
        }
    }
}
function nextNewTxId () {
    var id = 1;
    for (var tx of model.tx) {
        if (tx.id >= id) {
            id = tx.id + 1;
        }
    }
    return id;
}

// CONTROLLER
var txFilterInput = txPanel.querySelector(".filter-input");
var txTable = txPanel.querySelector("table");
var txCurrentTr;
var txAddBtn = txPanel.querySelector("#tx-panel .panel-add-btn");
var txFormPopup = document.querySelector("#tx-form-popup");
var txIdInput = txFormPopup.querySelector(".id-input");
var txPartnerInput = txFormPopup.querySelector(".partner-input");
var txTypeInput = txFormPopup.querySelector(".type-input");
var txPaymentMethodInput = txFormPopup.querySelector(".payment-method-input");
var txAmountInput = txFormPopup.querySelector(".amount-input");
var txDateInput = txFormPopup.querySelector(".date-input");
var txNoteInput = txFormPopup.querySelector(".note-input");
var txSaveBtn = txFormPopup.querySelector(".btn-save");

function onAddTxBtnClick () {
    // popup.getBoundingClientRect() hack
    txFormPopup.style.visibility = "hidden";
    txFormPopup.style.display = "block";

    txFormPopup.style.right = `${(window.innerWidth - txFormPopup.getBoundingClientRect().width)/2}px`;
    txFormPopup.style.top = `${window.scrollY + 10}px`;

    model.currentTx = { id: null, partnerName: "", type: null, paymentMethod: null, amount: null, date: null, note: "" };
    loadTxForm();
    openFormPopup(txFormPopup);

    txPartnerInput.focus();
}
function onEditTxBtnClick (evt) {
    // popup.getBoundingClientRect() hack
    txFormPopup.style.visibility = "hidden";
    txFormPopup.style.display = "block";

    // ubica el popup junto al botón

    txFormPopup.style.right = `${(window.innerWidth - txFormPopup.getBoundingClientRect().width)/2}px`;
    txFormPopup.style.top = `${window.scrollY + 10}px`;

    txCurrentTr = evt.target.closest("tr");

    model.currentTx = getTxById(evt.target.dataset.txId);
    loadTxForm();
    openFormPopup(txFormPopup);
}
function onSaveTxBtnClick () {
    if (model.currentTx.id) {
        // EDIT
        model.currentTx.partner = txPartnerInput.value;
        model.currentTx.partnerName = txPartnerInput.options[txPartnerInput.selectedIndex].textContent;
        model.currentTx.type = txTypeInput.value.trim();
        model.currentTx.paymentMethod = txPaymentMethodInput.value;
        model.currentTx.amount = txAmountInput.value.trim();
        model.currentTx.date = txDateInput.value.trim();
        model.currentTx.note = txNoteInput.value.trim();

        txCurrentTr.querySelector(".partner-name-td").innerHTML = model.currentTx.partnerName;
        txCurrentTr.querySelector(".type-td").innerHTML = model.currentTx.type;
        txCurrentTr.querySelector(".payment-method-td").innerHTML = model.currentTx.paymentMethod;
        txCurrentTr.querySelector(".amount-td").innerHTML = model.currentTx.amount;
        txCurrentTr.querySelector(".date-td").innerHTML = model.currentTx.date;
        // loadTxTable();
    } else {
        // INSERT
        var newTx = {
            id: nextNewTxId(),
            partner: txPartnerInput.value.trim(),
            partnerName: txPartnerInput.options[txPartnerInput.selectedIndex].textContent,
            type: txTypeInput.value,
            paymentMethod: txPaymentMethodInput.value,
            amount: parseFloat(txAmountInput.value.trim()),
            date: txDateInput.value,
            note: txNoteInput.value.trim()
        };
        model.tx.push(newTx);
        addTxRow(newTx);
    }

    closeFormPopup();
}
function onDeleteTxBtnClick (evt) {
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

    var tx = getTxById(evt.target.dataset.txId);
    openConfirmPopup(
        `Se va a eliminar la transacción <strong>(${tx.id} /${tx.partnerName}/$${tx.amount}/${tx.date})</strong>.`,
        (response) => {
            if (response === true) {
                removeTxById(tx.id);
                evt.target.closest("tr").remove();
            }
        }
    );
}
function onTxFilterInputChange () {
    filterTxRow(txFilterInput.value);
}
function onPartnersChange (evt) {
    console.log(evt);
    if (evt.remove) {
        removeTxByPartnerId(evt.remove.id);
        loadTxTable();
    } else if (evt.edit) {
        loadTxTable();
    }
}
function addTxRow (tx) {
    var tbody = txTable.querySelector("tbody");
    var tr = document.createElement("tr");

    var partner = getPartnerById(tx.partner);

    tr.innerHTML = `
        <td>${tx.id}</td>
        <td class="partner-name-td">${partner.name}</td>
        <td class="type-td">${tx.type}</td>
        <td class="payment-method-td">${tx.paymentMethod}</td>
        <td class="amount-td">${tx.amount}</td>
        <td class="date-td">${tx.date}</td>
        <td class="btns-td">
        <button data-tx-id="${tx.id}" class="edit-btn custom-btn-1">&#x270E;</button>
        <button data-tx-id="${tx.id}" class="delete-btn custom-btn-1">&#10006;</button>
        </td>`;
    tbody.appendChild(tr);

    tr.querySelector(".edit-btn").addEventListener("click", onEditTxBtnClick);
    tr.querySelector(".delete-btn").addEventListener("click", onDeleteTxBtnClick);
}
function loadTxTable () {
    clearTable(txTable);

    for (var i = 0; i < model.tx.length; i++) {
        addTxRow(model.tx[i]);
    }
}
function filterTxRow (filterText) {
    filterText = filterText.trim().toLowerCase();
    txTable.querySelectorAll("tbody tr").forEach((tr) => {
        if (tr.textContent.toLowerCase().includes(filterText)) {
            tr.style.display = "table-row";
        } else {
            tr.style.display = "none";
        }
    });
}
function loadTxForm () {
    var htmlOptionsString = model.partners.
        sort((a, b) => {
            if (a.name > b.name) {
                return 1;
            } else {
                return -1;
            }
        }).
        map(partner => `<option value="${partner.id}">${partner.name}</option>`).join(" ");
    txPartnerInput.innerHTML = htmlOptionsString;

    txIdInput.value = model.currentTx.id;
    txPartnerInput.value = model.currentTx.partner;
    txTypeInput.value = model.currentTx.type;
    txPaymentMethodInput.value = model.currentTx.paymentMethod;
    txAmountInput.value = model.currentTx.amount;
    txDateInput.value = model.currentTx.date;
    txNoteInput.value = model.currentTx.note;
}

loadTxTable();

addPartnersListener(onPartnersChange);
txAddBtn.addEventListener("click", onAddTxBtnClick);
txSaveBtn.addEventListener("click", onSaveTxBtnClick);
txFilterInput.addEventListener("input", onTxFilterInputChange);
