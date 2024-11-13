// POPUP
var ArPopup = function (mdl, popupElm) {
    this.popup = popupElm;
    this.idInput = this.popup.querySelector(".id-input");
    this.partnerInput = this.popup.querySelector(".partner-input");
    this.typeInput = this.popup.querySelector(".type-input");
    this.amountInput = this.popup.querySelector(".amount-input");
    this.expirationDateInput = this.popup.querySelector(".expiration-date-input");
    this.cyclePaymentTypeInput = this.popup.querySelector(".cycle-payment-type-input");
    this.startDateInput = this.popup.querySelector(".start-date-input");
    this.endDateInput = this.popup.querySelector(".end-date-input");
    this.noteInput = this.popup.querySelector(".note-input");
    this.saveBtn = this.popup.querySelector(".save-btn");

    this.load = () => {
        var htmlOptionsString = mdl.partner.list.
        sort((a, b) => {
            if (a.name > b.name) {
                return 1;
            } else {
                return -1;
            }
        }).
        map(partner => `<option value="${partner.id}">${partner.name}</option>`).join(" ");
        this.partnerInput.innerHTML = htmlOptionsString;

        this.idInput.value = mdl.ar.currentItem.id;
        this.partnerInput.value = mdl.ar.currentItem.partner;
        this.typeInput.value = mdl.ar.currentItem.type;
        this.amountInput.value = mdl.ar.currentItem.amount;
        this.expirationDateInput.value = mdl.ar.currentItem.expirationDate;
        this.cyclePaymentTypeInput.value = mdl.ar.currentItem.cyclePaymentType;
        this.startDateInput.value = mdl.ar.currentItem.startDate;
        this.endDateInput.value = mdl.ar.currentItem.endDate;
        this.noteInput.value = mdl.ar.currentItem.note;

        this.refreshFieldsVisibility();
    };
    this.open = () => {
        this.load();
        this.center();
        openFormPopup(this.popup);
    };
    this.refreshFieldsVisibility = () => {
        this.popup.querySelectorAll(".for-periodic-ar, .for-one-time-ar").forEach(elm => elm.style.display = "none" );
        if (this.typeInput.value === "Mensualidad") {
            this.popup.querySelectorAll(".for-periodic-ar").forEach(elm => elm.style.display = "block" );
        } else {
            this.popup.querySelectorAll(".for-one-time-ar").forEach(elm => elm.style.display = "block" );
        }
    };
    this.onTypeInputChange = () => {
        this.refreshFieldsVisibility();
    };
    this.onSaveBtnClick = () => {
        if (mdl.ar.currentItem.id) {
            // EDIT
            mdl.ar.currentItem.partner = parseInt(this.partnerInput.value);
            mdl.ar.currentItem.type = this.typeInput.value;
            mdl.ar.currentItem.amount = this.amountInput.value;
            mdl.ar.currentItem.expirationDate = this.expirationDateInput.value;
            mdl.ar.currentItem.cyclePaymentType = this.cyclePaymentTypeInput.value;
            mdl.ar.currentItem.startDate = this.startDateInput.value;
            mdl.ar.currentItem.endDate = this.endDateInput.value;
            mdl.ar.currentItem.note = this.noteInput.value;

            pubsub.emit("ar_change", { edit: [ mdl.ar.currentItem ] });
        } else {
            // INSERT
            console.log(this.partnerInput.value);
            var newAR = {
                id: mdl.ar.nextNewItemId(),
                partner: parseInt(this.partnerInput.value),
                type: this.typeInput.value,
                amount: this.amountInput.value,
                expirationDate: this.expirationDateInput.value,
                cyclePaymentType: this.cyclePaymentTypeInput.value,
                startDate: this.startDateInput.value,
                endDate: this.endDateInput.value,
                note: this.noteInput.value
            };
            mdl.ar.addItem(newAR);
            // el evento de que se agrego un partner se emite desde dentro del modelo
        }
        closeFormPopup();
    };
    this.center = _centerPopup;

    this.typeInput.addEventListener("input", this.onTypeInputChange);
    this.saveBtn.addEventListener("click", this.onSaveBtnClick);

    return {
        open: this.open
    }
};

// PANEL
var ArPanel = function (mdl, panelElm) {
    this.panel = panelElm;
    this.filterInput = this.panel.querySelector(".filter-input");
    this.addBtn = this.panel.querySelector(".panel-add-btn");
    this.table = this.panel.querySelector("table");
    this.formPopup = new ArPopup(mdl, document.querySelector("#ar-form-popup"));

    this.clearTable = _clearTable;
    this.addRow = (item) => {
        var tbody = this.table.querySelector("tbody");
        var tr = document.createElement("tr");
    
        var partner = mdl.partner.getItemById(item.partner);

        tr.innerHTML = `
            <td>${item.id}</td>
            <td class="partner-name-td">${partner.name}</td>
            <td class="type-td">${item.type}</td>
            <td class="amount-td">${item.amount}</td>
            <td class="date-td">${item.expirationDate}</td>
            <td class="btns-td">
            <button data-ar-id="${item.id}" class="edit-btn custom-btn-1">&#x270E;</button>
            <button data-ar-id="${item.id}" class="delete-btn custom-btn-1">&#10006;</button>
            </td>`;
        tbody.appendChild(tr);
    
        tr.querySelector(".edit-btn").addEventListener("click", this.onEditBtnClick);
        tr.querySelector(".delete-btn").addEventListener("click", this.onDeleteBtnClick);
    };
    this.loadTable = () => {
        this.clearTable(this.table);
    
        for (var i = 0; i < mdl.ar.list.length; i++) {
            this.addRow(mdl.ar.list[i]);
        }
    };
    this.onAddBtnClick = () => {
        mdl.ar.currentItem = {
            id: null,
            payId: null,
            partner: null,
            partnerName: "",
            type: "Mensualidad",
            amount: null,
            expirationDate: null,
            cyclePaymentType: "cycle-start",
            startDate: null,
            endDate: null,
            note: ""
        };
        this.formPopup.open();
    };
    this.onEditBtnClick = (evt) => {
        mdl.ar.currentItem = mdl.ar.getItemById(evt.target.dataset.arId);
        this.formPopup.open();
    };
    this.onDeleteBtnClick = (evt) => {
        var ar = mdl.ar.getItemById(evt.target.dataset.arId);
        var partner = mdl.partner.getItemById(ar.partner);
        confirmPopup.open(
            `Se va a eliminar la cuenta por cobrar <strong>(${ar.id} | ${partner.name} | ${ar.type} | $${ar.amount} | ${ar.date})</strong>.`,
            (response) => {
                if (response === true) {
                    mdl.partner.removeItemById(ar.id);
                }
            },
            evt.target
        );
    };
    this.onFilterInputChange = _filterTable.bind(this);
    this.onArChange = (arg) => {
        if (arg.edit) {
            for (var item of arg.edit) {
                var partner = mdl.partner.getItemById(item.partner);
                var tr = this.table.querySelector(`[data-ar-id='${item.id}']`).closest("tr");
                tr.querySelector(".partner-name-td").innerHTML = partner.name;
                tr.querySelector(".type-td").innerHTML = item.type;
                tr.querySelector(".amount-td").innerHTML = item.amount;
                tr.querySelector(".date-td").innerHTML = item.expirationDate;
            }
        }
        if (arg.add) {
            for (var item of arg.add) {
                this.addRow(item);
            }
        }
        if (arg.remove) {
            for (var item of arg.remove) {
                this.table.querySelector(`[data-ar-id='${item.id}']`).closest("tr").remove();
            }
        }
    };

    this.loadTable();
    this.addBtn.addEventListener("click", this.onAddBtnClick);
    this.filterInput.addEventListener("input", this.onFilterInputChange);
    pubsub.add("ar_change", this.onArChange);
};

var arPanel = new ArPanel(mdl, document.querySelector("#ar-panel"));
