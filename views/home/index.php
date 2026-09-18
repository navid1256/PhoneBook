<?php

/**
 * @var array $contacts
 * @var int $currentPage
 * @var int $totalPages
 * @var string $search
 */
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <title>Phone Book</title>

    <script>
        // Anti-FOUC (Flash of Unstyled Content) theme initialization
        (function() {
            var theme = localStorage.getItem("phonebook-theme");
            if (!theme) {
                theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
            }
            document.documentElement.dataset.theme = theme;
            document.documentElement.dataset.bsTheme = theme;
            var metaScheme = document.querySelector('meta[name="color-scheme"]');
            if (metaScheme) metaScheme.content = theme;
        })();
    </script>

    <link rel="stylesheet" href="<?php echo asset_url('css/bootstrap.min.css'); ?>?v=5" />
    <link rel="stylesheet" href="<?php echo asset_url('css/all.min.css'); ?>" />
    <link rel="stylesheet" href="<?php echo asset_url('css/index_style.css'); ?>?v=26" />
    <link rel="stylesheet" href="<?php echo asset_url('template/searchbox/style.css'); ?>" />
</head>

<body>

    <div class="jum">

        <div class="navbar">
            <div class="brand-section">
                <h3>Phone Book <i class="far fa-address-book"></i></h3>
                <button id="themeToggle" class="theme-toggle-btn" type="button" aria-label="Toggle dark and light theme" title="Toggle theme">
                    <i class="fas fa-moon" id="themeIcon"></i>
                </button>
            </div>

            <form id="searchForm" method="get" action="" class="wrap">
                <div class="search">
                    <label for="myInput" class="visually-hidden">Search contacts</label>
                    <input type="text" id="myInput" class="searchTerm" name="search" value="<?php echo htmlspecialchars($search, ENT_QUOTES, 'UTF-8'); ?>" placeholder="What Contact are you looking for?" aria-label="Search contacts" autocomplete="off" spellcheck="false">
                    <button type="submit" class="searchButton" aria-label="Search">
                        <i class="fa fa-search"></i>
                    </button>
                </div>
            </form>
        </div>

        <div class="row">

            <div class="col-lg-4 inp">

                <h5 class="mt-2">Add New Contact</h5>

                <form id="addForm" method="post" action="<?php echo site_url('contact/add'); ?>">
                    <div class="form-outline mt-3">
                        <input type="text" id="userName" name="name" class="form-control" autocomplete="name" />
                        <label class="form-label" for="userName">Name</label>
                        <div class="form-notch">
                            <div class="form-notch-leading"></div>
                            <div class="form-notch-middle"></div>
                            <div class="form-notch-trailing"></div>
                        </div>
                    </div>
                    <div id="nameAlert" class="alert alert-danger p-2">Please add name</div>

                    <div class="form-outline mt-3">
                        <input type="number" id="userPhone" name="phone" class="form-control" min="0" max="999999999999" inputmode="numeric" autocomplete="tel" />
                        <label class="form-label" for="userPhone">Phone</label>
                        <div class="form-notch">
                            <div class="form-notch-leading"></div>
                            <div class="form-notch-middle"></div>
                            <div class="form-notch-trailing"></div>
                        </div>
                    </div>
                    <div id="phoneAlert" class="alert alert-danger p-2">Please add a valid number</div>

                    <div class="form-outline mt-3">
                        <input type="text" id="userEmail" name="email" class="form-control" autocomplete="email" />
                        <label class="form-label" for="userEmail">E-mail (optional)</label>
                        <div class="form-notch">
                            <div class="form-notch-leading"></div>
                            <div class="form-notch-middle"></div>
                            <div class="form-notch-trailing"></div>
                        </div>
                    </div>
                    <div id="mailAlert" class="alert alert-danger p-2">Please add a valid e-mail</div>
                    <div id="addStatus" class="alert alert-danger p-2"></div>

                    <button type="submit" class="btn btn-info w-100 btn1">Add</button>
                </form>

            </div>

            <div class="col-lg-8">

                <div class="table-responsive">
                    <table id="myTable" class="table table-striped align-middle" aria-label="Contacts list">

                        <thead class="tableh1">
                            <th scope="col">Name</th>
                            <th scope="col">Phone</th>
                            <th scope="col">E-mail</th>
                            <th scope="col" class="col-1">Edit</th>
                            <th scope="col" class="col-1">Delete</th>
                        </thead>

                        <tbody id="tableBody">
                            <?php if (empty($contacts)) : ?>
                                <tr id="emptyTableState" class="empty-state-row">
                                    <td colspan="5" class="text-center py-5">
                                        <div class="empty-state">
                                            <i class="far fa-address-book empty-state-icon"></i>
                                            <p class="empty-state-title">No contacts found</p>
                                            <span class="empty-state-desc">Add a new contact to get started.</span>
                                        </div>
                                    </td>
                                </tr>
                            <?php else : ?>
                                <?php foreach ($contacts as $contact) : ?>
                                    <tr data-id="<?php echo (int) $contact['id']; ?>">
                                        <td class="name"><?php echo htmlspecialchars($contact['name'], ENT_QUOTES, 'UTF-8'); ?></td>
                                        <td class="phone"><?php echo htmlspecialchars($contact['phone'], ENT_QUOTES, 'UTF-8'); ?></td>
                                        <td class="email"><?php echo htmlspecialchars($contact['email'] ?? '', ENT_QUOTES, 'UTF-8'); ?></td>
                                        <td>
                                            <button onclick="editContact(this)" class="contact-action contact-action-edit" aria-label="Edit contact" title="Edit">
                                                <i href="<?= site_url("/contact/update/{$contact['id']}") ?>" class="fas fa-edit"></i>
                                            </button>
                                        </td>
                                        <td>
                                            <button onclick="deleteContact(this)" class="contact-action contact-action-delete" aria-label="Delete contact" title="Delete">
                                                <i href="<?= site_url("/contact/delete/{$contact['id']}") ?>" class="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>

                    </table>
                </div>

                <nav class="pagination-nav" aria-label="Contact pages">
                    <ul class="pagination justify-content-center">
                        <li class="page-item <?php echo $currentPage === 1 ? 'disabled' : ''; ?>">
                            <a class="page-link" href="?<?php echo http_build_query(['page' => max(1, $currentPage - 1), 'search' => $search]); ?>" aria-label="Previous page">&laquo;</a>
                        </li>

                        <?php for ($page = 1; $page <= $totalPages; $page++) : ?>
                            <li class="page-item <?php echo $page === $currentPage ? 'active' : ''; ?>">
                                <a class="page-link" href="?<?php echo http_build_query(['page' => $page, 'search' => $search]); ?>" <?php echo $page === $currentPage ? 'aria-current="page"' : ''; ?>>
                                    <?php echo $page; ?>
                                </a>
                            </li>
                        <?php endfor; ?>

                        <li class="page-item <?php echo $currentPage === $totalPages ? 'disabled' : ''; ?>">
                            <a class="page-link" href="?<?php echo http_build_query(['page' => min($totalPages, $currentPage + 1), 'search' => $search]); ?>" aria-label="Next page">&raquo;</a>
                        </li>
                    </ul>
                </nav>

            </div>

        </div>
    </div>

    <!-- Floating Toast Notification Container -->
    <div id="toastContainer" aria-live="polite"></div>

    <footer class="text-center">Navid Ahmadzade 2019.All rights reserved</footer>

    <script src="<?php echo asset_url('js/bootstrap.bundle.min.js'); ?>?v=5"></script>
    <script>
        // Base URL for the AJAX endpoints (contact/add, contact/delete/{id})
        var SITE_URL = "<?php echo site_url(''); ?>";
    </script>
    <script src="<?php echo asset_url('js/index.js'); ?>?v=26"></script>
</body>

</html>
