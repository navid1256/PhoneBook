'use strict';

var userNameInp = document.getElementById("userName");
var userPhoneInp = document.getElementById("userPhone");
var userEmailInp = document.getElementById("userEmail");
var tableBody = document.getElementById("tableBody");
var addForm = document.getElementById("addForm");
var addStatus = document.getElementById("addStatus");


/* --- Material form-outline behavior (MDB UI-Kit 4.2.0 replica) --------
   Adds the `.active` class while a field holds a value and sizes the
   notch "middle" segment to its label width — the same job mdb.min.js
   does on the 7Auth register page. Reacts to the bubbled "input"
   events that setInputValue() dispatches, so programmatic fills
   (editContact) also float the labels. Scoped to .form-outline only.
   ------------------------------------------------------------------ */
function updateFormOutline(input)
{
    var wrapper = input.closest(".form-outline");

    if (!wrapper) {
        return;
    }

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

function initFormOutlines(scope)
{
    var inputs = (scope || document).querySelectorAll(".form-outline .form-control");

    Array.prototype.forEach.call(inputs, function (input) {
        updateFormOutline(input);

        input.addEventListener("input", function () {
            updateFormOutline(input);
        });
    });
}

initFormOutlines();


// Client-side copy of the contacts rendered by the server
var userContacts = Array.from(tableBody.querySelectorAll("tr")).map(function (row) {
    var cells = row.getElementsByTagName("td");

    return {
        id: parseInt(row.getAttribute("data-id"), 10) || 0,
        name: cells[0].textContent.trim(),
        phone: cells[1].textContent.trim(),
        email: cells[2].textContent.trim()
    };
});

function escapeHtml(value)
{
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// POST the form to the server so the new contact is stored in the database
function addContact()
{
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
                }, 700);
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

        if (validateName() == true && validatePhone() == true && validateEmail() == true) {
            addContact();
        } else {
            alert("please fill in the form");
        }
    });
}

// Show server responses (success / error) under the add-contact form
function showAddStatus(message, ok)
{
    if (!addStatus) {
        return;
    }

    addStatus.textContent = message;
    addStatus.classList.remove("alert-danger", "alert-success");
    addStatus.classList.add(ok ? "alert-success" : "alert-danger");
    addStatus.style.display = "block";
}

// Render rows with the exact same markup the server-side view produces
function displayData()
{
    var temp = "";

    for (var i = 0; i < userContacts.length; i++) {
        temp += "<tr data-id=\"" + userContacts[i].id + "\">" +
            "<td class=\"name\">" + escapeHtml(userContacts[i].name) + "</td>" +
            "<td class=\"phone\">" + escapeHtml(userContacts[i].phone) + "</td>" +
            "<td class=\"email\">" + escapeHtml(userContacts[i].email) + "</td>" +
            "<td><button onclick=\"editContact(this)\" class=\"contact-action contact-action-edit\" aria-label=\"Edit contact\" title=\"Edit\"><i class=\"fas fa-edit\"></i></button></td>" +
            "<td><button onclick=\"deleteContact(this)\" class=\"contact-action contact-action-delete\" aria-label=\"Delete contact\" title=\"Delete\"><i class=\"fas fa-trash-alt\"></i></button></td>" +
            "</tr>";
    }

    tableBody.innerHTML = temp;
    searchFunction();
}

function rowIndexOf(button)
{
    var row = button.closest("tr");

    if (!row) {
        return -1;
    }

    return Array.prototype.indexOf.call(tableBody.querySelectorAll("tr"), row);
}

// Called from the view as deleteContact(this)
function deleteContact(button)
{
    if (confirm("Are you sure you want to delete this contact ?") !== true) {
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
                setTimeout(function () {
                    window.location.reload();
                }, 700);
            } else {
                alert(data.message || "Failed to delete contact.");
            }
        })
        .catch(function () {
            alert("Could not reach the server. Please try again.");
        });
}

// Set an MDB input value and notify its floating label
// (MDB only reacts to real events, not to direct .value assignment)
function setInputValue(input, value)
{
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
}

// Called from the view as editContact(this):
// load the row values back into the form and remove the row
function editContact(button)
{
    var index = rowIndexOf(button);

    if (index === -1) {
        return;
    }

    setInputValue(userNameInp, userContacts[index].name);
    setInputValue(userPhoneInp, userContacts[index].phone);
    setInputValue(userEmailInp, userContacts[index].email);

    userContacts.splice(index, 1);
    displayData();

    userNameInp.focus();
}

// Only clear the "add contact" inputs, never the search box
function clearData()
{
    setInputValue(userNameInp, "");
    setInputValue(userPhoneInp, "");
    setInputValue(userEmailInp, "");
}


function searchFunction() 
{
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
      return value.indexOf(filter) > -1;
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
function showAlert(id, show)
{
    var el = document.getElementById(id);

    if (el) {
        el.style.display = show ? "block" : "none";
    }
}

function validateName()
{
    var regex = /^[a-zA-Z0-9]+([a-zA-Z0-9](_|-| )[a-zA-Z0-9])*[a-zA-Z0-9]+$/;
    if(regex.test(userNameInp.value) == true)
    {
        showAlert("nameAlert", false);
        return true;
    }
    else
    {
        showAlert("nameAlert", true);
        return false;
    }
}

function validatePhone()
{
    // Same rule as the server-side Validator::isValidPhoneNumber:
    // strip non-digit characters and accept 10-12 digits.
    // Covers 10-digit local numbers, 11-digit Iranian mobile (09xxxxxxxxx),
    // and international numbers with country code.
    var cleanedPhone = userPhoneInp.value.replace(/\D/g, "");
    var length = cleanedPhone.length;

    if (length >= 10 && length <= 12) {
        showAlert("phoneAlert", false);
        return true;
    }

    showAlert("phoneAlert", true);
    return false;
}


function validateEmail()
{
    // Email is optional: an empty field is considered valid
    if (userEmailInp.value.trim() === "") {
        showAlert("mailAlert", false);
        return true;
    }

    var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if(regex.test(userEmailInp.value) == true)
    {
        showAlert("mailAlert", false);
        return true;
    }
    else
    {
        showAlert("mailAlert", true);
        return false;
    }
}