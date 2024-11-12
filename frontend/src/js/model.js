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
        pubsub.emit(eventName, { add: item });
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
function _removeItemById (eventName) {
    return function (id) {
        var index = this.list.findIndex((item) => {
            return item.id == id;
        });
    
        var removed;
        if (index != -1) {
            removed = this.list.splice(index, 1);
            pubsub.emit(eventName, { remove: removed[0] });
        }
    };
}
function _removeItemsByPartnerId (eventName) {
    return function (partnerId) {
        var ocurrences = [];
        for (var i = this.list.length -1; i >= 0; i--) {
            if (this.list[i].partner == partnerId) {
                var removed = this.list.splice(i, 1);
                ocurrences.push(removed);
            }
        }

        if (ocurrences.length > 0) {
            pubsub.emit(eventName, ocurrences);
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
    this.currentItem = { id: null, name: "" };
    this.list = [
        { id: 1, name: "Baggio" },
        { id: 2, name: "Lamine Yamal" },
        { id: 3, name: "Ferran Torres" }
    ];
    this.addItem = _addItem("partners_change");
    this.getItemById = (id) => { return this._partnerIdMap[id] };
    this.removeItemById = _removeItemById("partners_change");
    this.nextNewItemId = _nextNewItemId;

    // private
    this._getPartnerIdMap = function () {
        return this.list.reduce((partialResult, currentItem) => {
            partialResult[currentItem.id] = currentItem;
            return partialResult;
        }, {});
    };
    this._onPartnersListChange = function () {
        // refresh id map
        this._partnerIdMap = this._getPartnerIdMap();
    };

    this._partnerIdMap = this._getPartnerIdMap();
    pubsub.add("partners_change", (arg) => {
        if (arg.add !== undefined || arg.remove !== undefined) {
            this._partnerIdMap = this._getPartnerIdMap();
        }
    });

    return {
        currentItem: this.currentItem,
        list: this.list,
        addItem: this.addItem,
        getItemById: this.getItemById,
        removeItemById: this.removeItemById,
        nextNewItemId: this.nextNewItemId
    };
}

// account receivable
function AR () {
    this.currentItem = {
        id: null,
        category: null,
        payId: null,
        partner: null,
        partnerName: "",
        type: null,
        paymentMethod: null,
        amount: null,
        date: null,
        note: ""
    },
    this.list = [
        {
            id: 1,
            category: "ar",
            payId: null,
            partner: 1,
            type: "Multa",
            paymentMethod: null,
            amount: 34.65,
            date: "2024-09-14",
            note: "",
        },
        {
            id: 2,
            category: "ar",
            payId: null,
            partner: 2,
            type: "Conexión",
            paymentMethod: null,
            amount: 15.33,
            date: "2024-10-14",
            note: "lsdskl aslkdjas aslkd askl; as;dasd k;sa"
        }
    ],
    this.addItem = function (item) {
        this.list.push(item);

        // refresh id map
        this._partnerIdMap = this._getPartnerIdMap();
        pubsub.emit("partners_change", { add: item });
    },
    this.getItemById = _getItemById,
    this.removeItemById = _removeItemById("removePartner"),
    this.nextNewItemId = _nextNewItemId,

    // private
    this._getPartnerIdMap = function () {
        return this.list.reduce((partialResult, currentItem) => {
            partialResult[currentItem.id] = currentItem;
            return partialResult;
        }, {});
    }
    this._partnerIdMap = this._getPartnerIdMap();

    return {
        currentItem: this.currentItem,
        list: this.list,
        addItem: this.addItem,
        getItemById: this.getItemById,
        removeItemById: this.removeItemById,
        nextNewItemId: this.nextNewItemId
    };
}

// Model
function Mdl () {
    this.partner = Partner();

    this.ar = {
        currentItem: {
            id: null,
            category: null,
            payId: null,
            partner: null,
            partnerName: "",
            type: null,
            paymentMethod: null,
            amount: null,
            date: null,
            note: ""
        },
        list: [
            {
                id: 1,
                category: "ar",
                payId: null,
                partner: 1,
                type: "Multa",
                paymentMethod: null,
                amount: 34.65,
                date: "2024-09-14",
                note: "",
            },
            {
                id: 2,
                category: "ar",
                payId: null,
                partner: 2,
                type: "Conexión",
                paymentMethod: null,
                amount: 15.33,
                date: "2024-10-14",
                note: "lsdskl aslkdjas aslkd askl; as;dasd k;sa"
            }
        ],
        getItemById: _getItemById,
        removeItemById: _removeItemById("removeAR"),
        removeItemByPartnerId: _removeItemsByPartnerId("removeAR"),
        nextNewItemId: _nextNewItemId
    };

    return {
        partner: partner,
        ar: ar,
        pubsub: pubsub
    }
}

var mdl = Mdl();

