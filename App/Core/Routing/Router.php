<?php

namespace MVC\PhoneBook\App\Core\Routing;

use MVC\PhoneBook\App\Core\Request;

class Router
{
    private $request;
    private $routes;
    private $currentRoute;
    private const BASE_CONTROLLER_NAMESPACE = 'MVC\\PhoneBook\\App\\Controllers';

    public function __construct()
    {
        $this->request = new Request();
        // Make the request instance available to controllers/middleware via `global $request`
        $GLOBALS['request'] = $this->request;
        $this->routes = Route::routes();
        $this->currentRoute = $this->findRoute($this->request) ?? null;
        // Run Midlleware Here
        $this->runRouteMiddleware();
    }

    private function runRouteMiddleware()
    {
        if (!$this->currentRoute) {
            return;
        }

        foreach ($this->currentRoute['middleware'] as $middleware_class) {
            if (!class_exists($middleware_class)) {
                throw new RoutingException("Middleware class {$middleware_class} not found");
            }

            $middleware_obj = new $middleware_class;
            $middleware_obj->handle();
        }
    }

    public function findRoute(Request $request)
    {
        $requestMethod = $request->method();
        $requestUri = $request->uri();
        foreach ($this->routes as $route) {
            // Only consider routes that accept the current request method
            if (!in_array($requestMethod, $route['methods'], true)) {
                continue;
            }

            if ($requestUri === $route['uri'] || $this->regexMatched($route)) {
                return $route;
            }
        }
        return null;
    }

    public function regexMatched($route)
    {
        $segments = explode('/', trim($route['uri'], '/'));
        $patternSegments = [];
        foreach ($segments as $segment) {
            if (preg_match('/^\{([a-zA-Z_][a-zA-Z0-9_]*)\}$/', $segment, $parameter)) {
                $patternSegments[] = '(?P<' . $parameter[1] . '>[^/]+)';
            } else {
                $patternSegments[] = preg_quote($segment, '#');
            }
        }

        $pattern = '#^/' . implode('/', $patternSegments) . '/?$#';
        $resault = preg_match($pattern, $this->request->uri(), $matched);
        if (!$resault) {
            return false;
        }
        foreach ($matched as $key => $value) {
            if (!is_int($key)) {
                $this->request->addRouteParams($key, $value);
            }
        }
        return true;
    }

    private function dispatch(array $route): void
    {
        $action = $route['action'] ?? null;

        if ($action === null || $action === '') {
            return; // nothing to do
        }

        // 1) callable (closure or function name)
        if (is_callable($action)) {
            call_user_func($action);
            return;
        }

        // 2) string: either a function name or "Controller@method"
        if (is_string($action)) {
            // if it's a plain function name that's callable
            if (is_callable($action)) {
                call_user_func($action);
                return;
            }

            // controller@method
            if (strpos($action, '@') !== false) {
                [$controllerName, $method] = explode('@', $action) + [1 => null];

                if (empty($controllerName) || empty($method)) {
                    throw new RoutingException("Invalid action format: {$action}");
                }

                // allow short controller names like "Home" or "HomeController"
                if (!str_ends_with($controllerName, 'Controller')) {
                    $controllerName .= 'Controller';
                }

                $class = self::BASE_CONTROLLER_NAMESPACE . '\\' . $controllerName;

                if (!class_exists($class)) {
                    throw new RoutingException("Controller class {$class} not found");
                }

                $controller = new $class();

                if (!method_exists($controller, $method)) {
                    throw new RoutingException("Method {$method} not found in controller {$class}");
                }

                $controller->$method();
                return;
            }

            throw new RoutingException("Unknown action string: {$action}");
        }

        // 3) array: either callable ([$obj,'method']) or ['Controller','method']
        if (is_array($action)) {
            if (is_callable($action)) {
                call_user_func($action);
                return;
            }

            $controllerName = $action[0] ?? null;
            $method = $action[1] ?? null;

            if (empty($controllerName) || empty($method)) {
                throw new RoutingException('Invalid action array');
            }

            if (!str_ends_with($controllerName, 'Controller')) {
                $controllerName .= 'Controller';
            }

            $class = self::BASE_CONTROLLER_NAMESPACE . '\\' . $controllerName;

            if (!class_exists($class)) {
                throw new RoutingException("Controller class {$class} not found");
            }

            $controller = new $class();

            if (!method_exists($controller, $method)) {
                throw new RoutingException("Method {$method} not found in controller {$class}");
            }

            $controller->$method();
            return;
        }

        throw new RoutingException('Unsupported action type');
    }


    public function dispatch404()
    {
        view_error(404);
        die();
    }

    public function dispatch405()
    {
        view_error(405);
        die();
    }

    public function invalidRequestMethod()
    {
        $requestMethod = $this->request->method();
        foreach ($this->routes as $route) {
            if (in_array($requestMethod, $route['methods'], true)) {
                continue;
            }

            if ($this->request->uri() === $route['uri'] || $this->regexMatched($route)) {
                return true;
            }
        }
        return false;
    }

    public function run(): void
    {
        //405: Method Not Allowed
        if ($this->invalidRequestMethod()) {
            $this->dispatch405();
        }

        //404: Not Found
        if (!$this->currentRoute) {
            $this->dispatch404();
        }

        $this->dispatch($this->currentRoute);
    }
}
