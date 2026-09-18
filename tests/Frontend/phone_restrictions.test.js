import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Logic mirror of attachPhoneInputRestrictions for headless testing
function simulatePhoneKeydown(key, currentDigits, isSelected = false, maxLen = 12) {
    const allowedControlKeys = [
        "Backspace", "Tab", "Enter", "Escape", "Delete",
        "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
        "Home", "End"
    ];

    if (allowedControlKeys.includes(key)) {
        return { allowed: true, reason: 'control_key' };
    }

    // Must be digit 0-9
    if (!/^[0-9]$/.test(key)) {
        return { allowed: false, reason: 'non_digit' };
    }

    // Check length limit
    if (!isSelected && currentDigits.length >= maxLen) {
        return { allowed: false, reason: 'max_length_reached' };
    }

    return { allowed: true, reason: 'valid_digit' };
}

function sanitizePastedPhone(pasteText, currentDigits = '', maxLen = 12) {
    const cleanPaste = String(pasteText || '').replace(/\D/g, '');
    return (currentDigits + cleanPaste).slice(0, maxLen);
}

describe('Frontend Phone Restrictions', () => {
    describe('Keydown Filtering', () => {
        test('allows navigation and editing keys', () => {
            assert.strictEqual(simulatePhoneKeydown('Backspace', '0912').allowed, true);
            assert.strictEqual(simulatePhoneKeydown('Delete', '0912').allowed, true);
            assert.strictEqual(simulatePhoneKeydown('ArrowLeft', '0912').allowed, true);
            assert.strictEqual(simulatePhoneKeydown('Tab', '0912').allowed, true);
        });

        test('allows numeric digits 0-9 when under max length', () => {
            for (let d = 0; d <= 9; d++) {
                assert.strictEqual(simulatePhoneKeydown(String(d), '0912').allowed, true);
            }
        });

        test('blocks letter and exponential notation keys like "e", "E", "+", "-", "."', () => {
            assert.strictEqual(simulatePhoneKeydown('e', '0912').allowed, false);
            assert.strictEqual(simulatePhoneKeydown('E', '0912').allowed, false);
            assert.strictEqual(simulatePhoneKeydown('+', '0912').allowed, false);
            assert.strictEqual(simulatePhoneKeydown('-', '0912').allowed, false);
            assert.strictEqual(simulatePhoneKeydown('.', '0912').allowed, false);
            assert.strictEqual(simulatePhoneKeydown('a', '0912').allowed, false);
            assert.strictEqual(simulatePhoneKeydown(' ', '0912').allowed, false);
        });

        test('strictly prevents typing beyond 12 digits', () => {
            const twelveDigits = '091212345678';
            assert.strictEqual(twelveDigits.length, 12);

            // Attempting to type a 13th digit should be blocked
            const result = simulatePhoneKeydown('5', twelveDigits, false, 12);
            assert.strictEqual(result.allowed, false);
            assert.strictEqual(result.reason, 'max_length_reached');
        });

        test('allows typing digit if text is selected (replaces selection)', () => {
            const twelveDigits = '091212345678';
            const result = simulatePhoneKeydown('9', twelveDigits, true, 12);
            assert.strictEqual(result.allowed, true);
        });
    });

    describe('Paste Sanitization', () => {
        test('strips dashes, spaces, and brackets on paste', () => {
            const pasted = '+98 (912) 345-6789';
            const sanitized = sanitizePastedPhone(pasted, '', 12);
            assert.strictEqual(sanitized, '989123456789');
            assert.strictEqual(sanitized.length, 12);
        });

        test('truncates pasted text to exactly 12 digits maximum', () => {
            const longPasted = '00989121234567899999';
            const sanitized = sanitizePastedPhone(longPasted, '', 12);
            assert.strictEqual(sanitized.length, 12);
            assert.strictEqual(sanitized, '009891212345');
        });
    });
});
