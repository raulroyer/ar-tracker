var TxArPopupCtrllr = function (popup) {
    this.model = {
        id: null,
        category: null,
        partner: null,
        partnerName: "",
        type: null,
        amount: null, 
        date: null,
        note: ""    
    };
    this.popup = popup;
    this.idInput = this.popup.querySelector(".id-input");
    this.partnerInput = this.popup.querySelector(".partner-input");
    this.typeInput = this.popup.querySelector(".type-input");
    this.amountInput = this.popup.querySelector(".amount-input");
    this.dateInput = this.popup.querySelector(".date-input");
    this.noteInput = this.popup.querySelector(".note-input");
    this.saveBtn = this.popup.querySelector(".btn-save");

    this.centerForm = () => {
        this.popup.style.right = `${(window.innerWidth - txFormPopup.getBoundingClientRect().width)/2}px`;
        this.popup.style.top = `${window.scrollY + 10}px`;
    };
    this.refreshForm = () => {
        var htmlOptionsString = model.partners.
        sort((a, b) => {
            if (a.name > b.name) {
                return 1;
            } else {
                return -1;
            }
        }).
        map(partner => `<option value="${partner.id}">${partner.name}</option>`).join(" ");
        this.partnerInput.innerHTML = htmlOptionsString;

        this.idInput.value = model.currentTx.id;
        this.partnerInput.value = model.currentTx.partner;
        this.typeInput.value = model.currentTx.type;
        this.amountInput.value = model.currentTx.amount;
        this.dateInput.value = model.currentTx.date;
        this.noteInput.value = model.currentTx.note;       
    };

    this._listeners = {};
    this.addListener = (eventName, listenerFunc) => {
        if (!Array.isArray(this._listeners[eventName])) {
            this._listeners[eventName] = [];
        }

        if (!this._listeners[eventName].includes(listenerFunc)) {
            this._listeners[eventName].push(listenerFunc);
        }
    };
    this.removeListener = (eventName, listenerFunc) => {
        if (Array.isArray(this._listeners[eventName])) {
            var index = this._listeners[eventName].indexOf(listenerFunc);
            if (index !== -1) {
                this._listeners[eventName].splice(index, 1);
            }
        }
    };
    this._emit = (eventName, args) => {
        if (Array.isArray(this._listeners[eventName])) {
            this._listeners[eventName].forEach(listenerFunc => listenerFunc(args));
        }
    };
};