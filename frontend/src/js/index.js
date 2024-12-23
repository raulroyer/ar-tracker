import { _centerPopup, confirmPopup, validateMoneyInput } from './common.js'
import { Mdl, pubsub } from './model.js'
import { ArPanel, ArPopup } from './ar.js'
import { PaymentsPanel, PaymentPopup } from './payments.js'
import { PartnersPanel } from './partners.js'

import {Export, Import, GetLastFile, ClearLastFile} from '../../wailsjs/go/main/App';

export var mdl = new Mdl(pubsub);

var arPopup = new ArPopup(mdl, document.querySelector("#ar-form-popup"));
var paymentPopup = new PaymentPopup(mdl, document.querySelector("#payment-form-popup"));

var arPanel = new ArPanel(
    mdl,
    document.querySelector("#ar-panel"),
    arPopup,
    paymentPopup
);
var paymentsPanel = new PaymentsPanel(
    mdl,
    document.querySelector("#payments-panel"),
    paymentPopup,
    arPopup
);

var partnersPanel = new PartnersPanel(mdl, document.querySelector("#partners-panel"));


document.querySelectorAll(".money-field").forEach(elm => {
    elm.addEventListener("input", validateMoneyInput);
});

// MENU NAVIGATION
var menuLinks = document.querySelectorAll("#menu li");
var currentPanel;

export function setOpenedPanel (key) {
    var selectedPanel = document.querySelector(`#${key}-panel`);
    if (selectedPanel == null) {
        console.log(`#${key}-panel not found`);
        return;
    }

    if (currentPanel) {
        currentPanel.removeAttribute("open");
    }
    selectedPanel.setAttribute("open", "");
    currentPanel = selectedPanel;

    menuLinks.forEach((li) => {
        if (li.dataset.section === key) {
            li.setAttribute("selected", true);
        } else {
            li.removeAttribute("selected");
        }
    });
}

function onMenuLinkClick (evt) {
    setOpenedPanel(evt.target.dataset.section);
}

menuLinks.forEach((li) => {
    li.addEventListener("click", onMenuLinkClick);
});

setOpenedPanel("partners");




// GUARDA ARCHIVO
function getNextTextChar (char) {
    var code = char.charCodeAt(0);
    code++;
    if (code < 65 || 122 < code) {
        code = 65;
    } else if (90 < code && code < 97) {
        code = 97;
    }

    return String.fromCharCode(code);
}

function clearProject () {
    for (var i = mdl.partner.list.length - 1; i >= 0; i--) {
        mdl.partner.removeItemById(mdl.partner.list[i].id);
    }
}

document.querySelector(".new-project-btn").addEventListener("click", () => {
    confirmPopup.open(
        `¿Seguro que deseas empezar un nuevo proyecto?`,
        (response) => {
            if (response === true) {
                clearProject();
                ClearLastFile();
                document.querySelector(".file-path").innerHTML = "";
            }
        },
        {
            overlay: true
        }
    );
});

document.querySelector(".save-file-btn").addEventListener("click", () => {
    var currentChar = "A";
    var fieldsAliasMap = {};

    var partner = mdl.partner.getBlankItem();
    for (var field in partner) {
        if (fieldsAliasMap[field] === undefined) {
            fieldsAliasMap[field] = currentChar;
            currentChar = getNextTextChar(currentChar);
        }
    }

    var ar = mdl.ar.getBlankItem();
    for (var field in ar) {
        if (fieldsAliasMap[field] === undefined) {
            fieldsAliasMap[field] = currentChar;
            currentChar = getNextTextChar(currentChar);
        }
    }

    var payment = mdl.payment.getBlankItem();
    for (var field in payment) {
        if (fieldsAliasMap[field] === undefined) {
            fieldsAliasMap[field] = currentChar;
            currentChar = getNextTextChar(currentChar);
        }
    }

    var partnersList = mdl.partner.list.map((partner) => {
        return {
            ...partner,
            paymentsTotal: 0,
            debtTotal: 0
        }
    });

    var output = {fmap:fieldsAliasMap, partners:[], ar:[], payments:[]};
    for (var list of [["partners", partnersList], ["ar", mdl.ar.list], ["payments", mdl.payment.list]]) {
        for (var item of list[1]) {
            var minifyItem = {};
            for (var field in item) {
                minifyItem[fieldsAliasMap[field]] = item[field];
            }
            output[list[0]].push(minifyItem);
        }
    }

    Export(JSON.stringify(output)).then(() => {
        GetLastFile().then((lastFile) => {
            document.querySelector(".file-path").innerHTML = lastFile;
        });
    }).catch(() => {

    });
});

var onImportSuccess = (content) => {
    var input = JSON.parse(content);
    var fmap = {};
    for (var field in input.fmap) {
        fmap[input.fmap[field]] = field;
    }

    clearProject();

    input.partners = input.partners.sort((a, b) => {
        return a[input.fmap["id"]] - b[input.fmap["id"]];
    });

    for (var partner of input.partners) {
        let aux = {};
        for (var field in partner) {
            aux[fmap[field]] = partner[field];
        }
        mdl.partner.addItem(aux);
    }

    input.ar = input.ar.sort((a, b) => {
        return a[input.fmap["id"]] - b[input.fmap["id"]];
    });
    for (var ar of input.ar) {
        let aux = {};
        for (var field in ar) {
            aux[fmap[field]] = ar[field];
        }
        aux.balance = aux.amount;
        mdl.ar.addItem(aux);
    }

    input.payments = input.payments.sort((a, b) => {
        return a[input.fmap["id"]] - b[input.fmap["id"]];
    });
    for (var payment of input.payments) {
        let aux = {};
        for (var field in payment) {
            aux[fmap[field]] = payment[field];
        }
        mdl.payment.addItem(aux);
    }

    GetLastFile().then((lastFile) => {
        document.querySelector(".file-path").innerHTML = lastFile;
    });
};

document.querySelector(".import-file-btn").addEventListener("click", () => {
    Import("").then(onImportSuccess).catch((err) => {
        console.log(err);
    });
});


GetLastFile().then((lastFile) => {
    if (lastFile) {
        Import(lastFile).then(onImportSuccess).catch((err) => {
            console.log(err);
        });
    }
}).catch(err => {
    console.log(err);
});