import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

/**
 * In-memory Mock Storage conforming to ContactDatabase logic in db.js
 */
class InMemoryContactStorage {
    constructor() {
        this.records = [];
        this.autoId = 1;
    }

    normalizePhone(phone) {
        return String(phone || '').replace(/\D/g, '');
    }

    async getAll() {
        return [...this.records].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    async getPaginated(page = 1, pageSize = 20, search = '') {
        const query = (search || '').trim().toLowerCase();
        let list = [...this.records].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (query !== '') {
            list = list.filter((c) => {
                const name = (c.name || '').toLowerCase();
                const phone = (c.phone || '').toLowerCase();
                const email = (c.email || '').toLowerCase();
                return name.includes(query) || phone.includes(query) || email.includes(query);
            });
        }

        const totalContacts = list.length;
        const totalPages = Math.max(1, Math.ceil(totalContacts / pageSize));
        const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
        const start = (currentPage - 1) * pageSize;
        const contacts = list.slice(start, start + pageSize);

        return {
            contacts,
            totalContacts,
            totalPages,
            currentPage,
            pageSize
        };
    }

    async find(id) {
        return this.records.find(c => c.id === Number(id)) || null;
    }

    async add(data) {
        const name = (data.name || '').trim();
        const phone = this.normalizePhone(data.phone);
        const email = (data.email || '').trim();

        if (!name || !phone) {
            throw new Error('Name and phone are required.');
        }

        const duplicate = this.records.find(
            c => c.name.toLowerCase() === name.toLowerCase() && c.phone === phone
        );

        if (duplicate) {
            throw new Error('Contact with this name and phone already exists.');
        }

        const newRecord = {
            id: this.autoId++,
            name,
            phone,
            email: email !== '' ? email : null,
            created_at: new Date().toISOString()
        };

        this.records.push(newRecord);
        return newRecord;
    }

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

        const duplicate = this.records.find(
            c => c.id !== numId && c.name.toLowerCase() === name.toLowerCase() && c.phone === phone
        );

        if (duplicate) {
            throw new Error('Another contact with this name and phone already exists.');
        }

        existing.name = name;
        existing.phone = phone;
        existing.email = email !== '' ? email : null;
        existing.updated_at = new Date().toISOString();

        return { ...existing };
    }

    async delete(id) {
        const idx = this.records.findIndex(c => c.id === Number(id));
        if (idx > -1) {
            this.records.splice(idx, 1);
            return true;
        }
        return false;
    }

    async count() {
        return this.records.length;
    }
}

describe('Contact Database Logic (Dexie / Client Storage)', () => {
    let db;

    beforeEach(() => {
        db = new InMemoryContactStorage();
    });

    test('normalizes phone number to digits only', () => {
        assert.strictEqual(db.normalizePhone('0912-345-6789'), '09123456789');
        assert.strictEqual(db.normalizePhone('+98 (21) 8877'), '98218877');
    });

    test('adds a valid contact and returns record with ID', async () => {
        const contact = await db.add({
            name: 'نوید احمدزاده',
            phone: '09121234567',
            email: 'navid@test.com'
        });

        assert.strictEqual(contact.id, 1);
        assert.strictEqual(contact.name, 'نوید احمدزاده');
        assert.strictEqual(contact.phone, '09121234567');
        assert.strictEqual(await db.count(), 1);
    });

    test('rejects adding duplicate contact with same name and phone', async () => {
        await db.add({ name: 'Ali Reza', phone: '09120000000', email: '' });

        await assert.rejects(
            async () => {
                await db.add({ name: 'ali reza', phone: '09120000000' });
            },
            { message: 'Contact with this name and phone already exists.' }
        );
    });

    test('updates existing contact successfully', async () => {
        const added = await db.add({ name: 'Sarah', phone: '09191112233', email: 's@old.com' });
        const updated = await db.update(added.id, {
            name: 'Sarah Connor',
            phone: '09191112233',
            email: 'sarah@new.com'
        });

        assert.strictEqual(updated.name, 'Sarah Connor');
        assert.strictEqual(updated.email, 'sarah@new.com');
    });

    test('rejects updating contact if name & phone collide with another contact', async () => {
        await db.add({ name: 'User 1', phone: '09111111111' });
        const user2 = await db.add({ name: 'User 2', phone: '09222222222' });

        await assert.rejects(
            async () => {
                await db.update(user2.id, { name: 'User 1', phone: '09111111111' });
            },
            { message: 'Another contact with this name and phone already exists.' }
        );
    });

    test('deletes a contact', async () => {
        const contact = await db.add({ name: 'To Delete', phone: '09333333333' });
        assert.strictEqual(await db.count(), 1);

        const ok = await db.delete(contact.id);
        assert.strictEqual(ok, true);
        assert.strictEqual(await db.count(), 0);
    });

    test('filters contacts via search query across name, phone, or email', async () => {
        await db.add({ name: 'Navid', phone: '09121111111', email: 'navid@example.com' });
        await db.add({ name: 'Bob', phone: '09122222222', email: 'bob@example.com' });
        await db.add({ name: 'Charlie', phone: '09123333333', email: 'charlie@test.org' });

        const searchByName = await db.getPaginated(1, 10, 'Navid');
        assert.strictEqual(searchByName.totalContacts, 1);
        assert.strictEqual(searchByName.contacts[0].name, 'Navid');

        const searchByEmail = await db.getPaginated(1, 10, 'example.com');
        assert.strictEqual(searchByEmail.totalContacts, 2);

        const searchByPhone = await db.getPaginated(1, 10, '3333333');
        assert.strictEqual(searchByPhone.totalContacts, 1);
        assert.strictEqual(searchByPhone.contacts[0].name, 'Charlie');
    });

    test('handles pagination calculations properly', async () => {
        for (let i = 1; i <= 25; i++) {
            await db.add({ name: `Contact ${i}`, phone: `091000000${i.toString().padStart(2, '0')}` });
        }

        const page1 = await db.getPaginated(1, 10);
        assert.strictEqual(page1.totalContacts, 25);
        assert.strictEqual(page1.totalPages, 3);
        assert.strictEqual(page1.currentPage, 1);
        assert.strictEqual(page1.contacts.length, 10);

        const page3 = await db.getPaginated(3, 10);
        assert.strictEqual(page3.currentPage, 3);
        assert.strictEqual(page3.contacts.length, 5);
    });
});
