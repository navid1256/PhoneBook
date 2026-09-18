<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phone Book</title>

    <link rel="stylesheet" href="<?php echo asset_url('css/bootstrap.min.css'); ?>" />
    <link rel="stylesheet" href="<?php echo asset_url('css/all.min.css'); ?>" />
    <link rel="stylesheet" href="<?php echo asset_url('css/index_style.css'); ?>?v=10" />
    <link rel="stylesheet" href="<?php echo asset_url('template/searchbox/style.css'); ?>" />
    <style>
        .empty-state {
            padding: 40px 20px;
            text-align: center;
            color: #888;
        }
        .empty-state i {
            font-size: 2.5rem;
            margin-bottom: 12px;
            display: block;
            color: #bbb;
        }
    </style>
</head>

<body>

    <div class="jumbotron jum">

        <div class=" navbar">
            <h3>Phone Book <i class="far fa-address-book"></i></h3>

            <form id="searchForm" onsubmit="return false;" class="wrap">
                <div class="search">
                    <input type="text" id="myInput" class="searchTerm" name="search" placeholder="What Contact are you looking for?">
                    <button type="submit" class="searchButton" aria-label="Search">
                        <i class="fa fa-search"></i>
                    </button>
                </div>
            </form>
        </div>

        <div class="row">

            <div class="col-lg-4 inp">

                <h5 class="mt-2">Add New Contact</h5>

                <form id="addForm" onsubmit="return false;">
                    <div class="form-outline mt-3" data-mdb-input-init>
                        <input type="text" id="userName" name="name" class="form-control" />
                        <label class="form-label" for="userName">Name</label>
                        <div class="form-notch">
                            <div class="form-notch-leading"></div>
                            <div class="form-notch-middle"></div>
                            <div class="form-notch-trailing"></div>
                        </div>
                    </div>
                    <div id="nameAlert" class="alert alert-danger text-justify p-2" style="display:none;">Please add name</div>

                    <div class="form-outline mt-3" data-mdb-input-init>
                        <input type="number" id="userPhone" name="phone" class="form-control" min="0" max="999999999999" inputmode="numeric" />
                        <label class="form-label" for="userPhone">Phone</label>
                        <div class="form-notch">
                            <div class="form-notch-leading"></div>
                            <div class="form-notch-middle"></div>
                            <div class="form-notch-trailing"></div>
                        </div>
                    </div>
                    <div id="phoneAlert" class="alert alert-danger text-justify p-2" style="display:none;">Please add a valid number (10-12 digits)</div>

                    <div class="form-outline mt-3" data-mdb-input-init>
                        <input type="text" id="userEmail" name="email" class="form-control" />
                        <label class="form-label" for="userEmail">E-mail (optional)</label>
                        <div class="form-notch">
                            <div class="form-notch-leading"></div>
                            <div class="form-notch-middle"></div>
                            <div class="form-notch-trailing"></div>
                        </div>
                    </div>
                    <div id="mailAlert" class="alert alert-danger text-justify p-2" style="display:none;">Please add a valid e-mail</div>
                    <div id="addStatus" class="alert text-justify p-2" style="display:none;"></div>

                    <button type="submit" id="btnAddContact" class="btn btn-info w-100 btn1">Add</button>
                </form>

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
                        <tr>
                            <td colspan="5" class="text-center py-4 text-muted">
                                <i class="fas fa-spinner fa-spin mr-2"></i> Loading contacts from IndexedDB...
                            </td>
                        </tr>
                    </tbody>

                </table>

                <nav class="pagination-nav" id="paginationNav" aria-label="Contact pages">
                    <ul class="pagination justify-content-center" id="paginationList">
                        <!-- Rendered dynamically by JavaScript -->
                    </ul>
                </nav>

            </div>

        </div>
    </div>

    <footer class="text-center">Navid Ahmadzade 2019.All rights reserved</footer>

    <script src="<?php echo asset_url('js/jquery-3.3.1.min.js'); ?>"></script>
    <script src="<?php echo asset_url('js/popper.min.js'); ?>"></script>
    <script src="<?php echo asset_url('js/bootstrap.min.js'); ?>"></script>
    <script src="<?php echo asset_url('js/dexie.min.js'); ?>"></script>
    <script src="<?php echo asset_url('js/db.js'); ?>?v=3"></script>
    <script src="<?php echo asset_url('js/index.js'); ?>?v=22"></script>
</body>

</html>
