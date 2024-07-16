const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // default username for XAMPP MySQL
    password: '', // default password for XAMPP MySQL is empty
    database: 'obituary_platform'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database as id ' + connection.threadId);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Routes

// Serve the obituary form
app.get('/submit_obituary_form', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'obituary_form.html'));
});

// Submit Obituary Form
app.post('/submit_obituary', (req, res) => {
    const { name, date_of_birth, date_of_death, content, author } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const sql = 'INSERT INTO obituaries (name, date_of_birth, date_of_death, content, author, slug) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [name, date_of_birth, date_of_death, content, author, slug], (err, result) => {
        if (err) {
            console.error('Error submitting obituary: ' + err.stack);
            res.status(500).send('Error submitting obituary.');
            return;
        }
        res.send('<script>alert("Obituary submitted successfully."); window.location.href="/view_obituaries";</script>');
    });
});

// View Obituaries
app.get('/view_obituaries', (req, res) => {
    const sql = 'SELECT * FROM obituaries ORDER BY submission_date DESC';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving obituaries: ' + err.stack);
            res.status(500).send('Error retrieving obituaries.');
            return;
        }
        let html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Obituaries</title>
                <link rel="stylesheet" href="/styles.css">
            </head>
            <body>
                <nav>
                    <ul>
                        <li><a href="/submit_obituary_form">Submit Obituary</a></li>
                        <li><a href="/view_obituaries">View Obituaries</a></li>
                    </ul>
                </nav>
                <h1>Obituaries</h1>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Date of Birth</th>
                        <th>Date of Death</th>
                        <th>Content</th>
                        <th>Author</th>
                        <th>Submission Date</th>
                    </tr>`;
        results.forEach(obituary => {
            html += `
                    <tr>
                        <td>${obituary.name}</td>
                        <td>${obituary.date_of_birth}</td>
                        <td>${obituary.date_of_death}</td>
                        <td>${obituary.content}</td>
                        <td>${obituary.author}</td>
                        <td>${obituary.submission_date}</td>
                    </tr>`;
        });
        html += `
                </table>
            </body>
            </html>`;
        res.send(html);
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
