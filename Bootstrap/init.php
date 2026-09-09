<?php

define("BASEPATH", __DIR__ . "/../");

include_once BASEPATH . "/vendor/autoload.php";
include_once BASEPATH . "/helpers/helpers.php";
include_once BASEPATH . "/routes/web.php";

$dotenv = Dotenv\Dotenv::createImmutable(BASEPATH);
$dotenv->load();
