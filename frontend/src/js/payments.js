// POPUP
var PaymentPopup = function (mdl, popupElm) {
    this.popup = popupElm;
    this.idInput = this.popup.querySelector(".id-input");
    this.arInput = this.popup.querySelector(".ar-id-input");
    this.amountInput = this.popup.querySelector(".amount-input");
    this.dateInput = this.popup.querySelector(".date-input");
    this.noteInput = this.popup.querySelector(".note-input");
    this.saveBtn = this.popup.querySelector(".save-btn");
    this.closeBtn = this.popup.querySelector(".close-btn");
    this.overlayElm = document.createElement("div");

    this.load = (item) => {
        if (item == null) {
            item = mdl.payment.getBlankItem();
        }

        this.idInput.value = item.id;
        this.arInput.value = item.arId;
        this.amountInput.value = item.amount.toFixed(2);
        this.dateInput.value = item.date;
        this.noteInput.value = item.note;
    };
    this.open = (item, config) => {
        this.load(item);
        this.center();

        this.popup.parentElement.append(this.popup);

        var isEditing = item && item.id !== null;
        if (isEditing) {
            this.amountInput.setAttribute("disabled", true);
            this.dateInput.setAttribute("disabled", true);
        } else {
            this.amountInput.removeAttribute("disabled");
            this.dateInput.removeAttribute("disabled");
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
        pubsub.emit("payment-popup-close", { popup: this });
    };
    this.isClosed = () => {
        return this.popup.style.visibility === "hidden";
    };
    this.getFormErrors = () => {
        var isEditing = this.idInput.value != "";

        var errors = {};
        if (this.arInput.value == "") {
            errors["Cuenta por cobrar"] = [ "Sin definir" ];
        }
        if (!positiveTwoDecimalAmountRegexp.test(this.amountInput.value)) {
            errors["Monto"] = [ "No se cumple el formato" ];
        } else {
            if (!isEditing) {
                var ar = mdl.ar.getItemById(parseInt(this.arInput.value));
                if (parseFloat(this.amountInput.value) > ar.balance) {
                    errors["Monto"] = [ `El monto no puede ser mayor que lo adeudado ($${ar.balance.toFixed(2)})` ]
                } else if (parseFloat(this.amountInput.value) === 0) {
                    errors["Monto"] = [ `El monto no puede ser $0.00` ]
                }
            }
        }
        if (this.dateInput.value == "") {
            errors["Fecha"] = [ "Sin definir" ];
        } else {
            var date = YYYYMMDDToDate(this.dateInput.value);

            if (date.getTime() > Date.now()) {
                errors["Fecha"] = [ "La fecha no puede ser superior a la actual" ];
            }
        }

        return errors;
    };
    this.getFormItem = () => {
        var formItem = {};
        formItem.id = parseInt(this.idInput.value);
        formItem.arId = parseInt(this.arInput.value);
        formItem.amount = parseFloat(this.amountInput.value);
        formItem.date = this.dateInput.value;
        formItem.note = this.noteInput.value;

        return formItem;
    };
    this.onSaveBtnClick = () => {
        if (Object.keys(this.getFormErrors()).length > 0) {
            alertPopup.open(JSON.stringify(this.getFormErrors(), null, 3), { overlay: true });
            return;
        }

        var formItem = this.getFormItem();
        if (this.idInput.value) {
            mdl.payment.setItem(this.idInput.value, formItem);
        } else {
            formItem.id = mdl.payment.nextNewItemId();
            mdl.payment.addItem(formItem);
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
    this.saveBtn.addEventListener("click", this.onSaveBtnClick);
    this.closeBtn.addEventListener("click", this.onCloseBtnClick);

    return {
        open: this.open,
        close: this.close,
        isClosed: this.isClosed
    };
};

// PANEL
var PaymentsPanel = function (mdl, panelElm, paymentPopup, arPopup) {
    this.panel = panelElm;
    this.filterInput = this.panel.querySelector(".filter-input");
    this.table = this.panel.querySelector("table");
    this.formPopup = paymentPopup;

    this.clearTable = _clearTable;
    this.addRow = (item) => {
        var tbody = this.table.querySelector("tbody");
        var tr = document.createElement("tr");

        var arItem = mdl.ar.getItemById(item.arId);
        var partner = mdl.partner.getItemById(arItem.partner);

        tr.innerHTML = `
            <td class="id-td">${item.id}</td>
            <td class="partner-name-td" data-partner="${partner.id}">${partner.name}</td>
            <td class="ar-id-td">${item.arId}</td>
            <td class="ar-type-td" data-ar="${item.arId}">${arItem.type}</td>
            <td class="amount-td"><strong>${item.amount.toFixed(2)}</strong>/${arItem.amount.toFixed(2)}</td>
            <td class="date-td">${item.date}</td>
            <td class="btns-td">
            <button data-payment-id="${item.id}" class="edit-btn custom-btn-1">&#x270E;</button>
            <button data-payment-id="${item.id}" class="delete-btn custom-btn-1">&#10006;</button>
            </td>`;
        tbody.appendChild(tr);

        tr.querySelector(".edit-btn").addEventListener("click", this.onEditBtnClick);
        tr.querySelector(".delete-btn").addEventListener("click", this.onDeleteBtnClick);
    };
    this.loadTable = () => {
        this.clearTable(this.table);

        for (var i = 0; i < mdl.payment.list.length; i++) {
            this.addRow(mdl.payment.list[i]);
        }
    };
    this.onEditBtnClick = (evt) => {
        var selectedItem = mdl.payment.getItemById(evt.target.dataset.paymentId);
        this.formPopup.open(selectedItem, { overlay: true });
    };
    this.onDeleteBtnClick = (evt) => {
        var payment = mdl.payment.getItemById(evt.target.dataset.paymentId);
        var ar = mdl.ar.getItemById(payment.arId);
        var partner = mdl.partner.getItemById(ar.partner);

        confirmPopup.open(
            `Se va a eliminar El pago <strong>(${payment.id} | ${partner.name} | ${ar.type} | $${payment.amount}/$${ar.balance} | ${payment.date})</strong>.`,
            (response) => {
                if (response === true) {
                    mdl.payment.removeItemById(payment.id);
                }
            },
            {
                alongsideElm: evt.target,
                overlay: true
            }
        );
    };
    this.onFilterInputChange = _filterTable.bind(this);
    this.onPaymentChange = (arg) => {
        if (arg.edit) {
            for (var item of arg.edit) {
                var ar = mdl.ar.getItemById(item.arId);
                var partner = mdl.partner.getItemById(ar.partner);

                var tr = this.table.querySelector(`[data-payment-id='${item.id}']`).closest("tr");
                tr.querySelector(".partner-name-td").innerHTML = partner.name;
                tr.querySelector(".ar-type-td").innerHTML = ar.type;
                tr.querySelector(".amount-td").innerHTML = `<strong>${item.amount.toFixed(2)}</strong>/${ar.amount.toFixed(2)}`;
                tr.querySelector(".date-td").innerHTML = item.date;
            }
        }
        if (arg.add) {
            for (var item of arg.add) {
                this.addRow(item);
            }
        }
        if (arg.remove) {
            for (var item of arg.remove) {
                this.table.querySelector(`[data-payment-id='${item.id}']`).closest("tr").remove();
            }
        }
    };
    this.onArChange = (arg) => {
        if (arg.edit) {
            for (var ar of arg.edit) {
                var partner = mdl.partner.getItemById(ar.partner);
                this.table.querySelectorAll(`[data-ar='${ar.id}']`).forEach((elm) => {
                    var tr = elm.closest("tr");
                    var paymentId = parseInt(tr.querySelector(".id-td").textContent);
                    var payment = mdl.payment.getItemById(paymentId);
                    // si payment es null es porque este evento es producto de haberlo eliminado del modelo
                    // entonces ese otro hilo de ejecución eliminará esta tr dentro de un instante
                    if (payment) {
                        tr.querySelector(".ar-type-td").innerHTML = ar.type;
                        tr.querySelector(".amount-td").innerHTML = `<strong>${payment.amount.toFixed(2)}</strong>/${ar.amount.toFixed(2)}`;
                        tr.querySelector(".partner-name-td").dataset.partner = partner.id;
                        tr.querySelector(".partner-name-td").innerHTML = partner.name;
                    }
                });
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
    this.filterInput.addEventListener("input", this.onFilterInputChange);
    pubsub.add("payments_change", this.onPaymentChange);
    pubsub.add("ar_change", this.onArChange);
    pubsub.add("partners_change", this.onPartnersChange);
};