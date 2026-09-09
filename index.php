<?php
include_once __DIR__ . "\\Bootstrap\\init.php";

use MVC\PhoneBook\App\Models\User;
use MVC\PhoneBook\App\Models\Product;
// $userModel = new User;

$router = new MVC\PhoneBook\App\Core\Routing\Router();
$router->run();
