//POPUP COMMON
function _centerPopup () {
    // popup.getBoundingClientRect() hack
    this.popup.style.visibility = "hidden";
    this.popup.style.display = "block";

    this.popup.style.left = `${(window.innerWidth - this.popup.getBoundingClientRect().width)/2}px`;
    this.popup.style.top = `${window.scrollY + 10}px`;  
}
function _locateALongside (elm) {
    // popup.getBoundingClientRect() hack
    this.popup.style.visibility = "hidden";
    this.popup.style.display = "block";

    var viewportDistBelowTarget = window.innerHeight - elm.getBoundingClientRect().bottom;
    if (viewportDistBelowTarget > this.popup.getBoundingClientRect().height) {
        this.popup.style.top = `${window.scrollY + elm.getBoundingClientRect().bottom + 5}px`;
    } else {
        this.popup.style.top = `${window.scrollY + elm.getBoundingClientRect().top - this.popup.getBoundingClientRect().height - 5}px`;
    }
    this.popup.style.right = `${window.innerWidth - elm.getBoundingClientRect().right}px`;
}

// CONFIRMATION POPUP
function ConfirmationPopup (popupElm) {
    this.popup = popupElm;
    this.msgNode = this.popup.querySelector(".confirm-message");
    this.okBtn = this.popup.querySelector(".confirm-btn");
    this.discardBtn = this.popup.querySelector(".discard-btn");
    this.callbackFunc;
    this.overlayElm = document.createElement("div");

    this.onOkBtnClick = () => {
        this.callbackFunc(true);
        this.close();
    };
    this.onDiscardBtnClick = () => {
        this.callbackFunc(false);
        this.close();
    };
    this.onOverlayClick = () => {
        this.callbackFunc(false);
        this.close();
    };
    this.close = () => {
        this.overlayElm.remove();
        this.popup.style.visibility = "hidden";
    };
    this.open = (msg, callbackFunc, config) => {
        this.callbackFunc = callbackFunc;
        this.msgNode.innerHTML = msg;

        if (config.alongsideElm) {
            this.locateAlongside(config.alongsideElm);
        } else {
            this.center();
        }

        this.popup.parentElement.append(this.popup);

        if (config.overlay === true) {
            this.popup.before(this.overlayElm);
            this.overlayElm.style.display = "block";
        }

        this.popup.style.visibility = "visible";
    };
    this.center = _centerPopup;
    this.locateAlongside = _locateALongside;

    this.overlayElm.classList.add("overlay");
    this.overlayElm.addEventListener("click", this.onOverlayClick);
    this.okBtn.addEventListener("click", this.onOkBtnClick);
    this.discardBtn.addEventListener("click", this.onDiscardBtnClick);

    return {
        open: this.open
    }
}
var confirmPopup = new ConfirmationPopup(document.querySelector("#confirmation-popup"));

// alert POPUP
function AlertPopup (popupElm) {
    this.popup = popupElm;
    this.msgNode = this.popup.querySelector(".alert-message");
    this.discardBtn = this.popup.querySelector(".discard-btn");
    this.overlayElm = document.createElement("div");

    this.onDiscardBtnClick = () => {
        this.close();
    };
    this.onOverlayClick = () => {
        this.close();
    };
    this.close = () => {
        this.overlayElm.remove();
        this.popup.style.visibility = "hidden";
    };
    this.open = (msg, config) => {
        this.msgNode.innerHTML = msg;

        if (config.alongsideElm) {
            this.locateAlongside(config.alongsideElm);
        } else {
            this.center();
        }

        this.popup.parentElement.append(this.popup);

        if (config.overlay === true) {
            this.popup.before(this.overlayElm);
            this.overlayElm.style.display = "block";
        }

        this.popup.style.visibility = "visible";
    };
    this.center = _centerPopup;
    this.locateAlongside = _locateALongside;

    this.overlayElm.classList.add("overlay");
    this.overlayElm.addEventListener("click", this.onOverlayClick);
    this.discardBtn.addEventListener("click", this.onDiscardBtnClick);

    return {
        open: this.open
    }
}
var alertPopup = new AlertPopup(document.querySelector("#alert-popup"));


// TABLE COMMON
function _clearTable (table) {
    var tbody = table.querySelector("tbody");
    while(tbody.hasChildNodes()) {
        tbody.removeChild(tbody.firstChild);
    }
}
function _filterTable () {
    var filterText = this.filterInput.value.trim().toLowerCase();
    this.table.querySelectorAll("tbody tr").forEach((tr) => {
        if (tr.textContent.toLowerCase().includes(filterText)) {
            tr.style.display = "table-row";
        } else {
            tr.style.display = "none";
        }
    });
}

// INPUT
// DECIMAL FILTER
var validateMoneyInput = function(e) {  
    var t = e.value;
    t = t.replace(/[^0-9\.\-]+/g, "");
    e.value = t.indexOf(".") >= 0 ? t.slice(0, t.indexOf(".") + 3) : t;
}

// VALIDATION
var positiveTwoDecimalAmountRegexp = new RegExp('^[0-9]+.[0-9]{2}$');

// DATE FORMAT
function dateToYYYYMMDD (date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
function YYYYMMDDToDate (dateString) {
    var dateSegments = dateString.split("-");
    var date = new Date(
        parseInt(dateSegments[0]),
        parseInt(dateSegments[1]) - 1,
        parseInt(dateSegments[2])
    );
    return date;
}
function nextDate (date) {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
    );
}