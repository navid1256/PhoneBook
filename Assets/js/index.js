'use strict';

/**
 * PhoneBook - Client-side Controller for IndexedDB
 */

var userNameInp = document.getElementById("userName");
var userPhoneInp = document.getElementById("userPhone");
var userEmailInp = document.getElementById("userEmail");
var tableBody = document.getElementById("tableBody");
var addForm = document.getElementById("addForm");
var addStatus = document.getElementById("addStatus");
var searchInput = document.getElementById("myInput");
var searchForm = document.getElementById("searchForm");
var paginationList = document.getElementById("paginationList");
var paginationNav = document.getElementById("paginationNav");

// Application State
var currentPage = 1;
var pageSize = 20;
var currentSearch = "";
var userContacts = [];
var editingRow = null;

/* --- Material form-outline behavior (MDB UI-Kit replica) --- */
function updateFormOutline(input) {
    var wrapper = input.closest(".form-outline");
    if (!wrapper) return;

    var label = wrapper.querySelector(".form-label");
    var notchMiddle = wrapper.querySelector(".form-notch-middle");

    if (input.value !== "") {
        input.classList.add("active");
    } else {
        input.classList.remove("active");
    }

    if (label && notchMiddle) {
        notchMiddle.style.width = label.clientWidth + "px";
    }
}

function initFormOutlines(scope) {
    var inputs = (scope || document).querySelectorAll(".form-outline .form-control");
    Array.prototype.forEach.call(inputs, function (input) {
        updateFormOutline(input);
        input.addEventListener("input", function () {
            updateFormOutline(input);
        });
    });
}

/**
 * Attach strict numeric-only and length restrictions to phone inputs.
 * Enforces:
 * 1. Only digits (0-9) are allowed (blocks 'e', '+', '-', '.', letters, and symbols).
 * 2. Maximum digits limit (matches max attribute length, e.g. 12 digits for max="999999999999").
 * 3. Sanitizes paste data and mobile virtual keyboard input.
 */
function attachPhoneInputRestrictions(input) {
    if (!input) return;

    var maxLen = 12;
    if (input.hasAttribute("max")) {
        var maxAttr = input.getAttribute("max");
        if (maxAttr && maxAttr.length > 0) {
            maxLen = maxAttr.length;
        }
    }

    input.addEventListener("keydown", function (e) {
        // Allow control & navigation keys
        var allowedKeys = [
            "Backspace", "Tab", "Enter", "Escape", "Delete",
            "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
            "Home", "End"
        ];
        if (allowedKeys.includes(e.key)) {
            return;
        }

        // Allow Ctrl / Command combinations (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z)
        if (e.ctrlKey || e.metaKey) {
            return;
        }

        // Strictly block any key that is not a numeric digit (0-9)
        // (This prevents typing 'e', 'E', '+', '-', '.', and any letters/symbols)
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
            return;
        }

        // Prevent typing beyond max length
        var isSelected = false;
        try {
            if (typeof input.selectionStart === "number" && typeof input.selectionEnd === "number") {
                isSelected = input.selectionStart !== input.selectionEnd;
            }
        } catch (err) {
            isSelected = false;
        }

        var currentDigits = input.value.replace(/\D/g, "");
        if (!isSelected && currentDigits.length >= maxLen) {
            e.preventDefault();
        }
    });

    input.addEventListener("paste", function (e) {
        e.preventDefault();
        var paste = (e.clipboardData || window.clipboardData).getData("text") || "";
        var cleanPaste = paste.replace(/\D/g, "");
        var currentDigits = input.value.replace(/\D/g, "");
        var combined = (currentDigits + cleanPaste).slice(0, maxLen);
        input.value = combined;
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    input.addEventListener("input", function () {
        var digits = input.value.replace(/\D/g, "").slice(0, maxLen);
        if (input.value !== digits) {
            input.value = digits;
        }
    });
}

// Apply restrictions to the add contact phone field
attachPhoneInputRestrictions(userPhoneInp);

function escapeHtml(value) {
    return String(value == null ? "" : value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function setInputValue(input, value) {
    if (!input) return;
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
}

function showAlert(id, show) {
    var el = document.getElementById(id);
    if (el) {
        el.style.display = show ? "block" : "none";
    }
}

function showAddStatus(message, ok) {
    if (!addStatus) return;
    addStatus.textContent = message;
    addStatus.classList.remove("alert-danger", "alert-success");
    addStatus.classList.add(ok ? "alert-success" : "alert-danger");
    addStatus.style.display = "block";

    if (ok) {
        setTimeout(function () {
            addStatus.style.display = "none";
        }, 4000);
    }
}

function clearData() {
    setInputValue(userNameInp, "");
    setInputValue(userPhoneInp, "");
    setInputValue(userEmailInp, "");
    showAlert("nameAlert", false);
    showAlert("phoneAlert", false);
    showAlert("mailAlert", false);
}

function validateName() {
    var regex = /^[\p{L}\p{N}]+(?:[ _-][\p{L}\p{N}]+)*$/u;
    if (regex.test(userNameInp.value.trim())) {
        showAlert("nameAlert", false);
        return true;
    } else {
        showAlert("nameAlert", true);
        return false;
    }
}

function validatePhone() {
    var cleaned = userPhoneInp.value.replace(/\D/g, "");
    if (cleaned.length >= 10 && cleaned.length <= 12) {
        showAlert("phoneAlert", false);
        return true;
    }
    showAlert("phoneAlert", true);
    return false;
}

function validateEmail() {
    if (userEmailInp.value.trim() === "") {
        showAlert("mailAlert", false);
        return true;
    }
    var regex = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
    if (regex.test(userEmailInp.value.trim())) {
        showAlert("mailAlert", false);
        return true;
    } else {
        showAlert("mailAlert", true);
        return false;
    }
}

/**
 * Loads contacts from IndexedDB and updates the table and pagination.
 */
async function loadContacts(page) {
    if (page !== undefined) {
        currentPage = page;
    }

    try {
        var data = await window.ContactDB.getPaginated(currentPage, pageSize, currentSearch);
        userContacts = data.contacts;
        currentPage = data.currentPage;

        renderTable(data.contacts, data.totalContacts);
        renderPagination(data.totalPages, data.currentPage);
    } catch (err) {
        console.error("Error loading contacts from IndexedDB:", err);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Error loading data from IndexedDB: ' + escapeHtml(err.message) + '</td></tr>';
    }
}

/**
 * Renders contact rows into #tableBody.
 */
function renderTable(contacts, totalCount) {
    if (!tableBody) return;

    if (!contacts || contacts.length === 0) {
        if (currentSearch.trim() !== "") {
            tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">' +
                '<i class="fas fa-search"></i>' +
                '<h6>No contacts found for "' + escapeHtml(currentSearch) + '"</h6>' +
                '</td></tr>';
        } else {
            tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">' +
                '<i class="far fa-address-book"></i>' +
                '<h6>Your Phone Book is empty</h6>' +
                '</td></tr>';
        }
        return;
    }

    var html = "";
    for (const contact of contacts) {
        html += '<tr data-id="' + contact.id + '">' +
            '<td class="name">' + escapeHtml(contact.name) + '</td>' +
            '<td class="phone">' + escapeHtml(contact.phone) + '</td>' +
            '<td class="email">' + escapeHtml(contact.email || "") + '</td>' +
            '<td><button onclick="editContact(this)" class="contact-action contact-action-edit" aria-label="Edit contact" title="Edit"><i class="fas fa-edit"></i></button></td>' +
            '<td><button onclick="deleteContact(this)" class="contact-action contact-action-delete" aria-label="Delete contact" title="Delete"><i class="fas fa-trash-alt"></i></button></td>' +
            '</tr>';
    }

    tableBody.innerHTML = html;
}

/**
 * Renders pagination items dynamically.
 */
function renderPagination(totalPages, activePage) {
    if (!paginationList) return;

    if (totalPages <= 1) {
        paginationList.innerHTML = "";
        if (paginationNav) paginationNav.style.display = "none";
        return;
    }

    if (paginationNav) paginationNav.style.display = "block";

    var html = "";

    // Previous Button
    var prevDisabled = activePage === 1 ? " disabled" : "";
    html += '<li class="page-item' + prevDisabled + '">' +
        '<a class="page-link" href="#" onclick="changePage(' + (activePage - 1) + '); return false;" aria-label="Previous">&laquo;</a>' +
        '</li>';

    // Page numbers
    for (var p = 1; p <= totalPages; p++) {
        var activeClass = p === activePage ? " active" : "";
        html += '<li class="page-item' + activeClass + '">' +
            '<a class="page-link" href="#" onclick="changePage(' + p + '); return false;">' + p + '</a>' +
            '</li>';
    }

    // Next Button
    var nextDisabled = activePage === totalPages ? " disabled" : "";
    html += '<li class="page-item' + nextDisabled + '">' +
        '<a class="page-link" href="#" onclick="changePage(' + (activePage + 1) + '); return false;" aria-label="Next">&raquo;</a>' +
        '</li>';

    paginationList.innerHTML = html;
}

function changePage(page) {
    loadContacts(page);
}

function clearSearch() {
    if (searchInput) {
        searchInput.value = "";
    }
    currentSearch = "";
    loadContacts(1);
}

/**
 * Handle adding new contact to IndexedDB.
 */
async function addContact() {
    var name = userNameInp.value.trim();
    var phone = userPhoneInp.value.trim();
    var email = userEmailInp.value.trim();

    try {
        await window.ContactDB.add({
            name: name,
            phone: phone,
            email: email
        });

        showAddStatus("Contact added successfully to IndexedDB!", true);
        clearData();
        await loadContacts(1);
    } catch (err) {
        showAddStatus(err.message || "Failed to add contact.", false);
    }
}

// Add Form Submit listener
if (addForm) {
    addForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (validateName() && validatePhone() && validateEmail()) {
            addContact();
        } else {
            showAddStatus("Please fill in the required fields correctly.", false);
        }
    });
}

/**
 * Locate row index in userContacts array.
 */
function rowIndexOf(button) {
    var row = button.closest("tr");
    if (!row) return -1;
    return Array.prototype.indexOf.call(tableBody.querySelectorAll("tr"), row);
}

/**
 * Delete a contact from IndexedDB.
 */
async function deleteContact(button) {
    var index = rowIndexOf(button);
    if (index === -1 || !userContacts[index]) return;

    var contact = userContacts[index];
    if (!confirm('Are you sure you want to delete "' + contact.name + '"?')) {
        return;
    }

    try {
        await window.ContactDB.delete(contact.id);
        await loadContacts(currentPage);
    } catch (err) {
        alert("Failed to delete contact: " + err.message);
    }
}

/**
 * Inline Editing for Rows
 */
function startEditRow(row) {
    var cells = row.querySelectorAll("td");

    [0, 1, 2].forEach(function (i) {
        var input = document.createElement("input");
        input.type = "text";
        input.className = "form-control form-control-sm inline-edit";
        input.value = cells[i].textContent.trim();
        cells[i].textContent = "";
        cells[i].appendChild(input);
    });

    cells[3].innerHTML = '<button onclick="saveEditedContact(this)" class="contact-action contact-action-save" aria-label="Save changes" title="Save"><i class="fas fa-check"></i></button>';
    cells[4].innerHTML = '<button onclick="cancelEditRow(this)" class="contact-action contact-action-cancel" aria-label="Cancel editing" title="Cancel"><i class="fas fa-times"></i></button>';

    editingRow = row;

    var phoneInput = cells[1].querySelector("input");
    if (phoneInput) {
        phoneInput.setAttribute("max", "999999999999");
        phoneInput.inputMode = "numeric";
        attachPhoneInputRestrictions(phoneInput);
    }

    var firstInput = cells[0].querySelector("input");
    if (firstInput) firstInput.focus();
}

function endEditRow(row, contact) {
    var cells = row.querySelectorAll("td");

    cells[0].textContent = contact.name;
    cells[1].textContent = contact.phone;
    cells[2].textContent = contact.email || "";

    cells[3].innerHTML = '<button onclick="editContact(this)" class="contact-action contact-action-edit" aria-label="Edit contact" title="Edit"><i class="fas fa-edit"></i></button>';
    cells[4].innerHTML = '<button onclick="deleteContact(this)" class="contact-action contact-action-delete" aria-label="Delete contact" title="Delete"><i class="fas fa-trash-alt"></i></button>';

    editingRow = null;
}

function readEditedRow(row) {
    var inputs = row.querySelectorAll("input.inline-edit");
    return {
        name: inputs[0] ? inputs[0].value.trim() : "",
        phone: inputs[1] ? inputs[1].value.trim() : "",
        email: inputs[2] ? inputs[2].value.trim() : ""
    };
}

function editContact(button) {
    var row = button.closest("tr");
    var index = rowIndexOf(button);
    if (index === -1) return;

    if (editingRow && editingRow !== row) {
        var prevIndex = Array.prototype.indexOf.call(tableBody.querySelectorAll("tr"), editingRow);
        if (prevIndex > -1 && userContacts[prevIndex]) {
            endEditRow(editingRow, userContacts[prevIndex]);
        }
    }

    startEditRow(row);
}

async function saveEditedContact(button) {
    var row = button.closest("tr");
    var index = rowIndexOf(button);
    if (index === -1 || !userContacts[index]) return;

    var contactId = userContacts[index].id;
    var edited = readEditedRow(row);
    var phoneDigits = edited.phone.replace(/\D/g, "");

    var nameOk = /^[\p{L}\p{N}]+(?:[ _-][\p{L}\p{N}]+)*$/u.test(edited.name);
    var phoneOk = phoneDigits.length >= 10 && phoneDigits.length <= 12;
    var emailOk = edited.email === "" || /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(edited.email);

    if (!nameOk || !phoneOk || !emailOk) {
        alert("Invalid values: name must contain letters/digits, phone must be 10-12 digits, and email must be valid.");
        return;
    }

    try {
        var updated = await window.ContactDB.update(contactId, {
            name: edited.name,
            phone: phoneDigits,
            email: edited.email
        });

        userContacts[index] = updated;
        endEditRow(row, updated);
    } catch (err) {
        alert("Failed to update contact: " + err.message);
    }
}

function cancelEditRow(button) {
    var index = rowIndexOf(button);
    if (index === -1 || !userContacts[index]) return;
    endEditRow(button.closest("tr"), userContacts[index]);
}

/**
 * Real-time Search Handler
 */
var searchDebounceTimer = null;
function handleSearch() {
    if (!searchInput) return;
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(function () {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        loadContacts(1);
    }, 200);
}

if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
}
if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        handleSearch();
    });
}

// Window OnLoad initialization
document.addEventListener("DOMContentLoaded", function () {
    initFormOutlines();
    loadContacts(1);
});