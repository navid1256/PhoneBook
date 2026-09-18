<?php
require_once __DIR__ . '/Bootstrap/init.php';

$router = new MVC\PhoneBook\App\Core\Routing\Router();
$router->run();
