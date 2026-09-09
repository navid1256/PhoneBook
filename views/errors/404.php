<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 Not Found</title>
    <style>
        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            font-family: Arial, sans-serif;
            background: #f5f7fb;
            color: #1f2937;
        }

        .card {
            text-align: center;
            background: #fff;
            padding: 48px 32px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            max-width: 500px;
            width: 90%;
        }

        h1 {
            font-size: 72px;
            margin: 0;
            color: #dc2626;
        }

        h2 {
            margin: 16px 0;
        }

        p {
            color: #4b5563;
            margin-bottom: 24px;
        }

        a {
            display: inline-block;
            background: #2563eb;
            color: white;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist or has been moved.</p>
        <a href="<?php echo site_url('/'); ?>">Back to Home</a>
    </div>
</body>
</html>
