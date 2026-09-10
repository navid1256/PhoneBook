<?php

namespace MVC\PhoneBook\App\Models;

use MVC\PhoneBook\App\Models\Interface\MysqlBaseModel;

class Contact extends MysqlBaseModel
{
    protected $pageSize = 20;
    protected $table = 'contacts';
}
