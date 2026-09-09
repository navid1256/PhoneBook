<?php

namespace MVC\PhoneBook\App\Core\Routing;

class Route
{
    private static $routes = [];

    public static function add($methods, $uri, $action = null, $middleware = [])
    {
        $methods = is_array($methods) ? $methods : [$methods];
        // Normalize method names to uppercase for reliable comparisons
        $methods = array_map('strtoupper', $methods);
        self::$routes[] = ['methods' => $methods, 'uri' => $uri, 'action' => $action, 'middleware' => $middleware];
    }

    public static function get($uri, $action = null, $middleware = [])
    {
        self::add('GET', $uri, $action, $middleware);
    }

    public static function post($uri, $action = null, $middleware = [])
    {
        self::add('POST', $uri, $action, $middleware);
    }

    public static function put($uri, $action = null, $middleware = [])
    {
        self::add('PUT', $uri, $action, $middleware);
    }

    public static function patch($uri, $action = null, $middleware = [])
    {
        self::add('PATCH', $uri, $action, $middleware);
    }

    public static function delete($uri, $action = null, $middleware = [])
    {
        self::add('DELETE', $uri, $action, $middleware);
    }

    public static function routes()
    {
        return self::$routes;
    }
}
