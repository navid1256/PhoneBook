<?php


namespace MVC\PhoneBook\App\Models\Interface;


class JsonBaseModel extends BaseModel
{
    private $db_folder;
    private $table_filepath;

    public function __construct()
    {
        $this->db_folder = BASEPATH . "/storage/Json/";
        $this->table_filepath = $this->db_folder . $this->table . '.json';
    }

    private function writeTable(array $data): void
    {
        $dataJson = json_encode($data, JSON_PRETTY_PRINT);
        file_put_contents($this->table_filepath, $dataJson);
    }

    private function readTable(): array
    {
        return json_decode(file_get_contents($this->table_filepath), true);
    }

    public function getAll(): array
    {
        return $this->readTable();
    }

    //create
    public function create(array $data): int
    {
        $table_data = $this->readTable();
        $table_data[] = $data;
        $this->writeTable($table_data);
        return 1;
    }

    //update
    public function update(array $data, array $where): int
    {

        $table_data = $this->readTable();
        foreach ($table_data as &$row) {
            $match = true;
            foreach ($where as $key => $value) {
                if (!isset($row[$key]) || $row[$key] != $value) {
                    $match = false;
                    break;
                }
            }
            if ($match) {
                foreach ($data as $key => $value) {
                    $row[$key] = $value;
                }
            }
        }
        unset($row); // Break the reference with the last element
        $this->writeTable($table_data);
        return 1;
    }

    //read
    public function find(int $id): object
    {
        $table_data = $this->readTable();
        foreach ($table_data as $row) {
            if (isset($row['id']) && $row->{$this->primaryKey} == $id) {
                return (object) $row;
            }
        }
        return (object) [];
    }
    public function get(array $columns, array $where): array
    {
        $table_data = $this->readTable();
        $result = [];
        foreach ($table_data as $row) {
            $match = true;
            foreach ($where as $key => $value) {
                if (!isset($row[$key]) || $row[$key] != $value) {
                    $match = false;
                    break;
                }
            }
            if ($match) {
                $filtered_row = [];
                foreach ($columns as $column) {
                    if (isset($row[$column])) {
                        $filtered_row[$column] = $row[$column];
                    }
                }
                $result[] = (object) $filtered_row;
            }
        }
        return $result;
    }

    //delete
    public function delete(array $where): int
    {
        $table_data = $this->readTable();
        $updated_data = [];
        foreach ($table_data as $row) {
            $match = true;
            foreach ($where as $key => $value) {
                if (!isset($row[$key]) || $row[$key] != $value) {
                    $match = false;
                    break;
                }
            }
            if (!$match) {
                $updated_data[] = $row;
            }
        }
        $this->writeTable($updated_data);
        return 1;
    }
}
