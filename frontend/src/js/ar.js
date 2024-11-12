
var ArPanelCtrllr = function (model, panel, arPopup) {
    this.panel = panel;
    this.filterInput = this.panel.querySelector(".filter-input");
    this.table = this.panel.querySelector("table");
    this.currentTr;
    this.addBtn = this.panel.querySelector(".panel-add-btn");
    this.arPopup = arPopup;

    this._onAddBtnClick = () => {
        // popup.getBoundingClientRect() hack
        txFormPopup.style.visibility = "hidden";
        txFormPopup.style.display = "block";

        txFormPopup.style.right = `${(window.innerWidth - txFormPopup.getBoundingClientRect().width)/2}px`;
        txFormPopup.style.top = `${window.scrollY + 10}px`;

        var now = new Date();

        model.currentTx = {
            id: null,
            category: null,
            targetTxId: null,
            partnerName: "",
            type: null,
            paymentMethod: null,
            amount: null,
            date: `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`,
            note: ""
        };
        loadTxForm();
        openFormPopup(txFormPopup);

        txPartnerInput.focus();
    };
    this._onEditTxBtnClick = (evt) => {
        // popup.getBoundingClientRect() hack
        txFormPopup.style.visibility = "hidden";
        txFormPopup.style.display = "block";
    
        txFormPopup.style.right = `${(window.innerWidth - txFormPopup.getBoundingClientRect().width)/2}px`;
        txFormPopup.style.top = `${window.scrollY + 10}px`;
    
        txCurrentTr = evt.target.closest("tr");
    
        model.currentTx = getTxById(evt.target.dataset.txId);
        loadTxForm();
        // openFormPopup(txFormPopup);
        testPopupCtrl.refreshForm();
        testPopupCtrl.centerForm();
        openFormPopup(testPopupCtrl.popup);
    };
    this._onDeleteTxBtnClick = (evt) => {
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
    };
    this._onTxFilterInputChange = () => {
        var filterText = txFilterInput.value;
        filterText = filterText.trim().toLowerCase();
        txTable.querySelectorAll("tbody tr").forEach((tr) => {
            if (tr.textContent.toLowerCase().includes(filterText)) {
                tr.style.display = "table-row";
            } else {
                tr.style.display = "none";
            }
        });
    };
    this._onPartnersChange = (evt) => {
        if (evt.remove) {
            removeTxByPartnerId(evt.remove.id);
            loadTxTable();
        } else if (evt.edit) {
            loadTxTable();
        }
    };
    this.addRow = (item) => {
        var tbody = this.table.querySelector("tbody");
        var tr = document.createElement("tr");
    
        var partner = getPartnerById(item.partner);
    
        tr.innerHTML = `
            <td>${item.id}</td>
            <td class="partner-name-td">${partner.name}</td>
            <td class="type-td">${item.type}</td>
            <td class="payment-method-td">${item.paymentMethod}</td>
            <td class="amount-td">${item.amount}</td>
            <td class="date-td">${item.date}</td>
            <td class="btns-td">
            <button data-tx-id="${item.id}" class="edit-btn custom-btn-1">&#x270E;</button>
            <button data-tx-id="${item.id}" class="delete-btn custom-btn-1">&#10006;</button>
            </td>`;
        tbody.appendChild(tr);
    
        tr.querySelector(".edit-btn").addEventListener("click", onEditTxBtnClick);
        tr.querySelector(".delete-btn").addEventListener("click", onDeleteTxBtnClick);
    };
    this.loadTable = () => {
        clearTable(this.table);
    
        for (var i = 0; i < this.model.list.length; i++) {
            this.addRow(this.model.list[i]);
        }
    };

    this.loadTable();
    // addPartnersListener(onPartnersChange);
    this.addBtn.addEventListner("click", this._onAddBtnClick);
    this.filterInput.addEventListner("input", this._onFilterInputChange);
}

var ArPopupCtrllr = function (popup) {
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
    this.saveBtn = this.popup.querySelector(".save-btn");

    this.centerForm = () => {
        // popup.getBoundingClientRect() hack
        this.popup.style.visibility = "hidden";
        this.popup.style.display = "block";

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

