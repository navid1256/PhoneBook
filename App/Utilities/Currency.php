<?php

namespace MVC\PhoneBook\App\Utilities;

class Currency
{
    public static function format(float $amount, string $currency = 'USD'): string
    {
        return number_format($amount, 2) . ' ' . strtoupper($currency);
    }

    public static function rialToToman(float $amount): float
    {
        return $amount / 10;
    }

    public static function tomanToRial(float $amount): float
    {
        return $amount * 10;
    }
}
