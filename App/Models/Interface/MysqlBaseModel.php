<?php

namespace MVC\PhoneBook\App\Models\Interface;

use Exception;
use Medoo\Medoo;

class MysqlBaseModel extends BaseModel
{

    public function __construct($id = null)
    {
        try {
            $this->connection = new Medoo([
                'type' => 'mysql',
                'database' => $_ENV['DB_NAME'],
                'host' => $_ENV['DB_HOST'],
                'username' => $_ENV['DB_USER'],
                'password' => $_ENV['DB_PASS'],
                'charset' => 'utf8mb4',
            ]);
        } catch (Exception $e) {
            echo "Connection Failed" . $e->getMessage();
        }

        if (!is_null($id)) {
            return $this->find($id);
        }
    }


    //create
    public function create(array $data): int
    {
        $this->connection->insert($this->table, $data);
        return (int)$this->connection->id();
    }

    //update
    public function update(array $data, array $where): int
    {
        return $this->connection->update($this->table, $data, $where)->rowCount();
    }

    //read
    public function find(int $id): object
    {
        $record = (object)$this->connection->get($this->table, '*', [$this->primaryKey => $id]);
        foreach ($record as $col => $val) {
            $this->attributes[$col] = $val;
        }
        return (object)$record;
    }

    public function get(mixed $columns, array $where): array
    {
        $page = (isset($_GET['page']) && is_numeric($_GET['page']) && $_GET['page'] > 0) ? (int)$_GET['page'] : 1;

        $start = ($page - 1) * $this->pageSize;
        $where['LIMIT'] = [$start, $this->pageSize];

        return $this->connection->select($this->table, $columns, $where);
    }

    public function getAll(): array
    {
        return $this->get('*', []);
    }

    public function count(array $where = []): int
    {
        return (int) $this->connection->count($this->table, $where);
    }

    public function getPageSize(): int
    {
        return $this->pageSize;
    }

    //delete
    public function delete(int $id): bool
    {
        return $this->connection->delete($this->table, [$this->primaryKey => $id])->rowCount() > 0;
    }

    //sumn
    public function sum(string $column, array $where): float
    {
        return (float)$this->connection->sum($this->table, $column, $where);
    }

    public function remove(): bool
    {
        $record_id = $this->getAttribute($this->primaryKey);
        return $this->delete($record_id);
    }

    public function save(): int
    {
        $record_id = $this->getAttribute($this->primaryKey);
        return $this->update($this->attributes, [$this->primaryKey => $record_id]);
    }
}
