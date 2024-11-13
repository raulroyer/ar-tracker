// POPUP
var PartnerPopup = function (mdl, popupElm) {
    this.popup = popupElm;
    this.idInput = this.popup.querySelector(".id-input");
    this.nameInput = this.popup.querySelector(".name-input");
    this.saveBtn = this.popup.querySelector(".save-btn");

    this.load = () => {
        this.idInput.value = mdl.partner.currentItem.id;
        this.nameInput.value = mdl.partner.currentItem.name;
    };
    this.open = () => {
        this.load();
        this.center();
        openFormPopup(this.popup);
    };
    this.focus = () => {
        this.nameInput.focus();
    };
    this.onSaveBtnClick = () => {
        if (mdl.partner.currentItem.id) {
            // EDIT
            mdl.partner.currentItem.name = this.nameInput.value.trim();
            pubsub.emit("partners_change", { edit: [ mdl.partner.currentItem ] });
        } else {
            // INSERT
            var newPartner = {
                id: mdl.partner.nextNewItemId(),
                name: this.nameInput.value.trim()
            };
            mdl.partner.addItem(newPartner);
            // el evento de que se agrego un partner se emite desde dentro del modelo
        }
        closeFormPopup();
    };
    this.center = _centerPopup;

    this.saveBtn.addEventListener("click", this.onSaveBtnClick);

    return {
        open: this.open,
        focus: this.focus,
    };
};

// PANEL
var PartnersPanel = function (mdl, panelElm) {
    this.panel = panelElm;
    this.filterInput = this.panel.querySelector(".filter-input");
    this.addBtn = this.panel.querySelector(".panel-add-btn");
    this.table = this.panel.querySelector("table");
    this.formPopup = new PartnerPopup(mdl, document.querySelector("#partner-form-popup"));

    this.clearTable = _clearTable;
    this.addRow = (item) => {
        var tbody = this.table.querySelector("tbody");
        var tr = document.createElement("tr");
    
        tr.innerHTML = `
            <td>${item.id}</td>
            <td class="name-td">${item.name}</td>
            <td class="btns-td">
            <button data-partner-id="${item.id}" class="edit-btn custom-btn-1">&#x270E;</button>
            <button data-partner-id="${item.id}" class="delete-btn custom-btn-1">&#10006;</button>
            </td>`;
        tbody.appendChild(tr);
    
        tr.querySelector(".edit-btn").addEventListener("click", this.onEditBtnClick);
        tr.querySelector(".delete-btn").addEventListener("click", this.onDeleteBtnClick);
    };
    this.loadTable = () => {
        this.clearTable(this.table);
    
        for (var i = 0; i < mdl.partner.list.length; i++) {
            this.addRow(mdl.partner.list[i]);
        }
    };
    this.onAddBtnClick = () => {
        mdl.partner.currentItem = { id: null, name: "" };
        this.formPopup.open();
        this.formPopup.focus(); 
    };
    this.onEditBtnClick = (evt) => {
        mdl.partner.currentItem = mdl.partner.getItemById(evt.target.dataset.partnerId);
        this.formPopup.open();
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
            evt.target
        );
    };
    this.onFilterInputChange = _filterTable.bind(this);
    this.onPartnersChange = (arg) => {
        if (arg.edit) {
            for (var item of arg.edit) {
                var tr = this.table.querySelector(`[data-partner-id='${item.id}']`).closest("tr");
                if (item.name) {
                    tr.querySelector(".name-td").innerHTML = item.name;
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
                this.table.querySelector(`[data-partner-id='${item.id}']`).closest("tr").remove();
            }
        }
    };

    this.addBtn.addEventListener("click", this.onAddBtnClick);
    this.filterInput.addEventListener("input", this.onFilterInputChange);
    pubsub.add("partners_change", this.onPartnersChange);

    this.loadTable();
};

var partnersPanel = new PartnersPanel(mdl, document.querySelector("#partners-panel"));