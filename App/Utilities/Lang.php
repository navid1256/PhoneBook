<?php

namespace MVC\PhoneBook\App\Utilities;

class Lang
{
    public static function persianToLatinNum(string $key): string
    {
        $persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        $latinNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        return str_replace($persianNumbers, $latinNumbers, $key);
    }

    public static function latinToPersianNum(string $key): string
    {
        $latinNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        $persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

        return str_replace($latinNumbers, $persianNumbers, $key);
    }
}
