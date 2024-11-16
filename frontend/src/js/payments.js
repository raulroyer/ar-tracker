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
        var errors = {};
        if (this.arInput.value == "") {
            errors["Cuenta por cobrar"] = [ "Sin definir" ];
        }
        if (!positiveTwoDecimalAmountRegexp.test(this.amountInput.value)) {
            errors["Monto"] = [ "No se cumple el formato" ];
        }
        if (this.dateInput.value == "") {
            errors["Fecha"] = [ "Sin definir" ];
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
            formItem.id = mdl.ar.nextNewItemId();
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

