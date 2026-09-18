<?php

namespace Tests\Backend\Unit;

use Tests\Backend\TestCase;
use MVC\PhoneBook\App\Core\Routing\Route;

class RouterTest extends TestCase
{
    public function testRouteCanRegisterGet(): void
    {
        $initialCount = count(Route::routes());
        Route::get('/test-route-get', 'TestController@index');
        $routes = Route::routes();

        $this->assertCount($initialCount + 1, $routes);
        $last = end($routes);

        $this->assertContains('GET', $last['methods']);
        $this->assertSame('/test-route-get', $last['uri']);
        $this->assertSame('TestController@index', $last['action']);
    }

    public function testRouteCanRegisterPostPutDelete(): void
    {
        Route::post('/test-post', 'TestController@store');
        Route::put('/test-put', 'TestController@update');
        Route::delete('/test-delete', 'TestController@destroy');

        $routes = Route::routes();
        $methods = array_column($routes, 'methods');

        $foundPost = false;
        $foundPut = false;
        $foundDelete = false;

        foreach ($routes as $route) {
            if ($route['uri'] === '/test-post' && in_array('POST', $route['methods'])) {
                $foundPost = true;
            }
            if ($route['uri'] === '/test-put' && in_array('PUT', $route['methods'])) {
                $foundPut = true;
            }
            if ($route['uri'] === '/test-delete' && in_array('DELETE', $route['methods'])) {
                $foundDelete = true;
            }
        }

        $this->assertTrue($foundPost);
        $this->assertTrue($foundPut);
        $this->assertTrue($foundDelete);
    }
}
