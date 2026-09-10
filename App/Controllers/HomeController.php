<?php

namespace MVC\PhoneBook\App\Controllers;

use MVC\PhoneBook\App\Models\Contact;

class HomeController
{
    private $contactModel;
    public function __construct()
    {
        $this->contactModel = new Contact();
    }

    public function index()
    {
        global $faker;
        global $request;
        $faker = \Faker\Factory::create('fa_IR');

        $prefix = $faker->randomElement([
            '0901',
            '0902',
            '0903',
            '0910',
            '0911',
            '0912',
            '0913',
            '0914',
            '0915',
            '0916',
            '0917',
            '0918',
            '0919',
            '0920',
            '0930',
            '0935'
        ]);

        $phone = $prefix . $faker->numerify('#######');
        // for ($i = 0; $i < 10; $i++) {
        //     $this->contactModel->create([
        //         'name' => $faker->name(),
        //         'mobile' => $phone,
        //         'email' => $faker->email()
        //     ]);
        // }

        $contacts = $this->contactModel->getAll();
        $totalContacts = $this->contactModel->count();
        $pageSize = $this->contactModel->getPageSize();
        $currentPage = (isset($_GET['page']) && is_numeric($_GET['page']) && (int) $_GET['page'] > 0)
            ? (int) $_GET['page']
            : 1;
        $totalPages = max(1, (int) ceil($totalContacts / $pageSize));
        $currentPage = min($currentPage, $totalPages);

        view('home.index', compact(
            'contacts',
            'currentPage',
            'totalPages'
        ));
    }
}
