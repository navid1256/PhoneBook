/**
 * ContactDB - Dexie.js (IndexedDB) Storage Manager for PhoneBook
 * Provides a clean, modern ORM-like interface for contact management.
 */

// Initialize Dexie database
const dexieDB = new Dexie('PhoneBookDB');

// Define database schema
dexieDB.version(1).stores({
    contacts: '++id, name, phone, email, created_at'
});

class ContactDatabase {
    constructor(dexieInstance) {
        this.db = dexieInstance;
    }

    /**
     * Normalize phone to digits only.
     */
    normalizePhone(phone) {
        return String(phone || '').replace(/\D/g, '');
    }

    /**
     * Get all contacts ordered by created_at descending.
     */
    async getAll() {
        return await this.db.contacts.orderBy('created_at').reverse().toArray();
    }

    /**
     * Get paginated and filtered contacts.
     */
    async getPaginated(page = 1, pageSize = 20, search = '') {
        const query = (search || '').trim().toLowerCase();
        let collection = this.db.contacts.orderBy('created_at').reverse();

        if (query !== '') {
            collection = collection.filter((c) => {
                const name = (c.name || '').toLowerCase();
                const phone = (c.phone || '').toLowerCase();
                const email = (c.email || '').toLowerCase();
                return name.includes(query) || phone.includes(query) || email.includes(query);
            });
        }

        const totalContacts = await collection.count();
        const totalPages = Math.max(1, Math.ceil(totalContacts / pageSize));
        const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
        const start = (currentPage - 1) * pageSize;

        const contacts = await collection.offset(start).limit(pageSize).toArray();

        return {
            contacts,
            totalContacts,
            totalPages,
            currentPage,
            pageSize
        };
    }

    /**
     * Find single contact by ID.
     */
    async find(id) {
        return await this.db.contacts.get(Number(id));
    }

    /**
     * Add new contact.
     */
    async add(data) {
        const name = (data.name || '').trim();
        const phone = this.normalizePhone(data.phone);
        const email = (data.email || '').trim();

        if (!name || !phone) {
            throw new Error('Name and phone are required.');
        }

        // Duplicate check (same name and phone)
        const duplicate = await this.db.contacts
            .filter(c => c.name.toLowerCase() === name.toLowerCase() && c.phone === phone)
            .first();

        if (duplicate) {
            throw new Error('Contact with this name and phone already exists.');
        }

        const newRecord = {
            name,
            phone,
            email: email !== '' ? email : null,
            created_at: new Date().toISOString()
        };

        const id = await this.db.contacts.add(newRecord);
        return { id, ...newRecord };
    }

    /**
     * Update existing contact.
     */
    async update(id, data) {
        const numId = Number(id);
        const name = (data.name || '').trim();
        const phone = this.normalizePhone(data.phone);
        const email = (data.email || '').trim();

        if (!name || !phone) {
            throw new Error('Name and phone are required.');
        }

        const existing = await this.find(numId);
        if (!existing) {
            throw new Error('Contact not found.');
        }

        // Collision check (same name and phone with a different id)
        const duplicate = await this.db.contacts
            .filter(c => c.id !== numId && c.name.toLowerCase() === name.toLowerCase() && c.phone === phone)
            .first();

        if (duplicate) {
            throw new Error('Another contact with this name and phone already exists.');
        }

        const updatedData = {
            name,
            phone,
            email: email !== '' ? email : null,
            updated_at: new Date().toISOString()
        };

        await this.db.contacts.update(numId, updatedData);
        return { ...existing, ...updatedData };
    }

    /**
     * Delete contact by ID.
     */
    async delete(id) {
        await this.db.contacts.delete(Number(id));
        return true;
    }

    /**
     * Count total contacts.
     */
    async count() {
        return await this.db.contacts.count();
    }
}

// Export singleton instance globally
window.ContactDB = new ContactDatabase(dexieDB);
