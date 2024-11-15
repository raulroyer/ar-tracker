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
    this.closeBtn = this.popup.querySelector(".close-btn");
    this.overlayElm = document.createElement("div");

    this.load = (item) => {
        if (item == null) {
            item = mdl.ar.getBlankItem();
            item.type = "Mensualidad"
        }

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

        if (config && config.overlay === true) {
            this.popup.before(this.overlayElm);
            this.overlayElm.style.display = "block";
        }

        this.popup.style.visibility = "visible";
    };
    this.close = () => {
        this.overlayElm.remove();
        this.popup.style.visibility = "hidden";
    };
    this.refreshFieldsVisibility = () => {
        this.popup.querySelectorAll(".for-periodic-ar, .for-one-time-ar").forEach(elm => elm.style.display = "none" );
        if (this.typeInput.value !== "") {
            if (this.typeInput.value === "Mensualidad") {
                this.popup.querySelectorAll(".for-periodic-ar").forEach(elm => elm.style.display = "block" );
            } else {
                this.popup.querySelectorAll(".for-one-time-ar").forEach(elm => elm.style.display = "block" );
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
        if (!positiveTwoDecimalAmountRegexp.test(this.amountInput.value)) {
            errors["Monto"] = [ "No se cumple el formato" ];
        }
        if (this.typeInput.value === "Mensualidad") {
            if (this.cyclePaymentTypeInput.value == "") {
                errors["Momento del pago"] = [ "Sin definir" ];
            }
            if (this.startDateInput.value == "") {
                errors["startDate"] = [ "Sin definir" ];
            }
        } else {
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
        formItem.amount = parseFloat(this.amountInput.value);
        if (this.typeInput.value === "Mensualidad") {
            formItem.expirationDate = null;
            formItem.cyclePaymentType = this.cyclePaymentTypeInput.value;
            formItem.startDate = this.startDateInput.value;
            formItem.endDate = this.endDateInput.value;
        } else {
            formItem.expirationDate = this.expirationDateInput.value;
            formItem.cyclePaymentType = null;
            formItem.startDate = null;
            formItem.endDate = null;
        }
        formItem.note = this.noteInput.value;

        return formItem;
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
            // EDIT
            mdl.ar.setItem(this.idInput.value, formItem);
        } else {
            // INSERT
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
        open: this.open
    };
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
            <td class="partner-name-td" data-partner="${partner.id}">${partner.name}</td>
            <td class="type-td">${item.type}</td>
            <td class="amount-td">${item.amount.toFixed(2)}</td>
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
        this.formPopup.open(null, { overlay: true });
    };
    this.onEditBtnClick = (evt) => {
        var selectedItem = mdl.ar.getItemById(evt.target.dataset.arId);
        this.formPopup.open(selectedItem, { overlay: true });
    };
    this.onDeleteBtnClick = (evt) => {
        var ar = mdl.ar.getItemById(evt.target.dataset.arId);
        var partner = mdl.partner.getItemById(ar.partner);
        confirmPopup.open(
            `Se va a eliminar la cuenta por cobrar <strong>(${ar.id} | ${partner.name} | ${ar.type} | $${ar.amount} | ${ar.expirationDate})</strong>.`,
            (response) => {
                if (response === true) {
                    mdl.partner.removeItemById(ar.id);
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
                var partner = mdl.partner.getItemById(item.partner);
                var tr = this.table.querySelector(`[data-ar-id='${item.id}']`).closest("tr");
                tr.querySelector(".partner-name-td").innerHTML = partner.name;
                tr.querySelector(".type-td").innerHTML = item.type;
                tr.querySelector(".amount-td").innerHTML = item.amount.toFixed(2);
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

    this.loadTable();
    this.addBtn.addEventListener("click", this.onAddBtnClick);
    this.filterInput.addEventListener("input", this.onFilterInputChange);
    pubsub.add("ar_change", this.onArChange);
    pubsub.add("partners_change", this.onPartnersChange);
};

var arPanel = new ArPanel(mdl, document.querySelector("#ar-panel"));
