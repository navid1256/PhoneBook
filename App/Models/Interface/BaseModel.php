<?php

namespace MVC\PhoneBook\App\Models\Interface;

abstract class BaseModel implements CrudInterface
{
    protected $connection;
    protected $table;
    protected $primaryKey = 'id';
    protected $pageSize;
    protected $attributes = [];

    protected function __construct()
    {
        throw new \Exception('Not implemented');
    }

    protected function getAttribute($property)
    {
        if (!$property || !array_key_exists($property, $this->attributes)) {
            return null;
        }
        return $this->attributes[$property];
    }

    protected function setAttribute($property, $value)
    {
        $this->attributes[$property] = $value;
    }

    public function __get($property)
    {
        return $this->getAttribute($property);
    }

    public function __set($property, $value)
    {
        if (!array_key_exists($property, $this->attributes)) {
            throw new \Exception("Property {$property} does not exist.");
        }
        $this->setAttribute($property, $value);
    }
}
