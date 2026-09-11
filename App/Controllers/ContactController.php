<?php

namespace MVC\PhoneBook\App\Controllers;

use MVC\PhoneBook\App\Models\Contact;
use MVC\PhoneBook\App\Utilities\Validator;

class ContactController
{
    private $contactModel;
    public function __construct()
    {
        $this->contactModel = new Contact();
    }

    public function add()
    {
        global $request;
        if ($request->method() === 'POST') {

            //check if the contact already exists
            $contactExists = $this->contactModel->count(['name' => $_POST['name'], 'phone' => $_POST['phone']]);
            if ($contactExists > 0) {
                echo json_encode(['success' => false, 'message' => 'Contact already exists.']);
                return;
            }
            $name = isset($_POST['name']) ? trim((string) $_POST['name']) : '';
            $phone = isset($_POST['phone']) ? trim((string) $_POST['phone']) : '';
            $email = isset($_POST['email']) ? trim((string) $_POST['email']) : '';

            // Validate input data
            if (empty($name) || empty($phone)) {
                echo json_encode(['success' => false, 'message' => 'Name and phone are required.']);
                return;
            }
            if (!Validator::isValidPhoneNumber($phone)) {
                echo json_encode(['success' => false, 'message' => 'Invalid phone number format.']);
                return;
            }
            if (!empty($email) && !Validator::isValidEmail($email)) {
                echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
                return;
            }

            // Create a new contact
            $contactId = $this->contactModel->create([
                'name' => $name,
                'phone' => $phone,
                'email' => $email
            ]);

            if ($contactId) {
                echo json_encode(['success' => true, 'message' => 'Contact added successfully.', 'contact_id' => $contactId]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to add contact.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
        }
    }
}
