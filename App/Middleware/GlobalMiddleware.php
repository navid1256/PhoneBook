<?php

namespace MVC\PhoneBook\App\Middleware;

use MVC\PhoneBook\App\Middleware\Interface\MiddlewareInterface;

class GlobalMiddleware implements MiddlewareInterface
{
    public function handle()
    {
        $this->blockChinaIp();
        $this->setCorsHeaders();
        $this->sanitizeGetParams();
    }

    private function ipInRange($ip, $range)
    {
        list($subnet, $bits) = explode('/', $range);
        $ip = ip2long($ip);
        $subnet = ip2long($subnet);
        $mask = -1 << (32 - $bits);
        $subnet &= $mask;

        return ($ip & $mask) === $subnet;
    }

    public function blockChinaIp()
    {
        $chinaIpRanges = [
            '1.0.0.0/8',
            '10.0.0.0/8',
            '172.16.0.0/12',
            '192.168.0.0/16'
        ];

        $userIp = $_SERVER['REMOTE_ADDR'];

        foreach ($chinaIpRanges as $ipRange) {
            if (filter_var($userIp, FILTER_VALIDATE_IP) && $this->ipInRange($userIp, $ipRange)) {
                http_response_code(403);
                echo "Access denied.";
                exit();
            }
        }
    }

    public function setCorsHeaders()
    {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    }

    public function sanitizeGetParams()
    {
        foreach ($_GET as $key => $value) {
            $_GET[$key] = xss_cleaner($value);
        }
    }
}
