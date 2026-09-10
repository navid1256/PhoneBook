<?php
/* array of contacts */ ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phone Book</title>

    <link rel="stylesheet" href="<?php echo asset_url('css/bootstrap.min.css'); ?>" />
    <link rel="stylesheet" href="<?php echo asset_url('css/all.min.css'); ?>" />
    <link rel="stylesheet" href="<?php echo asset_url('css/index_style.css'); ?>?v=2" />

</head>

<body>



    <div class="jumbotron jum">

        <div class=" navbar">
            <h3>Phone Book <i class="far fa-address-book"></i></h3>

        </div>


        <div class="row">


            <div class="col-lg-4 inp">

                <input onkeyup="searchFunction()" id="myInput" class="form-control mt-2" placeholder="search">
                <span class="icon text-primary"><i class="fas fa-search"></i></span>

                <h5 class="mt-2">Add New Contact</h5>

                <input onblur="validateName()" class="form-control mb-3 mt-3" placeholder="add name" id="userName">
                <div id="nameAlert" class="alert alert-danger text-justify p-2 ">Please add name</div>
                <input onblur="validatePhone()" class="form-control mb-3" placeholder="add phone" id="userPhone">
                <div id="phoneAlert" class="alert alert-danger text-justify p-2 ">Please add a valid number</div>
                <input onblur="validateEmail()" class="form-control mb-3" placeholder="add e-mail" id="userEmail">
                <div id="mailAlert" class="alert alert-danger text-justify p-2 ">Please add a valid e-mail</div>

                <button onclick="addContact()" class="btn btn-info w-100 btn1">Add</button>


            </div>


            <div class="col-lg-8">

                <table id="myTable" class="table text-justify table-striped">

                    <thead class="tableh1">
                        <th class="">Name</th>
                        <th class="">Phone</th>
                        <th class="">E-mail</th>
                        <th class="col-1">Edit</th>
                        <th class="col-1">Delete</th>
                    </thead>

                    <tbody id="tableBody">
                        <?php foreach ($contacts as $contact) : ?>
                            <tr>
                                <td class="name"><?php echo $contact['name']; ?></td>
                                <td class="phone"><?php echo $contact['phone']; ?></td>
                                <td class="email"><?php echo $contact['email']; ?></td>
                                <td><button onclick="editContact(this)" class="contact-action contact-action-edit" aria-label="Edit contact" title="Edit"><i class="fas fa-edit"></i></button></td>
                                <td><button onclick="deleteContact(this)" class="contact-action contact-action-delete" aria-label="Delete contact" title="Delete"><i class="fas fa-trash-alt"></i></button></td>
                            </tr>
                        <?php endforeach; ?>



                    </tbody>

                </table>

                <nav class="pagination-nav" aria-label="Contact pages">
                    <ul class="pagination justify-content-center">
                        <li class="page-item <?php echo $currentPage === 1 ? 'disabled' : ''; ?>">
                            <a class="page-link" href="?page=<?php echo max(1, $currentPage - 1); ?>" aria-label="Previous page">&laquo;</a>
                        </li>

                        <?php for ($page = 1; $page <= $totalPages; $page++) : ?>
                            <li class="page-item <?php echo $page === $currentPage ? 'active' : ''; ?>">
                                <a class="page-link" href="?page=<?php echo $page; ?>" <?php echo $page === $currentPage ? 'aria-current="page"' : ''; ?>>
                                    <?php echo $page; ?>
                                </a>
                            </li>
                        <?php endfor; ?>

                        <li class="page-item <?php echo $currentPage === $totalPages ? 'disabled' : ''; ?>">
                            <a class="page-link" href="?page=<?php echo min($totalPages, $currentPage + 1); ?>" aria-label="Next page">&raquo;</a>
                        </li>
                    </ul>
                </nav>

            </div>

        </div>
    </div>



    <footer class="text-center">Navid Ahmadzade 2019.All rights reserved</footer>

    <script src="<?php echo asset_url('js/jquery-3.3.1.min.js'); ?>"></script>
    <script src="<?php echo asset_url('js/popper.min.js'); ?>"></script>
    <script src="<?php echo asset_url('js/bootstrap.min.js'); ?>"></script>
    <script src="<?php echo asset_url('js/index.js'); ?>?v=2"></script>
</body>

</html>