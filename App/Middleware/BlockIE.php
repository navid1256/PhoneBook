<?php

namespace MVC\PhoneBook\App\Middleware;

use MVC\PhoneBook\App\Middleware\Interface\MiddlewareInterface;
use hisorange\BrowserDetect\Parser;

class BlockIE implements MiddlewareInterface
{
    public function handle()
    {
        global $request;
        $browser = new Parser();
        if ($browser->isIE()) {
            die("InternetExplorer Is Blocked");
        }
    }
}
