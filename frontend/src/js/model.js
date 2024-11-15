// event handler
var pubsub = {
    _list: [],
    add: function (eventName, callbackFunc) {
        if (!Array.isArray(this._list[eventName])) {
            this._list[eventName] = [];
        }

        if (!this._list[eventName].includes(callbackFunc)) {
            this._list[eventName].push(callbackFunc);
        }
    },
    remove: function (eventName, callbackFunc) {
        if (Array.isArray(this._list[eventName])) {
            var index = this._list[eventName].indexOf(callbackFunc);
            if (index !== -1) {
                this._list[eventName].splice(index, 1);
            }
        }
    },
    emit: function (eventName, args) {
        if (Array.isArray(this._list[eventName])) {
            this._list[eventName].forEach(callbackFunc => callbackFunc(args));
        }
    }
};

// common submodels functions
function _addItem (eventName) {
    return function (item) {
        this.list.push(item);
        pubsub.emit(eventName, { add: [ item ] });
    };
}
function _getItemById (id) {
    var index = this.list.findIndex((item) => {
        return item.id == id;
    });

    if (index == -1) {
        return null;
    } else {
        return this.list[index];
    }
}
function _setItem (fields, eventName) {
    return function (id, change) {
        var item = this.getItemById(id);
        if (item) {
            var changedApplied = false;
            for (var field of fields) {
                if (change[field]) {
                    item[field] = change[field];
                    changedApplied = true;
                }
            }

            if (changedApplied) {
                pubsub.emit(eventName, { edit: [ item ] });
            }

            return changedApplied;
        } else {
            return false;
        }
    };
}
function _removeItemById (eventName) {
    return function (id) {
        var index = this.list.findIndex((item) => {
            return item.id == id;
        });
    
        var removed;
        if (index != -1) {
            removed = this.list.splice(index, 1);
            pubsub.emit(eventName, { remove: removed });
        }
    };
}
function _removeItemsByPartnerId (eventName) {
    return function (partnerId) {
        var ocurrences = [];
        for (var i = this.list.length -1; i >= 0; i--) {
            if (this.list[i].partner == partnerId) {
                var removed = this.list.splice(i, 1);
                ocurrences.push(removed[0]);
            }
        }

        if (ocurrences.length > 0) {
            pubsub.emit(eventName, { remove: ocurrences });
        }
    }
}
function _nextNewItemId () {
    var id = 1;
    for (var item of this.list) {
        if (item.id >= id) {
            id = item.id + 1;
        }
    }
    return id;
}

// partner
function Partner () {
    this.blankItem = {
        id: null,
        name: ""
    };
    this.list = [
        { id: 1, name: "Baggio" },
        { id: 2, name: "Lamine Yamal" },
        { id: 3, name: "Ferran Torres" }
    ];
    this.getBlankItem = () => {
        return JSON.parse(JSON.stringify(this.blankItem));
    };
    this.addItem = _addItem("partners_change");
    this.getItemById = (id) => { return this._partnerIdMap[id] };
    this.setItem = _setItem(["name"], "partners_change");
    this.removeItemById = _removeItemById("partners_change");
    this.nextNewItemId = _nextNewItemId;

    // private
    this._getPartnerIdMap = () => {
        return this.list.reduce((partialResult, currentItem) => {
            partialResult[currentItem.id] = currentItem;
            return partialResult;
        }, {});
    };
    this._onPartnersListChange = (arg) => {
        if (arg.add !== undefined || arg.remove !== undefined) {
            this._partnerIdMap = this._getPartnerIdMap();
        }
    };

    this._partnerIdMap = this._getPartnerIdMap();
    pubsub.add("partners_change", this._onPartnersListChange);

    return {
        list: this.list,
        getBlankItem: this.getBlankItem,
        addItem: this.addItem,
        getItemById: this.getItemById,
        setItem: this.setItem,
        removeItemById: this.removeItemById,
        nextNewItemId: this.nextNewItemId
    };
}

// account receivable
function AR () {
    this.blankItem = {
        id: null,
        payId: null,
        partner: null,
        partnerName: "",
        type: "",
        amount: 0,
        expirationDate: "",
        cyclePaymentType: "",
        startDate: "",
        endDate: "",
        note: ""
    };
    this.list = [
        {
            id: 1,
            payId: null,
            partner: 1,
            type: "Multa",
            amount: 34.65,
            expirationDate: "2024-09-14",
            cyclePaymentType: null,
            startDate: null,
            endDate: null,
            note: "",
        },
        {
            id: 2,
            payId: null,
            partner: 2,
            type: "Conexión",
            amount: 15.33,
            expirationDate: "2024-10-14",
            cyclePaymentType: null,
            startDate: null,
            endDate: null,
            note: "lsdskl aslkdjas aslkd askl; as;dasd k;sa"
        }
    ];
    this.getBlankItem = () => {
        return JSON.parse(JSON.stringify(this.blankItem));
    };
    this.addItem = _addItem("ar_change");
    this.getItemById = _getItemById;
    this.setItem = _setItem(["partner", "type", "amount", "expirationDate", "cyclePaymentType", "startDate", "endDate", "note"], "ar_change");
    this.removeItemById = _removeItemById("ar_change");
    this.removeItemByPartnerId = _removeItemsByPartnerId("ar_change");
    this.nextNewItemId = _nextNewItemId;

    this.onPartnersListChange = function (evt) {
        if (evt.remove) {
            for (var item of evt.remove) {
                this.removeItemByPartnerId(item.id);
            }
        }
    };

    pubsub.add("partners_change", this.onPartnersListChange.bind(this));

    return {
        list: this.list,
        getBlankItem: this.getBlankItem,
        addItem: this.addItem,
        getItemById: this.getItemById,
        setItem: this.setItem,
        removeItemById: this.removeItemById,
        removeItemByPartnerId: this.removeItemByPartnerId,
        nextNewItemId: this.nextNewItemId
    };
}

// Model
function Mdl (pubsub) {
    this.pubsub = pubsub;
    this.partner = new Partner();
    this.ar = new AR();

    return {
        partner: this.partner,
        ar: this.ar,
        pubsub: this.pubsub
    }
}

var mdl = new Mdl(pubsub);

