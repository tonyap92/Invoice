// import WorkItemVO from '/js/model/WorkItemVO';
// import InvoiceVO from '/js/model/InvoiceVO';


// CONST
const LOCAL_KEY_INVOICE = "listInvoice";

const domPopup = document.getElementById("popap");
const domForm = document.getElementById("form");
const domPopupBG = document.getElementById("popapBg");

const domNumberInvoice = document.getElementById("numberInvoice");

const domItemWorkPopup = document.getElementById("itemWorkPopap");
const domItemDescPopup = document.getElementById("itemDescPopap");
const domInputQtyPopup = document.getElementById("inputQtyPopap");
const domInputCostPopup = document.getElementById("inputCostPopap");
const domInputTotalPopup = document.getElementById("inputTotalPopap");

const domBtnOpenPopup = document.getElementById("btnOpenPopap");
const domBtnClosePopup = document.getElementById("btnClosePopap");
const domBtnAddItem = document.getElementById("addItemButton");

const domIbanInvoice = document.getElementById("cardInvoice");

const domMainInputDiscount = document.getElementById("mainInputDiscount");

const mainSubtotal = document.getElementById("mainSubtotal");
const mainDiscount = document.getElementById("mainDiscount");
const mainTotal = document.getElementById("mainTotal");

const domTitlePopup = document.getElementById("titlePopap");
const domBtnDeleteItem = document.getElementById("btnDeleteItem");
const domTableInvoice = document.getElementById("tableInvoice");

let selectedWorkItemVO = null;
let invoiceVO = new InvoiceVO();
initializeInvoice();

// LISTENERS
domBtnOpenPopup.addEventListener("click", onButtonOpenPopupClick);
domBtnClosePopup.addEventListener("click", checkingForEditingBeforeClose);
domPopupBG.addEventListener("click", checkingForEditingBeforeClose);
domBtnAddItem.addEventListener("click", validationOfFields);

document.addEventListener("click", (e) => {
    const editItemInvoiceButton = e.target.closest(".btnEditItem");
    const deleteItemInvoiceButton = e.target.closest("#btnDeleteItem");

    if (editItemInvoiceButton) {
        const id = editItemInvoiceButton.getAttribute("listInvoice-id");
        loadItemInvoice(invoiceVO.items.find((item) => item.id === id));
    }

    if (deleteItemInvoiceButton && selectedWorkItemVO) {
        deleteItemInvoiceById(selectedWorkItemVO.id);
    }
});

[domInputQtyPopup, domInputCostPopup].forEach(function(input) {
    input.onkeyup = onValueTotalPopup;
});

[
    domNumberInvoice,
    domMainInputDiscount,
    domInputQtyPopup,
    domInputCostPopup,
].forEach(function(input) {
    input.onkeydown = onInputValidationNumber;
});

[domMainInputDiscount].forEach(function(input) {
    input.onkeyup = onDiscountTotalResultTotalsInvoice;
});

[
    domInputQtyPopup,
    domInputCostPopup,
    domItemWorkPopup,
    domItemDescPopup,
].forEach((input) => {
    input.addEventListener("keyup", () => {
        const checkingWithValueLocalStorage =
            domInputQtyPopup.value == selectedWorkItemVO?.qty &&
            domInputCostPopup.value == selectedWorkItemVO.cost &&
            domItemWorkPopup.value == selectedWorkItemVO.title &&
            domItemDescPopup.value == selectedWorkItemVO.description;


        const checkingInputsValue =
            domInputQtyPopup.value === "" ||
            domInputCostPopup.value === "" ||
            domItemWorkPopup.value === "";

        if (checkingWithValueLocalStorage || checkingInputsValue) {
            console.log("domInputQtyPopup - value", domInputQtyPopup.value);
            domBtnAddItem.disabled = true;
            return;
        }

        domBtnAddItem.disabled = false;
    });
});

domNumberInvoice.addEventListener("keyup", () => {
    invoiceVO.id = domNumberInvoice.value;
    saveInLocalStageInvoice();
});
domIbanInvoice.addEventListener("keyup", () => {
    cardValidationNumber();
    invoiceVO.iban = domIbanInvoice.value;
    saveInLocalStageInvoice();
});
domMainInputDiscount.addEventListener("keyup", () => {
    invoiceVO.discount = domMainInputDiscount.value;
    saveInLocalStageInvoice();
});

// FUNCTIONS
function onButtonOpenPopupClick() {
    domPopup.style.display = "block";

    if (selectedWorkItemVO == null) {
        domBtnDeleteItem.disabled = true;
        domBtnAddItem.disabled = true;
        domBtnAddItem.innerText = "Create";
        domTitlePopup.innerText = "Add";
    }

    console.log("selectedInvoice when open popup", selectedWorkItemVO);
}

function closeWorkItemPopup() {
    domPopup.style.display = "none";
    domForm.reset();
    saveInLocalStageInvoice();
    selectedWorkItemVO = null;
}

function validationOfFields(e) {
    e.preventDefault();

    if (
        domInputQtyPopup.value === "" ||
        domInputCostPopup.value === "" ||
        domItemWorkPopup.value === ""
    ) {
        return;
    }

    if (selectedWorkItemVO) {
        selectedWorkItemVO.title = domItemWorkPopup.value;
        selectedWorkItemVO.description = domItemDescPopup.value;
        selectedWorkItemVO.cost = domInputCostPopup.value;
        selectedWorkItemVO.qty = domInputQtyPopup.value;
        renderInvoice();
        closeWorkItemPopup();
        selectedWorkItemVO = null;
    } else {
        const workItemVO = new WorkItemVO({
            id: Date.now().toString(),
            title: domItemWorkPopup.value,
            description: domItemDescPopup.value,
            cost: parseInt(domInputCostPopup.value),
            qty: parseInt(domInputQtyPopup.value),
        });
        invoiceVO.items.push(workItemVO);
        console.log("> addWorkItem: invoiceVO.items =", invoiceVO.items);
        renderInvoice();
        closeWorkItemPopup();
    }
}

function onInputValidationNumber(event) {
    if ("0123456789\b".indexOf(String.fromCharCode(event.keyCode)) == -1) {
        alert("Вводить можно только числа!");
        return false;
    }
    return true;
}

function cardValidationNumber() {
    let cardCode = domIbanInvoice.value.replace(/[^\w]/g, "");
    cardCode = cardCode !== "" ? cardCode.match(/.{1,4}/g).join(" ") : "";
    domIbanInvoice.value = cardCode.toUpperCase();
}

function onValueTotalPopup() {
    if (!domInputCostPopup.value) {
        domInputTotalPopup.value = 0;
    } else {
        domInputTotalPopup.value = domInputQtyPopup.value * domInputCostPopup.value;
    }
}

function checkingForEditingBeforeClose(e) {
    e.preventDefault();

    const isEdited =
        domInputQtyPopup.value != selectedWorkItemVO?.qty ||
        domInputCostPopup.value != selectedWorkItemVO.cost ||
        domItemWorkPopup.value != selectedWorkItemVO.title ||
        domItemDescPopup.value != selectedWorkItemVO.description;

    if (isEdited && !confirm("Выйти без сохранения?")) {
        return;
    }

    closeWorkItemPopup();
}

function renderInvoice() {
    clearHTMLInvoice();

    invoiceVO.items.forEach((workItemVO) => {
        domTableInvoice.innerHTML += `<div class='py-1 border-b-1 border-solid border-gray-200 hover:bg-gray-100 btnEditItem' listInvoice-id='${workItemVO.id}' id='${workItemVO.id}'>
        <div class='grid grid-col-4 font-normal'>
            <div class='pr-8'>
                <div>${workItemVO.title}</div>
                <div class='text-gray-888'>${workItemVO.description}</div>
            </div>
            <div>${workItemVO.cost}</div>
            <div>${workItemVO.qty}</div>
            <div class='text-right'>${workItemVO.total}</div>
        </div>
    </div>`;
    });

    sumResultTotalsInvoice();
    onDiscountTotalResultTotalsInvoice();
}

function sumResultTotalsInvoice() {
    mainSubtotal.innerHTML = invoiceVO.items
        .map((workItemVO) => workItemVO.total)
        .reduce((prev, curr) => prev + curr, 0)
        .toString();
}

function onDiscountTotalResultTotalsInvoice() {
    mainDiscount.innerHTML = Math.floor(
        (mainSubtotal.innerHTML * domMainInputDiscount.value) / 100
    );

    mainTotal.innerHTML = mainSubtotal.textContent - mainDiscount.innerHTML;
}

function loadItemInvoice(workItemVO) {
    onButtonOpenPopupClick();

    selectedWorkItemVO = workItemVO;

    domItemWorkPopup.value = workItemVO.title;
    domItemDescPopup.value = workItemVO.description;
    domInputCostPopup.value = workItemVO.cost;
    domInputQtyPopup.value = workItemVO.qty;
    domInputTotalPopup.value = workItemVO.total;

    domBtnDeleteItem.disabled = false;
    domBtnAddItem.innerText = "Save";
    domTitlePopup.innerText = "Update";
}

function deleteItemInvoiceById(id) {
    if (confirm("Удалить элемент?")) {
        invoiceVO.items = invoiceVO.items.filter((vo) => vo.id !== id);
        renderInvoice();
        closeWorkItemPopup();
        alert("Элемент удален!");
    } else {
        alert("Операция прервана");
    }
}

function clearHTMLInvoice() {
    const domTableInvoice = document.getElementById("tableInvoice");
    while (domTableInvoice.firstChild) {
        domTableInvoice.removeChild(domTableInvoice.firstChild);
    }
}

function saveInLocalStageInvoice() {
    localStorage.setItem(LOCAL_KEY_INVOICE, JSON.stringify(invoiceVO));
}

function initializeInvoice() {
    const invoiceRawData = localStorage.getItem(LOCAL_KEY_INVOICE);

    console.log("invoiceRawData", invoiceRawData);

    if (!!invoiceRawData) {
        invoiceVO = JSON.parse(invoiceRawData);
        invoiceVO.items = invoiceVO.items.map((raw) => new WorkItemVO(raw));
    }

    console.log("invoiceVO", invoiceVO);
    domNumberInvoice.value = invoiceVO.id;
    domMainInputDiscount.value = invoiceVO.discount;
    domIbanInvoice.value = invoiceVO.iban;
    renderInvoice();
}