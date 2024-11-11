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
    // popup.getBoundingClientRect() hack
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

// CONFIRMATION POPUP
var confirmationPopup = document.querySelector("#confirmation-popup");
var confirmPopupMessageNode = confirmationPopup.querySelector(".confirm-message");
var confirmPopupOkBtn = confirmationPopup.querySelector(".confirm-btn");
var confirmPopupDiscardBtn = confirmationPopup.querySelector(".discard-btn");
var confirmPopupResolveCallback;

function openConfirmPopup (message, resolveCallbackFunc) {
    confirmPopupResolveCallback = resolveCallbackFunc;

    confirmPopupMessageNode.innerHTML = message;
    openFormPopup(confirmationPopup);
}

confirmPopupOkBtn.addEventListener("click", () => {
    confirmPopupResolveCallback(true);
    closeFormPopup();
});
confirmPopupDiscardBtn.addEventListener("click", () => {
    confirmPopupResolveCallback(false);
    closeFormPopup();
});

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
