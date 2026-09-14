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
        header('Content-Type: application/json');
        if ($request->method() === 'POST') {

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
            // Normalize to digits only (same rule as Validator): keeps the value
            // within the phone column size (varchar(12)) and makes duplicate
            // detection independent of formatting (+98 ... vs 0912...).
            $phone = preg_replace('/\D/', '', $phone);
            if (!empty($email) && !Validator::isValidEmail($email)) {
                echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
                return;
            }

            //check if the contact already exists
            $contactExists = $this->contactModel->count(['name' => $name, 'phone' => $phone]);
            if ($contactExists > 0) {
                echo json_encode(['success' => false, 'message' => 'Contact already exists.']);
                return;
            }

            // Create a new contact (email is optional: store NULL when empty)
            $contactId = $this->contactModel->create([
                'name' => $name,
                'phone' => $phone,
                'email' => $email !== '' ? $email : null
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

    public function update()
    {
        global $request;
        header('Content-Type: application/json');
        if ($request->method() === 'PUT') {
            // The router does not pass route params to the action, so read
            // the {id} segment (e.g. /contact/update/5) from the request.
            $id = (int) $request->getRouteParam('id');

            if ($id <= 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid contact id.']);
                return;
            }

            // PHP does NOT populate $_POST for PUT requests: read and parse
            // the raw request body ourselves (sent as urlencoded by fetch).
            parse_str(file_get_contents('php://input'), $putData);

            $name = isset($putData['name']) ? trim((string) $putData['name']) : '';
            $phone = isset($putData['phone']) ? trim((string) $putData['phone']) : '';
            $email = isset($putData['email']) ? trim((string) $putData['email']) : '';

            // Validate input data (same rules as add)
            if (empty($name) || empty($phone)) {
                echo json_encode(['success' => false, 'message' => 'Name and phone are required.']);
                return;
            }
            if (!Validator::isValidPhoneNumber($phone)) {
                echo json_encode(['success' => false, 'message' => 'Invalid phone number format.']);
                return;
            }
            $phone = preg_replace('/\D/', '', $phone);
            if (!empty($email) && !Validator::isValidEmail($email)) {
                echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
                return;
            }

            // Does this contact exist at all?
            $exists = $this->contactModel->find($id);
            if (!isset($exists->id)) {
                echo json_encode(['success' => false, 'message' => 'Contact not found.']);
                return;
            }

            // Would this update collide with an existing contact (same name+phone)?
            $duplicate = $this->contactModel->count([
                'name' => $name,
                'phone' => $phone,
                "id[!]" => $id,
            ]);
            if ($duplicate > 0) {
                echo json_encode(['success' => false, 'message' => 'Contact already exists.']);
                return;
            }

            // Medoo's update() returns the affected row count, but we ignore it:
            // it is 0 when the new values equal the old ones, which is still a
            // successful save (all validation already passed above).
            $this->contactModel->update([
                'name' => $name,
                'phone' => $phone,
                'email' => $email !== '' ? $email : null
            ], ['id' => $id]);

            echo json_encode(['success' => true, 'message' => 'Contact updated successfully.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
        }
    }

    public function delete()
    {
        global $request;
        header('Content-Type: application/json');
        if ($request->method() === 'DELETE') {
            // The router does not pass route params to the action, so read
            // the {id} segment (e.g. /contact/delete/5) from the request.
            $id = (int) $request->getRouteParam('id');

            if ($id <= 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid contact id.']);
                return;
            }

            $deleted = $this->contactModel->delete($id);

            if ($deleted) {
                echo json_encode(['success' => true, 'message' => 'Contact deleted successfully.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Contact not found.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
        }
    }
}
