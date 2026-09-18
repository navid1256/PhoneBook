<?php

namespace Tests\Backend\Unit;

use Tests\Backend\TestCase;
use MVC\PhoneBook\App\Utilities\Validator;

class ValidatorTest extends TestCase
{
    public function testValidEmailAcceptsStandardEmails(): void
    {
        $this->assertTrue(Validator::isValidEmail('test@example.com'));
        $this->assertTrue(Validator::isValidEmail('user.name+tag@domain.co.uk'));
        $this->assertTrue(Validator::isValidEmail('navid1256@gmail.com'));
    }

    public function testInvalidEmailRejectsMalformedAddresses(): void
    {
        $this->assertFalse(Validator::isValidEmail('plainaddress'));
        $this->assertFalse(Validator::isValidEmail('missing-domain@'));
        $this->assertFalse(Validator::isValidEmail('@missing-user.com'));
        $this->assertFalse(Validator::isValidEmail('user@domain@domain.com'));
    }

    public function testValidPhoneNumberAccepts10To12Digits(): void
    {
        // 10 digits (e.g. landline)
        $this->assertTrue(Validator::isValidPhoneNumber('0218877665'));

        // 11 digits (Iranian mobile 09xxxxxxxxx)
        $this->assertTrue(Validator::isValidPhoneNumber('09121234567'));
        $this->assertTrue(Validator::isValidPhoneNumber('09351112233'));

        // 12 digits (with country code)
        $this->assertTrue(Validator::isValidPhoneNumber('989121234567'));
    }

    public function testPhoneNumberStripsPunctuationAndDashes(): void
    {
        $this->assertTrue(Validator::isValidPhoneNumber('0912-123-4567'));
        $this->assertTrue(Validator::isValidPhoneNumber('+98 (912) 123 4567'));
    }

    public function testInvalidPhoneNumberRejectsShorterOrLongerStrings(): void
    {
        // Too short (< 10 digits)
        $this->assertFalse(Validator::isValidPhoneNumber('123456789'));
        $this->assertFalse(Validator::isValidPhoneNumber('0912'));

        // Too long (> 12 digits)
        $this->assertFalse(Validator::isValidPhoneNumber('09121234567890'));
        $this->assertFalse(Validator::isValidPhoneNumber('1234567890123'));
    }
}
