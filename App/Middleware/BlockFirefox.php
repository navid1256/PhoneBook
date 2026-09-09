<?php

namespace MVC\PhoneBook\App\Middleware;

use MVC\PhoneBook\App\Middleware\Interface\MiddlewareInterface;
use hisorange\BrowserDetect\Parser;


class BlockFirefox implements MiddlewareInterface
{
    public function handle()
    {
        global $request;
        $browser = new Parser();
        if ($browser->isFirefox()) {
            die("firefox Is Blocked");
        }
    }
}
