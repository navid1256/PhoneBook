<?php

namespace MVC\PhoneBook\App\Utilities;

class Url
{
    public static function current(): string
    {
        $actual_link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
        return $actual_link;
    }

    public static function query_parameter(): string
    {
        return (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
    }

    public static function current_route()
    {
        $route = strtok($_SERVER['REQUEST_URI'], '?');
        return $route;
    }
}
