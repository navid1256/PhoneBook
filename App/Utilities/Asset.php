<?php

namespace MVC\PhoneBook\App\Utilities;

class Asset
{
    public static function get(string $route): string
    {
        return rtrim($_ENV['BASE_URL'], '/') . '/' . ltrim($route, '/');
    }

    public static function __callStatic(string $name, array $arguments)
    {
        return rtrim($_ENV['BASE_URL'], '/') . '/Assets/' . ltrim($name, '/') . '/' . ltrim($arguments[0], '/');
    }
}
