<?php

namespace MVC\PhoneBook\App\Utilities;

class Validator
{
    public static function isValidEmail(string $email)
    {
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return true;
        }
        return false;
    }

    public static function isValidPhoneNumber(string $phone)
    {
        // Remove any non-digit characters
        $cleanedPhone = preg_replace('/\D/', '', $phone);

        // Accept 10-12 digits (matches the client-side validation in index.js):
        // covers 10-digit local numbers, 11-digit Iranian mobile (09xxxxxxxxx),
        // and international numbers with country code.
        $length = strlen($cleanedPhone);
        return $length >= 10 && $length <= 12;
    }
}
