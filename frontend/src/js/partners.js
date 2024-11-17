// POPUP
var PartnerPopup = function (mdl, popupElm) {
    this.popup = popupElm;
    this.idInput = this.popup.querySelector(".id-input");
    this.nameInput = this.popup.querySelector(".name-input");
    this.saveBtn = this.popup.querySelector(".save-btn");
    this.closeBtn = this.popup.querySelector(".close-btn");
    this.overlayElm = document.createElement("div");

    this.load = (item) => {
        if (item == null) {
            item = mdl.partner.getBlankItem();
        }

        this.idInput.value = item.id;
        this.nameInput.value = item.name;
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
