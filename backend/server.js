require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create a MySQL connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// User registration
app.post('/users', (req, res) => {
    const { username, password, email, phone, role } = req.body;
    const query = 'INSERT INTO Users (Username, Password, Email, Phone, Role) VALUES (?, ?, ?, ?, ?)';

    connection.query(query, [username, password, email, phone, role], (err, results) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.status(201).send({ id: results.insertId, username, email, phone, role });
    });
});

// Register a restaurant
app.post('/restaurants', (req, res) => {
    const { userID, name, address, contactInfo } = req.body;
    const query = 'INSERT INTO Restaurants (UserID, Name, Address, ContactInfo) VALUES (?, ?, ?, ?)';

    connection.query(query, [userID, name, address, contactInfo], (err, results) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.status(201).send({ id: results.insertId, name, address, contactInfo });
    });
});

// Register an NGO
app.post('/ngos', (req, res) => {
    const { userID, name, address, contactInfo } = req.body;
    const query = 'INSERT INTO NGOs (UserID, Name, Address, ContactInfo) VALUES (?, ?, ?, ?)';

    connection.query(query, [userID, name, address, contactInfo], (err, results) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.status(201).send({ id: results.insertId, name, address, contactInfo });
    });
});

// Create a food donation
app.post('/donations', (req, res) => {
    const { restaurantID, foodType, quantity, expiryDate, pickUpTime, status = 'Pending' } = req.body;
    const query = 'INSERT INTO FoodDonations (RestaurantID, FoodType, Quantity, ExpiryDate, PickUpTime, Status) VALUES (?, ?, ?, ?, ?, ?)';

    connection.query(query, [restaurantID, foodType, quantity, expiryDate, pickUpTime, status], (err, results) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.status(201).send({ id: results.insertId, foodType, quantity, expiryDate, pickUpTime, status });
    });
});

// Get all donations
app.get('/donations', (req, res) => {
    const query = 'SELECT * FROM FoodDonations';

    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send(results);
    });
});


// Cancel a donation
app.delete('/cancel-donation/:id', (req, res) => {
    const donationId = req.params.id;
    const query = 'DELETE FROM FoodDonations WHERE DonationID = ?';

    connection.query(query, [donationId], (err, results) => {
        if (err) {
            return res.status(400).send(err);
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Donation not found');
        }
        res.send('Donation cancelled successfully');
    });
});

//edit donations
app.put('/edit-donation/:id', (req, res) => {
    const donationId = req.params.id;
    const { foodType, quantity, expiryDate, pickUpTime } = req.body;

    const query = `
        UPDATE FoodDonations 
        SET FoodType = ?, Quantity = ?, ExpiryDate = ?, PickUpTime = ? 
        WHERE DonationID = ?`;

    connection.query(query, [foodType, quantity, expiryDate, pickUpTime, donationId], (err, results) => {
        if (err) {
            console.error(err); // Log the error on the server side
            return res.status(400).send(err);
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Donation not found');
        }
        res.send('Donation updated successfully');
    });
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
