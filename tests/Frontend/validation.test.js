import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Pure logic extracted from Assets/js/index.js for unit testing
function isValidName(name) {
    var regex = /^[\p{L}\p{N}]+(?:[ _-][\p{L}\p{N}]+)*$/u;
    return regex.test((name || '').trim());
}

function isValidPhone(phone) {
    var cleaned = String(phone || '').replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 12;
}

function isValidEmail(email) {
    var trimmed = (email || '').trim();
    if (trimmed === '') return true; // Optional field
    var regex = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
    return regex.test(trimmed);
}

describe('Frontend Form Validations', () => {
    describe('Name Validation', () => {
        test('accepts English names', () => {
            assert.strictEqual(isValidName('John Doe'), true);
            assert.strictEqual(isValidName('Alice'), true);
        });

        test('accepts Persian / Arabic names', () => {
            assert.strictEqual(isValidName('نوید احمدزاده'), true);
            assert.strictEqual(isValidName('علی رضا'), true);
            assert.strictEqual(isValidName('محمد'), true);
        });

        test('rejects empty or whitespace-only names', () => {
            assert.strictEqual(isValidName(''), false);
            assert.strictEqual(isValidName('   '), false);
            assert.strictEqual(isValidName(null), false);
        });

        test('rejects names with illegal special characters', () => {
            assert.strictEqual(isValidName('John@Doe'), false);
            assert.strictEqual(isValidName('Test!'), false);
            assert.strictEqual(isValidName('<script>'), false);
        });
    });

    describe('Phone Validation (10 to 12 digits)', () => {
        test('accepts valid 10-digit number', () => {
            assert.strictEqual(isValidPhone('0218877665'), true);
        });

        test('accepts valid 11-digit Iranian mobile number', () => {
            assert.strictEqual(isValidPhone('09121234567'), true);
            assert.strictEqual(isValidPhone('09351112233'), true);
        });

        test('accepts valid 12-digit international format', () => {
            assert.strictEqual(isValidPhone('989121234567'), true);
        });

        test('strips non-digits and validates length', () => {
            assert.strictEqual(isValidPhone('0912-123-4567'), true);
            assert.strictEqual(isValidPhone('(021) 8877 6655'), true);
        });

        test('rejects numbers shorter than 10 digits', () => {
            assert.strictEqual(isValidPhone('123456789'), false);
            assert.strictEqual(isValidPhone('0912'), false);
            assert.strictEqual(isValidPhone(''), false);
        });

        test('rejects numbers longer than 12 digits', () => {
            assert.strictEqual(isValidPhone('09121234567890'), false);
            assert.strictEqual(isValidPhone('1234567890123'), false);
        });
    });

    describe('Email Validation (Optional)', () => {
        test('accepts empty string since email is optional', () => {
            assert.strictEqual(isValidEmail(''), true);
            assert.strictEqual(isValidEmail('   '), true);
            assert.strictEqual(isValidEmail(null), true);
        });

        test('accepts valid email addresses', () => {
            assert.strictEqual(isValidEmail('user@example.com'), true);
            assert.strictEqual(isValidEmail('navid.ahmadzade@gmail.com'), true);
            assert.strictEqual(isValidEmail('test_user+tag@domain.co'), true);
        });

        test('rejects invalid email formats', () => {
            assert.strictEqual(isValidEmail('plainaddress'), false);
            assert.strictEqual(isValidEmail('missing@domain'), false);
            assert.strictEqual(isValidEmail('@missinguser.com'), false);
            assert.strictEqual(isValidEmail('user@.com'), false);
        });
    });
});
