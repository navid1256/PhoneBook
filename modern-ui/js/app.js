(function () {
    'use strict';

    /**
     * PhoneBook Modern UI Controller
     * Powered by Dexie.js (IndexedDB) with Bootstrap 5.3 & Modern Web Standards
     */

    // Shared singleton instance initialized in Assets/js/db.js
    const contactDB = window.ContactDB || (typeof ContactDatabase !== 'undefined' && typeof window.dexieDB !== 'undefined' ? new ContactDatabase(window.dexieDB) : null);

    // DOM Elements
    const userNameInp = document.getElementById("userName");
    const userPhoneInp = document.getElementById("userPhone");
    const userEmailInp = document.getElementById("userEmail");
    const tableBody = document.getElementById("tableBody");
    const addForm = document.getElementById("addForm");
    const searchInput = document.getElementById("myInput");
    const paginationList = document.getElementById("paginationList");
    const paginationNav = document.getElementById("paginationNav");
    const themeToggleBtn = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    // State
    let currentPage = 1;
    const pageSize = 20;
    let currentSearch = "";
    let userContacts = [];
    let editingRow = null;

    /* --- Theme Management (Dark / Light Mode) ------------------------- */
    function getCurrentTheme() {
        const saved = localStorage.getItem("phonebook-theme");
        if (saved) return saved;
        return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }

    function applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
        document.documentElement.dataset.bsTheme = theme;
        const metaScheme = document.querySelector('meta[name="color-scheme"]');
        if (metaScheme) {
            metaScheme.content = theme;
        }
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
        if (themeToggleBtn) {
            themeToggleBtn.setAttribute("aria-checked", theme === "light" ? "true" : "false");
            themeToggleBtn.setAttribute(
                "title",
                theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
            );
            themeToggleBtn.setAttribute(
                "aria-label",
                theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
            );
        }
    }

    if (themeToggleBtn) {
        applyTheme(getCurrentTheme());
        themeToggleBtn.addEventListener("click", function () {
            const next = getCurrentTheme() === "dark" ? "light" : "dark";
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
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = "toast-item " + (ok ? "toast-success" : "toast-error");

        const icon = document.createElement("i");
        icon.className = "fas " + (ok ? "fa-check-circle" : "fa-exclamation-circle");

        const text = document.createElement("span");
        text.textContent = message;

        toast.appendChild(icon);
        toast.appendChild(text);
        container.appendChild(toast);

        setTimeout(function () {
            toast.classList.add("toast-hide");
            setTimeout(function () {
                toast.remove();
            }, 300);
        }, 3500);
    }

    /* --- Material Form Outline Behavior (Interactive Notched Outline) -----
       Calculates the notch cutout width to match the floating label,
       and manages the `.active` class when fields contain text or are focused.
       ------------------------------------------------------------------ */
    function updateFormOutline(input) {
        if (!input) return;
        const wrapper = input.closest(".form-outline");
        if (!wrapper) return;

        const label = wrapper.querySelector(".form-label");
        const notchMiddle = wrapper.querySelector(".form-notch-middle");

        if (input.value && input.value.trim() !== "") {
            input.classList.add("active");
        } else {
            input.classList.remove("active");
        }

        if (label && notchMiddle) {
            notchMiddle.style.width = (label.clientWidth * 0.8 + 8) + "px";
        }
    }

    function initFormOutlines(scope) {
        const inputs = (scope || document).querySelectorAll(".form-outline .form-control");
        Array.prototype.forEach.call(inputs, function (input) {
            updateFormOutline(input);

            input.addEventListener("input", function () {
                updateFormOutline(input);
            });
            input.addEventListener("focus", function () {
                updateFormOutline(input);
            });
            input.addEventListener("blur", function () {
                updateFormOutline(input);
            });
        });
    }

    initFormOutlines();

/* --- Phone Input Restrictions -------------------------------------- */
function attachPhoneInputRestrictions(input) {
    if (!input) return;

    let maxLen = 12;
    if (input.hasAttribute("max")) {
        const maxAttr = input.getAttribute("max");
        if (maxAttr && maxAttr.length > 0) maxLen = maxAttr.length;
    }

    input.addEventListener("keydown", function (e) {
        const allowedKeys = [
            "Backspace", "Tab", "Enter", "Escape", "Delete",
            "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
            "Home", "End"
        ];
        if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;

        if (e.key < "0" || e.key > "9") {
            e.preventDefault();
            return;
        }

        const selStart = input.selectionStart;
        const selEnd = input.selectionEnd;
        const selectedCount = (selStart !== null && selEnd !== null) ? selEnd - selStart : 0;
        const currentLength = (input.value || "").length;

        if (currentLength - selectedCount >= maxLen) {
            e.preventDefault();
        }
    });

    input.addEventListener("paste", function (e) {
        e.preventDefault();
        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;

        const pastedText = clipboardData.getData("text") || "";
        const digitsOnly = pastedText.replace(/\D/g, "");

        const currentVal = input.value || "";
        const selStart = input.selectionStart !== null ? input.selectionStart : currentVal.length;
        const selEnd = input.selectionEnd !== null ? input.selectionEnd : currentVal.length;

        const newVal = currentVal.slice(0, selStart) + digitsOnly + currentVal.slice(selEnd);
        input.value = newVal.slice(0, maxLen);
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });
}

attachPhoneInputRestrictions(userPhoneInp);

/* --- Validations --------------------------------------------------- */
const validationRules = {
    name: /^[a-zA-Z\u0600-\u06FF\s]{2,50}$/,
    phone: /^\d{10,12}$/,
    email: /^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
};

function validateField(input, regex, alertElement) {
    if (!input) return false;
    const value = input.value.trim();
    const isValid = regex.test(value);

    if (alertElement) {
        alertElement.style.display = isValid ? "none" : "block";
    }
    input.classList.toggle("is-invalid", !isValid);
    return isValid;
}

userNameInp.addEventListener("blur", () => validateField(userNameInp, validationRules.name, document.getElementById("nameAlert")));
userPhoneInp.addEventListener("blur", () => validateField(userPhoneInp, validationRules.phone, document.getElementById("phoneAlert")));
userEmailInp.addEventListener("blur", () => validateField(userEmailInp, validationRules.email, document.getElementById("mailAlert")));

/* --- Render Functions ---------------------------------------------- */
function renderContactsTable(contacts) {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (!contacts || contacts.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="5" class="text-center py-5">
                    <div class="empty-state">
                        <i class="far fa-address-book empty-state-icon" style="font-size: 2.5rem; color: var(--accent); margin-bottom: 12px; display: block;"></i>
                        <p class="empty-state-title" style="font-size: 1.15rem; font-weight: 600; margin-bottom: 4px;">No contacts found</p>
                        <span class="empty-state-desc" style="color: var(--label-text); font-size: 0.9rem;">Add a new contact using the form to get started.</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    contacts.forEach(function (contact) {
        const tr = document.createElement("tr");
        tr.dataset.id = contact.id;

        tr.innerHTML = `
            <td class="name">${escapeHTML(contact.name)}</td>
            <td class="phone">${escapeHTML(contact.phone)}</td>
            <td class="email">${escapeHTML(contact.email || '')}</td>
            <td>
                <button type="button" class="contact-action contact-action-edit" onclick="handleEditClick(this)" aria-label="Edit contact" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
            <td>
                <button type="button" class="contact-action contact-action-delete" onclick="handleDeleteClick(this)" aria-label="Delete contact" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function renderPagination(totalPages, activePage) {
    if (!paginationList) return;
    paginationList.innerHTML = "";

    if (totalPages <= 1) {
        if (paginationNav) paginationNav.style.display = "none";
        return;
    }
    if (paginationNav) paginationNav.style.display = "block";

    // Prev
    const prevLi = document.createElement("li");
    prevLi.className = `page-item ${activePage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous page">&laquo;</a>`;
    prevLi.addEventListener("click", function (e) {
        e.preventDefault();
        if (activePage > 1) {
            void loadContacts(activePage - 1, currentSearch);
        }
    });
    paginationList.appendChild(prevLi);

    // Numbered pages
    for (let p = 1; p <= totalPages; p++) {
        const pageLi = document.createElement("li");
        pageLi.className = `page-item ${p === activePage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#" ${p === activePage ? 'aria-current="page"' : ''}>${p}</a>`;
        pageLi.addEventListener("click", function (e) {
            e.preventDefault();
            void loadContacts(p, currentSearch);
        });
        paginationList.appendChild(pageLi);
    }

    // Next
    const nextLi = document.createElement("li");
    nextLi.className = `page-item ${activePage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next page">&raquo;</a>`;
    nextLi.addEventListener("click", function (e) {
        e.preventDefault();
        if (activePage < totalPages) {
            void loadContacts(activePage + 1, currentSearch);
        }
    });
    paginationList.appendChild(nextLi);
}

function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m];
    });
}

/* --- CRUD Operations with Dexie.js --------------------------------- */
async function loadContacts(page = 1, search = "") {
    try {
        currentPage = page;
        currentSearch = search;
        const result = await contactDB.getPaginated(page, pageSize, search);
        userContacts = result.contacts;
        renderContactsTable(userContacts);
        renderPagination(result.totalPages, result.currentPage);
    } catch (err) {
        console.error("Failed to load contacts:", err);
        showToast("Error loading contacts from database", false);
    }
}

// Add Contact Form Submit
if (addForm) {
    const addStatus = document.getElementById("addStatus");

    addForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const isNameValid = validateField(userNameInp, validationRules.name, document.getElementById("nameAlert"));
        const isPhoneValid = validateField(userPhoneInp, validationRules.phone, document.getElementById("phoneAlert"));
        const isEmailValid = validateField(userEmailInp, validationRules.email, document.getElementById("mailAlert"));

        if (!isNameValid || !isPhoneValid || !isEmailValid) {
            showToast("Please fill all required fields correctly", false);
            return;
        }

        const name = userNameInp.value.trim();
        const phone = userPhoneInp.value.trim();
        const email = userEmailInp.value.trim();

        try {
            await contactDB.add(name, phone, email);
            showToast(`Contact "${name}" added successfully!`, true);
            if (addStatus) {
                addStatus.style.display = "none";
            }

            // Reset form
            userNameInp.value = "";
            userPhoneInp.value = "";
            userEmailInp.value = "";
            updateFormOutline(userNameInp);
            updateFormOutline(userPhoneInp);
            updateFormOutline(userEmailInp);

            await loadContacts(1, currentSearch);
        } catch (err) {
            console.error(err);
            if (addStatus) {
                addStatus.textContent = err.message || "Could not add contact";
                addStatus.style.display = "block";
            }
            showToast(err.message || "Could not add contact", false);
        }
    });
}

// Search
const searchForm = document.getElementById("searchForm");
if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (searchInput) {
            void loadContacts(1, searchInput.value.trim());
        }
    });
}

if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("input", function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            void loadContacts(1, searchInput.value.trim());
        }, 250);
    });
}

// Delete Contact
window.handleDeleteClick = async function (btn) {
    const tr = btn.closest("tr");
    if (!tr) return;
    const id = Number(tr.dataset.id);
    const name = tr.querySelector(".name") ? tr.querySelector(".name").textContent : "this contact";

    if (!confirm(`Are you sure you want to delete ${name}?`)) {
        return;
    }

    try {
        await contactDB.delete(id);
        showToast(`Contact "${name}" deleted`, true);
        await loadContacts(currentPage, currentSearch);
    } catch (err) {
        console.error(err);
        showToast("Error deleting contact", false);
    }
};

// Edit Contact (Inline)
window.handleEditClick = function (btn) {
    const tr = btn.closest("tr");
    if (!tr || editingRow) return;
    editingRow = tr;

    const id = Number(tr.dataset.id);
    const nameTd = tr.querySelector(".name");
    const phoneTd = tr.querySelector(".phone");
    const emailTd = tr.querySelector(".email");

    const oldName = nameTd.textContent;
    const oldPhone = phoneTd.textContent;
    const oldEmail = emailTd.textContent;

    tr.innerHTML = `
        <td><input type="text" class="form-control form-control-sm edit-name" value="${escapeHTML(oldName)}"></td>
        <td><input type="number" class="form-control form-control-sm edit-phone" value="${escapeHTML(oldPhone)}" min="0" max="999999999999"></td>
        <td><input type="text" class="form-control form-control-sm edit-email" value="${escapeHTML(oldEmail)}"></td>
        <td>
            <button type="button" class="contact-action contact-action-save" onclick="handleSaveEdit(this, ${id})" aria-label="Save" title="Save">
                <i class="fas fa-check"></i>
            </button>
        </td>
        <td>
            <button type="button" class="contact-action contact-action-cancel" onclick="handleCancelEdit(this)" aria-label="Cancel" title="Cancel">
                <i class="fas fa-times"></i>
            </button>
        </td>
    `;

    const phoneInp = tr.querySelector(".edit-phone");
    attachPhoneInputRestrictions(phoneInp);
};

window.handleSaveEdit = async function (btn, id) {
    const tr = btn.closest("tr");
    if (!tr) return;

    const nameInp = tr.querySelector(".edit-name");
    const phoneInp = tr.querySelector(".edit-phone");
    const emailInp = tr.querySelector(".edit-email");

    const name = nameInp.value.trim();
    const phone = phoneInp.value.trim();
    const email = emailInp.value.trim();

    if (!validationRules.name.test(name)) {
        showToast("Please enter a valid name (2-50 characters)", false);
        return;
    }
    if (!validationRules.phone.test(phone)) {
        showToast("Please enter a valid phone number (10-12 digits)", false);
        return;
    }
    if (!validationRules.email.test(email)) {
        showToast("Please enter a valid email address", false);
        return;
    }

    try {
        await contactDB.update(id, name, phone, email);
        showToast("Contact updated successfully!", true);
        editingRow = null;
        await loadContacts(currentPage, currentSearch);
    } catch (err) {
        console.error(err);
        showToast(err.message || "Failed to update contact", false);
    }
};

window.handleCancelEdit = function () {
    editingRow = null;
    void loadContacts(currentPage, currentSearch);
};

// Initial Load
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            void loadContacts(1, "");
        });
    } else {
        void loadContacts(1, "");
    }
})();
