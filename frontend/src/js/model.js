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
                if (typeof change[field] !== "undefined") {
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
function _removeItemsByArId (eventName) {
    return function (arId) {
        var ocurrences = [];
        for (var i = this.list.length -1; i >= 0; i--) {
            if (this.list[i].arId == arId) {
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

// PARTNERS MODEL
function Partner (mdl) {
    this.blankItem = {
        id: null,
        name: "",
        paymentsTotal: 0,
        debtTotal: 0,
        note: ""
    };
    this.list = [
        { id: 1, name: "Baggio", paymentsTotal: 0, debtTotal: 0, note: "" },
        { id: 2, name: "Lamine Yamal", paymentsTotal: 0, debtTotal: 0, note: "" },
        { id: 3, name: "Ferran Torres", paymentsTotal: 0, debtTotal: 0, note: "" }
    ];
    this.getBlankItem = () => {
        return JSON.parse(JSON.stringify(this.blankItem));
    };
    this.addItem = _addItem("partners_change");
    this.getItemById = (id) => { return this._partnerIdMap[id] };
    this.setItem = _setItem(["name", "paymentsTotal", "debtTotal", "note"], "partners_change");
    this.removeItemByIdBase = _removeItemById("partners_change");
    this.removeItemById = (partnerId) => {
        mdl.ar.removeItemByPartnerId(partnerId);
        this.removeItemByIdBase(partnerId);
    };
    this.nextNewItemId = _nextNewItemId;

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
    this._onArListChange = (arg) => {
        if (arg.add) {
            for (var ar of arg.add) {
                var partner = this.getItemById(ar.partner);

                var newDetbTotal = partner.debtTotal + mdl.ar.calcArAccAmount(ar);
                newDetbTotal = parseFloat(newDetbTotal.toFixed(2));

                this.setItem(partner.id, { debtTotal: newDetbTotal });
            }
        }
        if (arg.remove) {
            for (var ar of arg.remove) {
                var partner = this.getItemById(ar.partner);

                var newDetbTotal = partner.debtTotal - mdl.ar.calcArAccAmount(ar);
                newDetbTotal = parseFloat(newDetbTotal.toFixed(2));

                this.setItem(partner.id, { debtTotal: newDetbTotal});
            }
        }
    };
    this._onPaymentsListChange = (arg) => {
        if (arg.add) {
            for (var payment of arg.add) {
                var ar = mdl.ar.getItemById(payment.arId);
                var partner = this.getItemById(ar.partner);

                var newPamentsTotal = partner.paymentsTotal + payment.amount;
                newPamentsTotal = parseFloat(newPamentsTotal.toFixed(2));

                this.setItem(partner.id, { paymentsTotal: newPamentsTotal });
            }
        }
        if (arg.remove) {
            for (var payment of arg.remove) {
                var arItem = mdl.ar.getItemById(payment.arId);
                if (arItem) {
                    var partner = this.getItemById(arItem.partner);
                    // if (partner)  ???
                    var newPamentsTotal = partner.paymentsTotal - payment.amount;
                    newPamentsTotal = parseFloat(newPamentsTotal.toFixed(2));

                    this.setItem(partner.id, { paymentsTotal: newPamentsTotal});
                }
            }
        }
    };

    this._partnerIdMap = this._getPartnerIdMap();
    pubsub.add("partners_change", this._onPartnersListChange);
    pubsub.add("ar_change", this._onArListChange);
    pubsub.add("payments_change", this._onPaymentsListChange);

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

// ACCOUNT RECEIVABLES MODEL
function AR (mdl) {
    this.blankItem = {
        id: null,
        partner: null,
        partnerName: "",
        type: "",
        amount: 0,
        balance: 0,
        expirationDate: "",
        cycleAmount: 0,
        cyclePaymentType: "",
        startDate: "",
        endDate: "",
        note: ""
    };
    this.list = [
        // {
        //     id: 1,
        //     partner: 1,
        //     type: "Multa",
        //     amount: 34.65,
        //     balance: 34.65,
        //     expirationDate: "2024-09-14",
        //     cycleAmount: 34.65,
        //     cyclePaymentType: null,
        //     startDate: null,
        //     endDate: null,
        //     note: "",
        // },
        // {
        //     id: 2,
        //     partner: 2,
        //     type: "Conexión",
        //     amount: 15.33,
        //     balance: 15.33,
        //     expirationDate: "2024-10-14",
        //     cycleAmount: 15.33,
        //     cyclePaymentType: null,
        //     startDate: null,
        //     endDate: null,
        //     note: "lsdskl aslkdjas aslkd askl; as;dasd k;sa"
        // }
    ];
    this.getBlankItem = () => {
        return JSON.parse(JSON.stringify(this.blankItem));
    };
    this.addItemBase = _addItem("ar_change");
    this.addItem = (item) => {
        if (item.type === "Mensualidad") {
            var monthDiff = calcMonthDiff(YYYYMMDDToDate(item.startDate), new Date());
            if (item.cyclePaymentType === "cycle-start") {
                monthDiff++;
            }
            item.balance = monthDiff * item.cycleAmount;
            item.amount = item.balance;
        } else {
            item.balance = item.amount;
            item.cycleAmount = 0;
        }
        this.addItemBase(item);
    };
    this.getItemById = _getItemById;
    this.setItemBase = _setItem(["partner", "type", "amount", "balance", "expirationDate", "cycleAmount", "cyclePaymentType", "startDate", "endDate", "note"], "ar_change");
    this.setItem = (id, change) => {
        if (change.type === "Mensualidad") {
            change.amount = this.calcArAccAmount({change});
            change.balance = change.amount - this.calcArPaymentsTotal(id);
        }
        this.setItemBase(id, change);
    };
    this.removeItemByIdBase = _removeItemById("ar_change");
    this.removeItemById = (id) => {
        mdl.payment.removeItemByArId(id);
        this.removeItemByIdBase(id);
    };
    this.removeItemByPartnerId = (partnerId) => {
        var ocurrences = [];
        for (var i = this.list.length -1; i >= 0; i--) {
            if (this.list[i].partner == partnerId) {
                mdl.payment.removeItemByArId(this.list[i].id);
                var removed = this.list.splice(i, 1);
                ocurrences.push(removed[0]);
            }
        }

        if (ocurrences.length > 0) {
            pubsub.emit("ar_change", { remove: ocurrences });
        }
    };
    this.nextNewItemId = _nextNewItemId;
    this.calcArAccAmount = (item) => {
        if (item.type === "Mensualidad") {
            var monthDiff = calcMonthDiff(YYYYMMDDToDate(item.startDate), new Date());
            if (item.cyclePaymentType === "cycle-start") {
                monthDiff++;
            }
            return monthDiff * item.cycleAmount;
        }

        return item.amount;
    };
    this.calcArPaymentsTotal = (arId) => {
        var total = 0;
        mdl.payment.getItemsByArId(arId).forEach((payment) => {
            total += payment.amount;
        });
        return total;
    };
    this.calcArState = (item) => {
        if (item.balance == 0) {
            return "paid";
        }

        var expirationDate;
        if (item.type === "Mensualidad") {
            expirationDate = YYYYMMDDToDate(item.startDate);
            // if (item.cyclePaymentType === "cycle-start") {
            //     expirationDate.setMonth(expirationDate.getMonth() + 1);
            // }
        } else {
            expirationDate = YYYYMMDDToDate(item.expirationDate);
        }

        var expDate = nextDate(expirationDate);
        if (expDate.getTime() < (Date.now())) {
            return "expired";
        }
        return "pending";
    };
    this.onPaymentsListChange = function (evt) {
        if (evt.add) {
            for (var payment of evt.add) {
                var arItem = this.getItemById(payment.arId);
                var newBalance = arItem.balance - payment.amount;
                newBalance = parseFloat(newBalance.toFixed(2));
                this.setItem(payment.arId, { balance: newBalance});
            }
        }
        if (evt.remove) {
            for (var payment of evt.remove) {
                var arItem = this.getItemById(payment.arId);
                // si es null es porque no existe entonces no hay nada que recalcular
                // esto seguramente ocurre porque cuando se borra una ar, posteriormente
                // se borrarán los pagos asociados, esto a su vez ejecutara este evento,
                // pero ya no es necesario, ni se puede volver a setear
                if (arItem) {
                    var newBalance = arItem.balance + payment.amount;
                    newBalance = parseFloat(newBalance.toFixed(2));
                    this.setItem(arItem.id, { balance: newBalance});
                }
            }
        }
    };

    pubsub.add("payments_change", this.onPaymentsListChange.bind(this));

    return {
        list: this.list,
        getBlankItem: this.getBlankItem,
        addItem: this.addItem,
        getItemById: this.getItemById,
        setItem: this.setItem,
        removeItemById: this.removeItemById,
        removeItemByPartnerId: this.removeItemByPartnerId,
        nextNewItemId: this.nextNewItemId,
        calcArState: this.calcArState,
        calcArAccAmount: this.calcArAccAmount
    };
}

// PAYMENTS MODEL
function Payment (mdl) {
    this.blankItem = {
        id: null,
        arId: "",
        amount: 0,
        date: "",
        note: ""
    };
    this.list = [
        // {
        //     id: 1,
        //     arId: 2,
        //     amount: 10.00,
        //     date: "2024-10-14",
        //     note: ""
        // },
        // {
        //     id: 2,
        //     arId: 1,
        //     amount: 10.00,
        //     date: "2024-11-15",
        //     note: ""
        // }
    ];
    this.getBlankItem = () => {
        return JSON.parse(JSON.stringify(this.blankItem));
    };
    this.addItem = _addItem("payments_change");
    this.getItemById = _getItemById;
    this.getItemsByArId = (arId) => {
        return this.list.filter((payment) => {
            return payment.arId == arId;
        });
    };
    this.setItem = _setItem(["arId", "amount", "date", "note"], "payments_change");
    this.removeItemById = _removeItemById("payments_change");
    this.removeItemByArId = _removeItemsByArId("payments_change");
    this.nextNewItemId = _nextNewItemId;

    return {
        list: this.list,
        getBlankItem: this.getBlankItem,
        addItem: this.addItem,
        getItemById: this.getItemById,
        setItem: this.setItem,
        removeItemById: this.removeItemById,
        removeItemByArId: this.removeItemByArId,
        nextNewItemId: this.nextNewItemId
    };
}


// MODEL
function Mdl (pubsub) {
    this.pubsub = pubsub;
    this.partner = new Partner(this);
    this.ar = new AR(this);
    this.payment = new Payment(this);

    return {
        partner: this.partner,
        ar: this.ar,
        payment: this.payment,
        pubsub: this.pubsub
    }
}
