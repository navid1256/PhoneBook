<?php


use MVC\PhoneBook\App\Core\Routing\Route;

Route::get('/', 'HomeController@index');
Route::post('/contact/add', 'ContactController@add');
Route::put('/contact/update/{id}', 'ContactController@update');
Route::delete('/contact/delete/{id}', 'ContactController@delete');
