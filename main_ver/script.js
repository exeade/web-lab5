const xElement = document.querySelector("#x");
const yElement = document.querySelector("#y");

const xText = xElement.textContent;
const yText = yElement.textContent;

xElement.textContent = yText;
yElement.textContent = xText;

const a = 21;
const b = 13;
const h = 7;

function calculateTrapezoidArea() {
    return ((a + b) * h) / 2;
}

const result = calculateTrapezoidArea();
const thirdBlock = document.querySelector(".brew-tips");

thirdBlock.innerHTML += `<p>The area of the trapezoid is: ${result} square units.</p>`;
thirdBlock.innerHTML += `<p>Base 1 (a): ${a}, Base 2 (b): ${b}, Height (h): ${h}</p>`;


function reverseNumber(num) {
    return num.toString().split('').reverse().join('');
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null;
}

function addNumberPair(original, reversed) {
    const existingData = getCookie("numberPairs");
    let pairs = existingData ? JSON.parse(existingData) : [];
    pairs.push({ original, reversed });
    setCookie("numberPairs", JSON.stringify(pairs), 7);
}

function displayCookies() {
    const existingData = getCookie("numberPairs");
    if (existingData) {
        const pairs = JSON.parse(existingData);
        let message = "Saved pairs:\n";
        pairs.forEach((pair, index) => {
            message += `Pair ${index + 1}: Original = ${pair.original}, Reversed = ${pair.reversed}\n`;
        });

        const userChoice = confirm(message + "\nDo you want to keep these cookies?");
        if (userChoice) {
            alert("Cookies are kept! The page will now reload.");
        } else {
            deleteCookies("numberPairs");
            alert("Cookies have been deleted. The page will now reload.");
            location.reload();
        }
    }
}

function deleteCookies(name) {
    setCookie(name, "", -1);
}

document.getElementById('numberForm').addEventListener('submit', function (event)
{
    event.preventDefault();
    const numberInput = document.getElementById('numberInput').value;

    if (numberInput) {
        const reversed = reverseNumber(numberInput);
        addNumberPair(numberInput, reversed);
        alert(`Reversed number: ${reversed}`);
        document.getElementById("numberForm").reset();
    }
});

displayCookies();

function saveAlignmentInLocalStorage(alignment) {
    localStorage.setItem('alignment', alignment);
}

function applyAlignment(alignment) {
    ['block2', 'block3', 'block4'].forEach(blockId => {
        const block = document.getElementById(blockId);
        block.classList.remove('align-left', 'align-center', 'align-right');
        block.classList.add(`align-${alignment}`);
    });
}

function applySavedAlignment() {
    const savedAlignment = localStorage.getItem('alignment');
    if (savedAlignment) {
        applyAlignment(savedAlignment);
        document.querySelector(`#align${savedAlignment.charAt(0).toUpperCase() +
        savedAlignment.slice(1)}`).checked = true;
    }
}

document.getElementById('alignmentForm').addEventListener('click',
    function(event) {
    if (event.target.type === 'radio') {
        const alignment = event.target.value;
        applyAlignment(alignment);
        saveAlignmentInLocalStorage(alignment);
    }
});

window.addEventListener('load', applySavedAlignment);

document.addEventListener("DOMContentLoaded", () => {
    const createListLinks = document.querySelectorAll(".create-list-link");

    const savedLists = JSON.parse(localStorage.getItem("savedLists")) || [];

    function createDeleteButton(li, ol, savedList, savedLists) {
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-item");
        li.appendChild(deleteButton);

        deleteButton.addEventListener("click", () => {
            li.remove();
            savedList.items = [...ol.children].map(li => li.firstChild.textContent.trim());
            localStorage.setItem("savedLists", JSON.stringify(savedLists));
        });
    }

    function saveListToLocalStorage(savedLists, parentBlock, saveButton) {
        localStorage.setItem("savedLists", JSON.stringify(savedLists));

        parentBlock.innerHTML = "";

        const ol = document.createElement("ol");
        ol.classList.add("finalized-list");
        const savedList = savedLists.find(list => list.blockId === parentBlock.id);

        savedList.items.forEach(item => {
            const li = document.createElement("li");
            li.textContent = String(item);
            ol.appendChild(li);
        });

        parentBlock.appendChild(ol);

        const message = document.createElement("p");
        message.textContent = `The list in ${parentBlock.id} has been saved!`;
        message.classList.add("message");
        parentBlock.appendChild(message);

        saveButton.style.display = "none";
    }

    function createListForm(parentBlock, savedList) {
        let container = parentBlock.querySelector(".list-container");
        if (!container) {
            container = document.createElement("div");
            container.classList.add("list-container");
            container.innerHTML = `
                <hr>
                <p>Create a numbered list<i>(press "Enter" to add an item)</i>:</p>
                <hr>
                <ol id="numbered-list"></ol>
                <button id="save-list" style="display: none;">Save</button>
            `;
            parentBlock.appendChild(container);

            const ol = container.querySelector("#numbered-list");
            const saveButton = container.querySelector("#save-list");
            const addItem = document.createElement("input");
            addItem.type = "text";
            addItem.placeholder = "Add item...";
            container.insertBefore(addItem, ol);

            addItem.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && addItem.value.trim() !== "") {
                    const li = document.createElement("li");
                    li.textContent = addItem.value;

                    createDeleteButton(li, ol, savedList, savedLists);

                    ol.appendChild(li);
                    addItem.value = "";
                    saveButton.style.display = "block";
                }
            });

            saveButton.addEventListener("click", () => {
                savedList.items = [...ol.children].map(li => li.firstChild.textContent.trim());
                saveListToLocalStorage(savedLists, parentBlock, saveButton);
            });
        }
    }

    function restoreList() {
        savedLists.forEach(savedList => {
            const parentBlock = document.getElementById(savedList.blockId);

            if (parentBlock) {
                if (savedList.items.length > 0) {
                    createListForm(parentBlock, savedList);

                    const ol = parentBlock.querySelector("#numbered-list");
                    savedList.items.forEach(item => {
                        const li = document.createElement("li");
                        li.textContent = String(item);

                        createDeleteButton(li, ol, savedList, savedLists);

                        ol.appendChild(li);
                    });
                }
            }
        });
    }

    createListLinks.forEach(link => {
        link.addEventListener("focus", (event) => {
            const parentBlock = document.getElementById(event.target.getAttribute("data-target"));
            const savedList = savedLists.find(list => list.blockId === parentBlock.id) ||
                { blockId: parentBlock.id, items: [] };

            if (!savedLists.some(list => list.blockId === parentBlock.id)) {
                savedLists.push(savedList);
            }

            createListForm(parentBlock, savedList);
        });
    });

    restoreList();
});







