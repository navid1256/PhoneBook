<?php

namespace Tests\Backend\Unit;

use Tests\Backend\TestCase;
use MVC\PhoneBook\App\Models\Contact;

class ContactModelTest extends TestCase
{
    private Contact $model;

    protected function setUp(): void
    {
        parent::setUp();
        $this->model = new Contact();
    }

    public function testContactModelCanCount(): void
    {
        $count = $this->model->count();
        $this->assertIsInt($count);
        $this->assertGreaterThanOrEqual(0, $count);
    }

    public function testContactModelCrudCycle(): void
    {
        $testName = 'Test User ' . uniqid();
        $testPhone = '0912' . mt_rand(1000000, 9999999);
        $testEmail = 'test_' . uniqid() . '@example.com';

        // 1. Create
        $id = $this->model->create([
            'name' => $testName,
            'phone' => $testPhone,
            'email' => $testEmail,
        ]);

        $this->assertIsInt($id);
        $this->assertGreaterThan(0, $id);

        try {
            // 2. Read / Find
            $contact = $this->model->find($id);
            $this->assertNotNull($contact);
            $this->assertSame($testName, $contact->name);
            $this->assertSame($testPhone, $contact->phone);
            $this->assertSame($testEmail, $contact->email);

            // 3. Update
            $updatedName = $testName . ' (Updated)';
            $affected = $this->model->update(
                ['name' => $updatedName],
                ['id' => $id]
            );
            $this->assertSame(1, $affected);

            $updatedContact = $this->model->find($id);
            $this->assertSame($updatedName, $updatedContact->name);
        } finally {
            // 4. Delete (cleanup)
            $deleted = $this->model->delete($id);
            $this->assertTrue($deleted);
        }
    }
}
