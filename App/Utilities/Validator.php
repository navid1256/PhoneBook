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

        // Check if the cleaned phone number has 10 digits
        if (strlen($cleanedPhone) === 10) {
            return true;
        }
        return false;
    }
}
