<?php

function site_url($url = "")
{
    return rtrim($_ENV['BASE_URL'], '/') . '/' . ltrim($url, '/');
}

function asset_url($url = "")
{
    return rtrim($_ENV['BASE_URL'], '/') . "/Assets/" . ltrim($url, '/');
}

function random_element($array)
{
    shuffle($array);
    return array_pop($array);
}

function view_error($code)
{
    http_response_code($code);

    $viewPath = BASEPATH . "views/errors/{$code}.php";

    if (file_exists($viewPath)) {
        include_once $viewPath;
        exit;
    }

    echo "{$code} Error";
    die();
}

function view_archive($view, $data = [])
{
    $viewPath = BASEPATH . "views/archive/{$view}.php";

    if (file_exists($viewPath)) {
        extract($data);
        include_once $viewPath;
        exit;
    }

    echo "View {$view} not found!";
    die();
}

function view($path, $data = [])
{
    extract($data);
    $path = str_replace('.', '/', $path);
    $view_directory = BASEPATH . "views/";
    $view_full_path = $view_directory . $path . ".php";

    if (!file_exists($view_full_path)) {
        $view_full_path = $view_directory . $path . ".html";
    }

    if (!file_exists($view_full_path)) {
        view_error(404);
    }

    include_once $view_full_path;
}
