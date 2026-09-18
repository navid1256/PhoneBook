'use strict';

var userNameInp = document.getElementById("userName");
var userPhoneInp = document.getElementById("userPhone");
var userEmailInp = document.getElementById("userEmail");
var tableBody = document.getElementById("tableBody");
var addForm = document.getElementById("addForm");
var addStatus = document.getElementById("addStatus");


/* --- Theme Management (Dark / Light Mode) -------------------------
   Persists preference in localStorage and synchronizes icon and theme
   attribute on <html>. Follows modern-web-guidance.
   ------------------------------------------------------------------ */
var themeToggleBtn = document.getElementById("themeToggle");
var themeIcon = document.getElementById("themeIcon");

function getCurrentTheme() {
    var saved = localStorage.getItem("phonebook-theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("phonebook-theme", theme);
    if (themeIcon) {
        if (theme === "light") {
            themeIcon.classList.remove("fa-moon");
            themeIcon.classList.add("fa-sun");
        } else {
            themeIcon.classList.remove("fa-sun");
            themeIcon.classList.add("fa-moon");
        }
    }
}

if (themeToggleBtn) {
    applyTheme(getCurrentTheme());
    themeToggleBtn.addEventListener("click", function () {
        var current = getCurrentTheme();
        var next = current === "dark" ? "light" : "dark";
        applyTheme(next);
    });
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    if (!localStorage.getItem("phonebook-theme")) {
        applyTheme(e.matches ? "dark" : "light");
    }
});

/* --- Floating Toast Notification Manager --------------------------- */
function showToast(message, ok) {
    var container = document.getElementById("toastContainer");
    if (!container) return;

    var toast = document.createElement("div");
    toast.className = "toast-item " + (ok ? "toast-success" : "toast-error");

    var icon = document.createElement("i");
    icon.className = "fas " + (ok ? "fa-check-circle" : "fa-exclamation-circle");

    var text = document.createElement("span");
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);

    setTimeout(function () {
        toast.classList.add("toast-hide");
        setTimeout(function () {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3500);
}

/**
 * Attach strict numeric-only and length restrictions to phone inputs.
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
        var allowedKeys = [
            "Backspace", "Tab", "Enter", "Escape", "Delete",
            "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
            "Home", "End"
        ];
        if (allowedKeys.includes(e.key)) {
            return;
        }

        if (e.ctrlKey || e.metaKey) {
            return;
        }

        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
            return;
        }

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

// Attach phone restrictions
attachPhoneInputRestrictions(userPhoneInp);


// Client-side copy of the contacts rendered by the server
var userContacts = Array.from(tableBody.querySelectorAll("tr")).map(function (row) {
    var cells = row.getElementsByTagName("td");

    return {
        id: Number.parseInt(row.dataset.id, 10) || 0,
        name: cells[0].textContent.trim(),
        phone: cells[1].textContent.trim(),
        email: cells[2].textContent.trim()
    };
});

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}


// POST the form to the server so the new contact is stored in the database
function addContact() {
    fetch(addForm.action, {
        method: "POST",
        body: new URLSearchParams({
            name: userNameInp.value,
            phone: userPhoneInp.value,
            email: userEmailInp.value
        })
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.success) {
                showAddStatus(data.message, true);
                // Reload so the table and pagination reflect the database
                setTimeout(function () {
                    window.location.reload();
                }, 1000);
            } else {
                showAddStatus(data.message, false);
            }
        })
        .catch(function () {
            showAddStatus("Could not reach the server. Please try again.", false);
        });
}

// Intercept the form submit: validate on the client first, then POST via fetch
if (addForm) {
    addForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (validateName() && validatePhone() && validateEmail()) {
            addContact();
        } else {
            alert("please fill in the form");
        }
    });
}

// Show server responses (success / error) using floating toasts and alert box
function showAddStatus(message, ok) {
    showToast(message, ok);
    if (addStatus) {
        addStatus.textContent = message;
        addStatus.classList.remove("alert-danger", "alert-success");
        addStatus.classList.add(ok ? "alert-success" : "alert-danger");
        addStatus.style.display = "block";

        if (ok) {
            setTimeout(function () {
                addStatus.style.display = "none";
            }, 3000);
        }
    }
}

// Render rows with the exact same markup the server-side view produces
function displayData() {
    var temp = "";

    for (var contact of userContacts) {
        temp += "<tr data-id=\"" + contact.id + "\">" +
            "<td class=\"name\">" + escapeHtml(contact.name) + "</td>" +
            "<td class=\"phone\">" + escapeHtml(contact.phone) + "</td>" +
            "<td class=\"email\">" + escapeHtml(contact.email) + "</td>" +
            "<td><button onclick=\"editContact(this)\" class=\"contact-action contact-action-edit\" aria-label=\"Edit contact\" title=\"Edit\"><i class=\"fas fa-edit\"></i></button></td>" +
            "<td><button onclick=\"deleteContact(this)\" class=\"contact-action contact-action-delete\" aria-label=\"Delete contact\" title=\"Delete\"><i class=\"fas fa-trash-alt\"></i></button></td>" +
            "</tr>";
    }

    tableBody.innerHTML = temp;
    searchFunction();
}

// Locate a row by returning its index in the rendered table
function rowIndexOf(button) {
    var row = button.closest("tr");

    if (!row) {
        return -1;
    }

    return Array.prototype.indexOf.call(tableBody.querySelectorAll("tr"), row);
}

// Called from the view as deleteContact(this)
function deleteContact(button) {
    if (!confirm("Are you sure you want to delete this contact ?")) {
        return;
    }

    var index = rowIndexOf(button);

    if (index === -1) {
        return;
    }

    var contactId = userContacts[index].id;

    if (!contactId) {
        return;
    }

    // DELETE the contact on the server so it is removed from the database
    fetch(SITE_URL + "contact/delete/" + encodeURIComponent(contactId), {
        method: "DELETE"
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.success) {
                // Remove the row immediately, then reload so the table
                // and pagination reflect the database
                userContacts.splice(index, 1);
                displayData();
                showToast(data.message || "Contact deleted successfully", true);
                setTimeout(function () {
                    window.location.reload();
                }, 700);
            } else {
                showToast(data.message || "Failed to delete contact.", false);
            }
        })
        .catch(function () {
            showToast("Could not reach the server. Please try again.", false);
        });
}

// Set an MDB input value and notify its floating label
// (MDB only reacts to real events, not to direct .value assignment)
function setInputValue(input, value) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
}

// Inline editing state: which table row is currently being edited
var editingRow = null;

// Turn the 3 value cells of a row into inputs + swap Edit/Delete for Save/Cancel
function startEditRow(row) {
    var cells = row.querySelectorAll("td");

    // cells[0]=name, cells[1]=phone, cells[2]=email: keep current text as input value
    [0, 1, 2].forEach(function (i) {
        var input = document.createElement("input");

        input.type = "text";
        input.className = "form-control form-control-sm inline-edit";
        input.value = cells[i].textContent.trim();

        cells[i].textContent = "";
        cells[i].appendChild(input);
    });

    // cells[3] = Edit button, cells[4] = Delete button -> Save / Cancel
    cells[3].innerHTML = '<button onclick="saveEditedContact(this)" class="contact-action contact-action-save" aria-label="Save changes" title="Save"><i class="fas fa-check"></i></button>';
    cells[4].innerHTML = '<button onclick="cancelEditRow(this)" class="contact-action contact-action-cancel" aria-label="Cancel editing" title="Cancel"><i class="fas fa-times"></i></button>';

    var phoneInput = cells[1].querySelector("input");
    if (phoneInput) {
        phoneInput.setAttribute("max", "999999999999");
        phoneInput.inputMode = "numeric";
        attachPhoneInputRestrictions(phoneInput);
    }

    editingRow = row;
    cells[0].querySelector("input").focus();
}

// Restore the row to display mode with the given contact values
function endEditRow(row, contact) {
    var cells = row.querySelectorAll("td");

    cells[0].textContent = contact.name;
    cells[1].textContent = contact.phone;
    cells[2].textContent = contact.email;

    cells[3].innerHTML = '<button onclick="editContact(this)" class="contact-action contact-action-edit" aria-label="Edit contact" title="Edit"><i class="fas fa-edit"></i></button>';
    cells[4].innerHTML = '<button onclick="deleteContact(this)" class="contact-action contact-action-delete" aria-label="Delete contact" title="Delete"><i class="fas fa-trash-alt"></i></button>';

    editingRow = null;
    searchFunction();
}

// Read the inline inputs of an edited row
function readEditedRow(row) {
    var inputs = row.querySelectorAll("input.inline-edit");

    return {
        name: inputs[0].value.trim(),
        phone: inputs[1].value.trim(),
        email: inputs[2].value.trim()
    };
}

// Called from the view as editContact(this): start inline editing on that row
function editContact(button) {
    var row = button.closest("tr");
    var index = rowIndexOf(button);

    if (index === -1) {
        return;
    }

    // Only one row can be edited at a time: restore any previous edited row
    if (editingRow && editingRow !== row) {
        var prevIndex = Array.prototype.indexOf.call(tableBody.querySelectorAll("tr"), editingRow);

        if (prevIndex > -1 && userContacts[prevIndex]) {
            endEditRow(editingRow, userContacts[prevIndex]);
        }
    }

    startEditRow(row);
}

// Called from the view as saveEditedContact(this): validate then PUT to the server
function saveEditedContact(button) {
    var row = button.closest("tr");
    var index = rowIndexOf(button);

    if (index === -1 || !userContacts[index]) {
        return;
    }

    var contactId = userContacts[index].id;
    var edited = readEditedRow(row);
    var phoneDigits = edited.phone.replaceAll(/\D/g, "");

    // Same rules as the Add form (validateName/validatePhone/validateEmail)
    var nameOk = /^[\p{L}\p{N}]+(?:[ _-][\p{L}\p{N}]+)*$/u.test(edited.name);
    var phoneOk = phoneDigits.length >= 10 && phoneDigits.length <= 12;
    var emailOk = edited.email === "" || /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(edited.email);

    if (!nameOk || !phoneOk || !emailOk) {
        showToast("Invalid values: name must be letters, phone 10-12 digits, email a valid address.", false);
        return;
    }

    fetch(SITE_URL + "contact/update/" + encodeURIComponent(contactId), {
        method: "PUT",
        body: new URLSearchParams({
            name: edited.name,
            phone: edited.phone,
            email: edited.email
        })
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.success) {
                userContacts[index].name = edited.name;
                userContacts[index].phone = phoneDigits;
                userContacts[index].email = edited.email;
                endEditRow(row, userContacts[index]);
                showToast(data.message || "Contact updated successfully", true);
            } else {
                showToast(data.message || "Failed to update contact.", false);
            }
        })
        .catch(function () {
            showToast("Could not reach the server. Please try again.", false);
        });
}

// Called from the view as cancelEditRow(this): restore original values
function cancelEditRow(button) {
    var index = rowIndexOf(button);

    if (index === -1 || !userContacts[index]) {
        return;
    }

    endEditRow(button.closest("tr"), userContacts[index]);
}

// Only clear the "add contact" inputs, never the search box
function clearData() {
    setInputValue(userNameInp, "");
    setInputValue(userPhoneInp, "");
    setInputValue(userEmailInp, "");
}


function searchFunction() {
    var input = document.getElementById("myInput");
    if (!input) {
        return;
    }

    var filter = input.value.trim().toUpperCase();
    var rows = document.querySelectorAll("#tableBody tr");

    Array.prototype.forEach.call(rows, function (row) {
        var contactValues = Array.from(row.querySelectorAll("td"))
            .slice(0, 3)
            .map(function (cell) {
                return (cell.textContent || "").toUpperCase();
            });

        var matches = contactValues.some(function (value) {
            return value.includes(filter);
        });

        row.style.display = matches ? "" : "none";
    });
}

var searchInput = document.getElementById("myInput");
var searchForm = document.getElementById("searchForm");

if (searchInput) {
    searchInput.addEventListener("input", searchFunction);
}

if (searchForm) {
    searchForm.addEventListener("submit", function () {
        searchInput.value = searchInput.value.trim();
    });
}

searchFunction();


// Show/hide an inline alert; tolerate a missing element so the flow never crashes
function showAlert(id, show) {
    var el = document.getElementById(id);

    if (el) {
        el.style.display = show ? "block" : "none";
    }
}

function validateName() {
    // Unicode-aware: accepts Persian/Arabic/English letters and digits
    // (matches the server, which only requires a non-empty name)
    var regex = /^[\p{L}\p{N}]+(?:[ _-][\p{L}\p{N}]+)*$/u;
    if (regex.test(userNameInp.value)) {
        showAlert("nameAlert", false);
        return true;
    }
    else {
        showAlert("nameAlert", true);
        return false;
    }
}

function validatePhone() {
    // Same rule as the server-side Validator::isValidPhoneNumber:
    // strip non-digit characters and accept 10-12 digits.
    // Covers 10-digit local numbers, 11-digit Iranian mobile (09xxxxxxxxx),
    // and international numbers with country code.
    var cleanedPhone = userPhoneInp.value.replaceAll(/\D/g, "");
    var length = cleanedPhone.length;

    if (length >= 10 && length <= 12) {
        showAlert("phoneAlert", false);
        return true;
    }

    showAlert("phoneAlert", true);
    return false;
}


function validateEmail() {
    // Email is optional: an empty field is considered valid
    if (userEmailInp.value.trim() === "") {
        showAlert("mailAlert", false);
        return true;
    }

    // Simple structural check (local@domain.tld) — the server-side
    // Validator::isValidEmail uses PHP FILTER_VALIDATE_EMAIL anyway.
    var regex = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

    if (regex.test(userEmailInp.value)) {
        showAlert("mailAlert", false);
        return true;
    }
    else {
        showAlert("mailAlert", true);
        return false;
    }
}