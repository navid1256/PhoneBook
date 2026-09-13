<?php

namespace MVC\PhoneBook\App\Models\Interface;

interface CrudInterface
{
    public function create(array $data): int;

    public function update(array $data, array $where): int;

    public function find(int $id): object;

    public function get(mixed $columns, array $where): array;

    public function delete(int $id): bool;
}
