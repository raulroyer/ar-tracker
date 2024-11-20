import { _centerPopup, _clearTable, _filterTable, confirmPopup, alertPopup } from './common.js'
import { pubsub } from './model.js'

// POPUP
export var PartnerPopup = function (mdl, popupElm) {
    this.popup = popupElm;
    this.idInput = this.popup.querySelector(".id-input");
    this.nameInput = this.popup.querySelector(".name-input");
    this.paymentsTotalInput = this.popup.querySelector(".payments-total-input");
    this.debtTotalInput = this.popup.querySelector(".debt-total-input");
    this.noteInput = this.popup.querySelector(".note-input");
    this.saveBtn = this.popup.querySelector(".save-btn");
    this.closeBtn = this.popup.querySelector(".close-btn");
    this.overlayElm = document.createElement("div");

    this.load = (item) => {
        if (item == null) {
            item = mdl.partner.getBlankItem();
        }

        this.idInput.value = item.id;
        this.nameInput.value = item.name;
        this.paymentsTotalInput.value = item.paymentsTotal.toFixed(2);
        this.debtTotalInput.value = item.debtTotal.toFixed(2);
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
    };
    this.focus = () => {
        this.nameInput.focus();
    };
    this.getFormErrors = () => {
        var errors = {};
        if (this.nameInput.value.trim() == "") {
            errors["Nombre"] = [ "Sin definir" ];
        }
        return errors;
    };
    this.getFormItem = () => {
        var formItem = {};
        formItem.id = parseInt(this.idInput.value);
        formItem.name = this.nameInput.value;
        formItem.paymentsTotal = parseFloat(this.paymentsTotalInput.value);
        formItem.debtTotal = parseFloat(this.debtTotalInput.value);
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
            mdl.partner.setItem(this.idInput.value, formItem);
        } else {
            formItem.id = mdl.partner.nextNewItemId();
            mdl.partner.addItem(formItem);
            // el evento de que se agrego un partner se emite desde dentro del modelo
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
        focus: this.focus,
    };
};

// PANEL
export var PartnersPanel = function (mdl, panelElm) {
    this.panel = panelElm;
    this.filterInput = this.panel.querySelector(".filter-input");
    this.addBtn = this.panel.querySelector(".panel-add-btn");
    this.table = this.panel.querySelector("table");
    this.formPopup = new PartnerPopup(mdl, document.querySelector("#partner-form-popup"));
    this.sortCursor = this.table.querySelector(".sort-cursor");
    this.sort = {field: "id", order: "desc"};

    this.clearTable = _clearTable;
    this.createRow = (item) => {
        var tr = document.createElement("tr");
    
        var balance = item.debtTotal - item.paymentsTotal;

        tr.innerHTML = `
            <td>${item.id}</td>
            <td class="name-td">${item.name}</td>
            <td class="balance-td">${balance.toFixed(2)}</td>
            <td class="btns-td">
                <button data-partner-id="${item.id}" class="edit-btn custom-btn-1">
                    <span class="material-symbols-outlined" data-partner-id="${item.id}">stylus</span>
                </button>
                <button data-partner-id="${item.id}" class="delete-btn custom-btn-1">
                    <span class="material-symbols-outlined" data-partner-id="${item.id}">close</span>
                </button>
            </td>`;
    
        tr.querySelector(".edit-btn").addEventListener("click", this.onEditBtnClick);
        tr.querySelector(".delete-btn").addEventListener("click", this.onDeleteBtnClick);

        return tr;
    };
    this.loadTable = () => {
        this.clearTable(this.table);
    
        var sortedList = this.getSortedList();
        var tbody = this.table.querySelector("tbody");
        for (var i = 0; i < sortedList.length; i++) {
            var tr = this.createRow(sortedList[i]);
            tbody.prepend(tr);
        }

        this.table.querySelector(`[data-sort-field="${this.sort.field}"]`).append(this.sortCursor);
        this.sortCursor.innerHTML = this.sort.order === "desc" ? "keyboard_arrow_up" : "keyboard_arrow_down";
    };
    this.getSortedList = () => {
        var sorted = mdl.partner.list.sort((a, b) => {
            if (this.sort.field === "id") {
                return a.id - b.id;
            } else if (this.sort.field === "name") {
                return (a.name > b.name) ? 1 : -1;
            } else if (this.sort.field === "balance") {
                var aBalance = a.debtTotal - a.paymentsTotal;
                var bBalance = b.debtTotal - b.paymentsTotal;
                return aBalance - bBalance;
            }
        });

        if (this.sort.order === "asc") {
            sorted.reverse();
        }

        return sorted;
    };
    this.onAddBtnClick = () => {
        this.formPopup.open(null, { overlay: true });
        this.formPopup.focus(); 
    };
    this.onEditBtnClick = (evt) => {
        var selectedItem = mdl.partner.getItemById(evt.target.dataset.partnerId);
        this.formPopup.open(selectedItem, { overlay: true });
    }
    this.onDeleteBtnClick = (evt) => {
        var partner = mdl.partner.getItemById(evt.target.dataset.partnerId);
        confirmPopup.open(
            `Se va a eliminar el socio <strong>${partner.name}</strong> (${partner.id}). Esta acción también eliminará sus transacciones.`,
            (response) => {
                if (response === true) {
                    mdl.partner.removeItemById(partner.id);
                }
            },
            {
                alongsideElm: evt.target,
                overlay: true
            }
        );
    };
    this.onFilterInputChange = _filterTable.bind(this);
    this.onSortFieldTriggerClick = (evt) => {
        var sortField = evt.target.dataset.sortField;
        if (!sortField) {
            sortField = evt.target.parentElement.dataset.sortField;
        }

        if (sortField !== this.sort.field) {
            this.sort.field = sortField;
            this.sort.order = "desc";
        } else {
            this.sort.order = this.sort.order === "desc" ? "asc" : "desc";
        }

        this.loadTable();
    };
    this.onPartnersChange = (arg) => {
        if (arg.edit) {
            for (var item of arg.edit) {
                var tr = this.table.querySelector(`[data-partner-id='${item.id}']`).closest("tr");
                if (item.name) {
                    tr.querySelector(".name-td").innerHTML = item.name;
                }
                if (typeof item.paymentsTotal !== undefined || typeof item.debtTotal !== undefined) {
                    var balance = item.debtTotal - item.paymentsTotal;
                    tr.querySelector(".balance-td").innerHTML = balance.toFixed(2);
                }
            }
        }
        if (arg.add) {
            var tbody = this.table.querySelector("tbody");
            for (var item of arg.add) {
                var tr = this.createRow(item);
                tbody.prepend(tr);
            }
        }
        if (arg.remove) {
            for (var item of arg.remove) {
                this.table.querySelector(`[data-partner-id='${item.id}']`).closest("tr").remove();
            }
        }
    };

    this.addBtn.addEventListener("click", this.onAddBtnClick);
    this.filterInput.addEventListener("input", this.onFilterInputChange);
    this.table.querySelectorAll("[data-sort-field]").forEach((elm => {
        elm.addEventListener("click", this.onSortFieldTriggerClick);
    }));
    pubsub.add("partners_change", this.onPartnersChange);

    this.loadTable();
};
