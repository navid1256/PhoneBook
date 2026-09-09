<?php

namespace MVC\PhoneBook\App\Models;

use MVC\PhoneBook\App\Models\Interface\MysqlBaseModel;

class Contact extends MysqlBaseModel
{
    protected $table = 'users';
}
