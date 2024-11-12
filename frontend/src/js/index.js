//  MODEL
var model = {};

// MENU NAVIGATION
var menuLinks = document.querySelectorAll("#menu li");
var currentPanel;

function setOpenedPanel (key) {
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

}

function onMenuLinkClick (evt) {
    setOpenedPanel(evt.target.dataset.section);

    menuLinks.forEach((li) => {
        li.removeAttribute("selected");
    });
    evt.target.setAttribute("selected", "");
}

menuLinks.forEach((li) => {
    li.addEventListener("click", onMenuLinkClick);
});


// POPUPS
var overlay = document.querySelector("#overlay");
var currentPopup;

function openFormPopup (popup) {
    overlay.style.display = "block";

    popup.style.display = "block";
    popup.style.visibility = "visible";

    currentPopup = popup;
}
function closeFormPopup () {
    if (currentPopup) {
        overlay.style.display = "none";

        currentPopup.style.display = "none";
        // popup.getBoundingClientRect() hack
        currentPopup.style.visibility = "hidden";

        currentPopup = undefined;
    }
}

overlay.addEventListener("click", closeFormPopup);
document.querySelectorAll(".popup .close-btn").forEach((node) => {
    node.addEventListener("click", closeFormPopup);
});

//POPUP COMMON
function _centerPopup () {
    // popup.getBoundingClientRect() hack
    this.popup.style.visibility = "hidden";
    this.popup.style.display = "block";

    this.popup.style.right = `${(window.innerWidth - this.popup.getBoundingClientRect().width)/2}px`;
    this.popup.style.top = `${window.scrollY + 10}px`;  
}
function _locateALongside (elm) {
    // popup.getBoundingClientRect() hack
    this.popup.style.visibility = "hidden";
    this.popup.style.display = "block";

    var viewportDistBelowTarget = window.innerHeight - elm.getBoundingClientRect().bottom;
    if (viewportDistBelowTarget > this.popup.getBoundingClientRect().height) {
        confirmationPopup.style.top = `${window.scrollY + elm.getBoundingClientRect().bottom + 5}px`;
    } else {
        confirmationPopup.style.top = `${window.scrollY + elm.getBoundingClientRect().top - this.popup.getBoundingClientRect().height - 5}px`;
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

    this.onOkBtnClick = () => {
        this.callbackFunc(true);
        closeFormPopup();
    };
    this.onDiscardBtnClick = () => {
        this.callbackFunc(false);
        closeFormPopup();
    };
    this.open = (msg, callbackFunc, alongsideElm) => {
        this.callbackFunc = callbackFunc;
        this.msgNode.innerHTML = msg;
        if (alongsideElm) {
            this.locateAlongside(alongsideElm);
        } else {
            this.center();
        }
        // console.log(this);
        openFormPopup(this.popup);
    };
    this.center = _centerPopup;
    this.locateAlongside = _locateALongside;

    this.okBtn.addEventListener("click", this.onOkBtnClick);
    this.discardBtn.addEventListener("click", this.onDiscardBtnClick);

    return {
        open: this.open
    }
}
var confirmPopup = new ConfirmationPopup(document.querySelector("#confirmation-popup"));

var confirmationPopup = document.querySelector("#confirmation-popup");
var confirmPopupMessageNode = confirmationPopup.querySelector(".confirm-message");
var confirmPopupOkBtn = confirmationPopup.querySelector(".confirm-btn");
var confirmPopupDiscardBtn = confirmationPopup.querySelector(".discard-btn");
var confirmPopupResolveCallback;

function onConfirm () {
    confirmPopupResolveCallback(true);
    closeFormPopup();
}
function onDiscard () {
    confirmPopupResolveCallback(false);
    closeFormPopup();
}

function openConfirmPopup (message, resolveCallbackFunc) {
    confirmPopupOkBtn.removeEventListener("click", onConfirm);
    confirmPopupDiscardBtn.removeEventListener("click", onDiscard);

    confirmPopupOkBtn.addEventListener("click", onConfirm);
    confirmPopupDiscardBtn.addEventListener("click", onDiscard);

    confirmPopupResolveCallback = resolveCallbackFunc;

    confirmPopupMessageNode.innerHTML = message;
    openFormPopup(confirmationPopup);
}



// TABLE
function clearTable (table) {
    var tbody = table.querySelector("tbody");
    while(tbody.hasChildNodes()) {
        tbody.removeChild(tbody.firstChild);
    }
}

// INPUT
// DECIMAL FILTER
var validateMoneyInput = function(e) {  
    var t = e.value;
    t = t.replace(/[^0-9\.\-]+/g, "");
    e.value = t.indexOf(".") >= 0 ? t.slice(0, t.indexOf(".") + 3) : t;
}
