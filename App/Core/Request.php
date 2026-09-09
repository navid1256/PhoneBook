<?php

namespace MVC\PhoneBook\App\Core;

class Request
{
    private $params;
    private $route_params = [];
    private $method;
    private $agent;
    private $ip;
    private $uri;

    public function __construct()
    {
        $this->params = $_REQUEST;
        $this->method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $this->agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $this->ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $this->uri = strtok($_SERVER['REQUEST_URI'] ?? '/', '?');

        $base = parse_url($_ENV['BASE_URL'] ?? '', PHP_URL_PATH) ?: '';
        $base = '/' . trim($base, '/');
        if ($base !== '/' && str_starts_with($this->uri, $base)) {
            $this->uri = substr($this->uri, strlen($base));
        }

        $this->uri = '/' . trim($this->uri, '/');
    }

    public function addRouteParams($key, $value)
    {

        $this->route_params[$key] = $value;
    }

    public function getRouteParam($key)
    {
        return $this->route_params[$key];
    }
    public function params()
    {
        return $this->params;
    }

    public function method()
    {
        return $this->method;
    }

    public function agent()
    {
        return $this->agent;
    }

    public function ip()
    {
        return $this->ip;
    }

    public function uri()
    {
        return $this->uri;
    }

    public function input($key)
    {
        return $this->params[$key] ?? null;
    }

    public function isset($key)
    {
        return isset($this->params[$key]);
    }

    public function redirect($route)
    {
        header("Location: " . site_url($route));
    }

    public function __get(mixed $name)
    {
        return $this->params[$name] ?? null;
    }
}
