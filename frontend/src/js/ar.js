import { _centerPopup, _clearTable, _filterTable, positiveTwoDecimalAmountRegexp, dateToYYYYMMDD, alertPopup, confirmPopup } from './common.js'
import { pubsub } from './model.js'

// POPUP
export var ArPopup = function (mdl, popupElm) {
    this.popup = popupElm;
    this.idInput = this.popup.querySelector(".id-input");
    this.partnerInput = this.popup.querySelector(".partner-input");
    this.typeInput = this.popup.querySelector(".type-input");
    this.amountInput = this.popup.querySelector(".amount-input");
    this.balanceInput = this.popup.querySelector(".balance-input");
    this.expirationDateInput = this.popup.querySelector(".expiration-date-input");
    this.cycleAmountInput = this.popup.querySelector(".cycle-amount-input");
    this.cyclePaymentTypeInput = this.popup.querySelector(".cycle-payment-type-input");
    this.startDateInput = this.popup.querySelector(".start-date-input");
    this.endDateInput = this.popup.querySelector(".end-date-input");
    this.noteInput = this.popup.querySelector(".note-input");
    this.saveBtn = this.popup.querySelector(".save-btn");
    this.closeBtn = this.popup.querySelector(".close-btn");
    this.overlayElm = document.createElement("div");
    this.loadedItem;

    this.load = (item) => {
        if (item == null) {
            item = mdl.ar.getBlankItem();
            item.type = "Mensualidad";
            item.cyclePaymentType = "cycle-start";
        }
        this.loadedItem = item;

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

        this.idInput.value = item.id;
        this.partnerInput.value = item.partner;
        this.typeInput.value = item.type;
        this.amountInput.value = item.amount.toFixed(2);
        this.cycleAmountInput.value = item.cycleAmount.toFixed(2);
        this.balanceInput.value = item.id ? item.balance.toFixed(2) : "";
        this.expirationDateInput.value = item.expirationDate;
        this.cyclePaymentTypeInput.value = item.cyclePaymentType;
        this.startDateInput.value = item.startDate;
        this.endDateInput.value = item.endDate;
        this.noteInput.value = item.note;

        this.refreshFieldsVisibility();
    };
    this.open = (item, config) => {
        this.load(item);
        this.center();

        this.popup.parentElement.append(this.popup);

        if (config && config.readonly === true) {
            this.setReadOnlyMode(true);
        } else {
            this.setReadOnlyMode(false);
        }

        var isEditing = item && item.id !== null;
        if (isEditing) {
            this.partnerInput.setAttribute("disabled", true);
            this.typeInput.setAttribute("disabled", true);
            this.amountInput.setAttribute("disabled", true);
            this.expirationDateInput.setAttribute("disabled", true);
            this.cycleAmountInput.setAttribute("disabled", true);
            this.cyclePaymentTypeInput.setAttribute("disabled", true);
            this.startDateInput.setAttribute("disabled", true);
            this.endDateInput.setAttribute("disabled", true);
        } else {
            this.partnerInput.removeAttribute("disabled");
            this.typeInput.removeAttribute("disabled");
            if (this.typeInput.value === "Mensualidad") {
                this.amountInput.setAttribute("disabled", true);
            } else {
                this.amountInput.removeAttribute("disabled");
            }
            this.expirationDateInput.removeAttribute("disabled");
            this.cycleAmountInput.removeAttribute("disabled");
            this.cyclePaymentTypeInput.removeAttribute("disabled");
            this.startDateInput.removeAttribute("disabled");
            this.endDateInput.removeAttribute("disabled");
        }

        if (config && config.overlay === true) {
            this.popup.before(this.overlayElm);
            this.overlayElm.style.display = "block";
        }

        this.popup.style.visibility = "visible";
    };
    this.close = () => {
        this.overlayElm.remove();
        this.popup.style.visibility = "hidden";
        pubsub.emit("ar-popup-close", { popup: this });
    };
    this.alignToTheLeft = () => {
        this.popup.style.left = "5px";
    };
    this.setReadOnlyMode = (flag) => {
        if (flag === true) {
            this.partnerInput.setAttribute("disabled", true);
            this.typeInput.setAttribute("disabled", true);
            // this.amountInput.setAttribute("disabled", true);
            this.expirationDateInput.setAttribute("disabled", true);
            this.cyclePaymentTypeInput.setAttribute("disabled", true);
            this.startDateInput.setAttribute("disabled", true);
            this.endDateInput.setAttribute("disabled", true);
            this.noteInput.setAttribute("disabled", true);
            this.saveBtn.setAttribute("disabled", true);
        } else if (flag === false) {
            this.partnerInput.removeAttribute("disabled");
            this.typeInput.removeAttribute("disabled");
            // this.amountInput.removeAttribute("disabled");
            this.expirationDateInput.removeAttribute("disabled");
            this.cyclePaymentTypeInput.removeAttribute("disabled");
            this.startDateInput.removeAttribute("disabled");
            this.endDateInput.removeAttribute("disabled");
            this.noteInput.removeAttribute("disabled");
            this.saveBtn.removeAttribute("disabled");
        }
    };
    this.refreshFieldsVisibility = () => {
        this.popup.querySelectorAll(".for-periodic-ar, .for-one-time-ar").forEach(elm => elm.style.display = "none" );
        if (this.typeInput.value !== "") {
            if (this.typeInput.value === "Mensualidad") {
                this.popup.querySelectorAll(".for-periodic-ar").forEach(elm => elm.style.display = "block" );
                this.amountInput.setAttribute("disabled", true);
            } else {
                this.popup.querySelectorAll(".for-one-time-ar").forEach(elm => elm.style.display = "block" );
                this.amountInput.removeAttribute("disabled");
            }
        }
    };
    this.getFormErrors = () => {
        var errors = {};
        if (this.partnerInput.value == "") {
            errors["Socio"] = [ "Sin definir" ];
        }
        if (this.typeInput.value == "") {
            errors["Tipo"] = [ "Sin definir" ];
        }
        if (this.typeInput.value === "Mensualidad") {
            if (!positiveTwoDecimalAmountRegexp.test(this.cycleAmountInput.value)) {
                errors["Monto"] = [ "No se cumple el formato" ];
            } else {
                if (parseFloat(this.cycleAmountInput.value) == 0) {
                    errors["Monto"] = [ "El monto no puede ser $0.00" ];
                }
            }
            if (this.cyclePaymentTypeInput.value == "") {
                errors["Momento del pago"] = [ "Sin definir" ];
            }
            if (this.startDateInput.value == "") {
                errors["startDate"] = [ "Sin definir" ];
            }
        } else {
            if (!positiveTwoDecimalAmountRegexp.test(this.amountInput.value)) {
                errors["Monto"] = [ "No se cumple el formato" ];
            } else {
                if (parseFloat(this.amountInput.value) == 0) {
                    errors["Monto"] = [ "El monto no puede ser $0.00" ];
                }
            }
            if (this.expirationDateInput.value == "") {
                errors["expirationDate"] = [ "Sin definir" ];
            }
        }
        return errors;
    };
    this.getFormItem = () => {
        var formItem = {};
        formItem.id = parseInt(this.idInput.value);
        formItem.partner = parseInt(this.partnerInput.value);
        formItem.type = this.typeInput.value;
        formItem.balance = null;
        if (this.typeInput.value === "Mensualidad") {
            formItem.amount = null;
            // formItem.balance = null;
            formItem.expirationDate = null;
            formItem.cycleAmount = parseFloat(this.cycleAmountInput.value);
            formItem.cyclePaymentType = this.cyclePaymentTypeInput.value;
            formItem.startDate = this.startDateInput.value;
            formItem.endDate = this.endDateInput.value;
        } else {
            formItem.amount = parseFloat(this.amountInput.value);
            // formItem.balance = parseFloat(this.balanceInput.value);
            formItem.expirationDate = this.expirationDateInput.value;
            formItem.cycleAmount = 0;
            formItem.cyclePaymentType = null;
            formItem.startDate = null;
            formItem.endDate = null;
        }
        formItem.note = this.noteInput.value;

        return formItem;
    };
    this.isClosed = () => {
        return this.popup.style.visibility === "hidden";
    };
    this.onTypeInputChange = () => {
        this.refreshFieldsVisibility();
    };
    this.onSaveBtnClick = () => {
        if (Object.keys(this.getFormErrors()).length > 0) {
            alertPopup.open(JSON.stringify(this.getFormErrors(), null, 3), { overlay: true });
            return;
        }

        var formItem = this.getFormItem();

        if (this.idInput.value) {
            mdl.ar.setItem(this.idInput.value, formItem);
        } else {
            formItem.id = mdl.ar.nextNewItemId();
            mdl.ar.addItem(formItem);
        }

        this.close();
    };
    this.onCloseBtnClick = () => {
        this.close();
    };
    this.onOverlayClick = () => {
        this.close();
    };
    this.center = _centerPopup;

    this.overlayElm.classList.add("overlay");
    this.overlayElm.addEventListener("click", this.onOverlayClick);
    this.typeInput.addEventListener("input", this.onTypeInputChange);
    this.saveBtn.addEventListener("click", this.onSaveBtnClick);
    this.closeBtn.addEventListener("click", this.onCloseBtnClick);

    return {
        open: this.open,
        close: this.close,
        isClosed: this.isClosed,
        alignToTheLeft: this.alignToTheLeft,
        setReadOnlyMode: this.setReadOnlyMode
    };
};

// PANEL
export var ArPanel = function (mdl, panelElm, arFormPopup, paymentFormPoup) {
    this.panel = panelElm;
    this.filterInput = this.panel.querySelector(".filter-input");
    this.addBtn = this.panel.querySelector(".panel-add-btn");
    this.table = this.panel.querySelector("table");
    this.formPopup = arFormPopup;
    this.payFormPopup = paymentFormPoup;

    this.clearTable = _clearTable;
    this.addRow = (item) => {
        var tbody = this.table.querySelector("tbody");
        var tr = document.createElement("tr");
    
        var partner = mdl.partner.getItemById(item.partner);
        var expiration = item.expirationDate;
        if (item.type === "Mensualidad") {
            var date = new Date();
            if (item.cyclePaymentType === "cycle-start") {
                date.setDate(0);
                expiration = dateToYYYYMMDD(date);
            } else {
                date.setMonth(date.getMonth() + 1);
                date.setDate(0);
                expiration = dateToYYYYMMDD(date);
            }
        }

        tr.setAttribute("class", mdl.ar.calcArState(item));
        tr.innerHTML = `
            <td class="id-td">${item.id}</td>
            <td class="partner-name-td" data-partner="${partner.id}">${partner.name}</td>
            <td class="type-td">${item.type}</td>
            <td class="amount-td"><strong>${item.balance.toFixed(2)}</strong>/${item.amount.toFixed(2)}</td>
            <td class="date-td">${expiration}</td>
            <td class="btns-td">
            <button data-ar-id="${item.id}" class="edit-btn custom-btn-1">
                <span class="material-symbols-outlined" data-ar-id="${item.id}">stylus</span>
            </button>
            <button data-ar-id="${item.id}" ${item.balance == 0 ? "disabled" : ""} class="pay-btn custom-btn-1">
                <span class="material-symbols-outlined" data-ar-id="${item.id}">attach_money</span>
            </button>
            <button data-ar-id="${item.id}" class="delete-btn custom-btn-1">
                <span class="material-symbols-outlined" data-ar-id="${item.id}">close</span>
            </button>
            </td>`;
        tbody.prepend(tr);
    
        tr.querySelector(".edit-btn").addEventListener("click", this.onEditBtnClick);
        tr.querySelector(".pay-btn").addEventListener("click", this.onPayBtnClick);
        tr.querySelector(".delete-btn").addEventListener("click", this.onDeleteBtnClick);
    };
    this.loadTable = () => {
        this.clearTable(this.table);
    
        for (var i = 0; i < mdl.ar.list.length; i++) {
            this.addRow(mdl.ar.list[i]);
        }
    };
    this.onAddBtnClick = () => {
        this.formPopup.open(null, { overlay: true });
    };
    this.onEditBtnClick = (evt) => {
        var selectedItem = mdl.ar.getItemById(evt.target.dataset.arId);
        this.formPopup.open(selectedItem, { overlay: true });
    };
    this.onPayBtnClick = (evt) => {
        var selectedItem = mdl.ar.getItemById(evt.target.dataset.arId);
        this.formPopup.open(selectedItem, { overlay: true });
        this.formPopup.setReadOnlyMode(true);
        this.formPopup.alignToTheLeft();

        var payment = mdl.payment.getBlankItem();
        payment.arId = selectedItem.id;
        payment.amount = selectedItem.balance;
        payment.date = dateToYYYYMMDD(new Date());
        this.payFormPopup.open(payment, { overlay: false });
    };
    this.onDeleteBtnClick = (evt) => {
        var ar = mdl.ar.getItemById(evt.target.dataset.arId);
        var partner = mdl.partner.getItemById(ar.partner);
        confirmPopup.open(
            `Se va a eliminar la cuenta por cobrar <strong>(${ar.id} | ${partner.name} | ${ar.type} | $${ar.balance} | ${ar.expirationDate})</strong>. Esta acción eliminará los pagos asociados.`,
            (response) => {
                if (response === true) {
                    mdl.ar.removeItemById(ar.id);
                }
            },
            {
                alongsideElm: evt.target,
                overlay: true
            }
        );
    };
    this.onFilterInputChange = _filterTable.bind(this);
    this.onArChange = (arg) => {
        if (arg.edit) {
            for (var item of arg.edit) {
                var expiration = item.expirationDate;
                if (item.type === "Mensualidad") {
                    var date = new Date();
                    if (item.cyclePaymentType === "cycle-start") {
                        date.setDate(0);
                        expiration = dateToYYYYMMDD(date);
                    } else {
                        date.setMonth(date.getMonth() + 1);
                        date.setDate(0);
                        expiration = dateToYYYYMMDD(date);
                    }
                }

                var partner = mdl.partner.getItemById(item.partner);
                var tr = this.table.querySelector(`[data-ar-id='${item.id}']`).closest("tr");
                tr.setAttribute("class", mdl.ar.calcArState(item));
                tr.querySelector(".partner-name-td").innerHTML = partner.name;
                tr.querySelector(".type-td").innerHTML = item.type;
                tr.querySelector(".amount-td").innerHTML = `<strong>${item.balance.toFixed(2)}</strong>/${item.amount.toFixed(2)}`;
                tr.querySelector(".date-td").innerHTML = expiration;
                if (item.balance == 0) {
                    tr.querySelector(".pay-btn").setAttribute("disabled", true);
                } else {
                    tr.querySelector(".pay-btn").removeAttribute("disabled");
                }
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
    this.onPartnersChange = (arg) => {
        if (arg.edit) {
            for (var partner of arg.edit) {
                this.table.querySelectorAll(`[data-partner='${partner.id}']`).forEach((elm) => {
                    var tr = elm.closest("tr");
                    tr.querySelector(".partner-name-td").innerHTML = partner.name;
                });
            }
        }
    };
    this.onArPopupClose = () => {
        // en muchos escenarios payFormPopup no está abierto pero no pasa nada
        if (!this.payFormPopup.isClosed()) {
            this.payFormPopup.close();
        }
    };
    this.onPaymentPopupClose = () => {
        if (!this.formPopup.isClosed()) {
            this.formPopup.close();
        }
    };

    this.loadTable();
    this.addBtn.addEventListener("click", this.onAddBtnClick);
    this.filterInput.addEventListener("input", this.onFilterInputChange);
    pubsub.add("ar_change", this.onArChange);
    pubsub.add("partners_change", this.onPartnersChange);
    pubsub.add("ar-popup-close", this.onArPopupClose);
    pubsub.add("payment-popup-close", this.onPaymentPopupClose);
};
