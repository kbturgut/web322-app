/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Kemal Batu Turgut 
Student ID: 122277239
Date: 9/25/24
Cyclic Web App URL: _______________________________________________________
GitHub Repository URL: ______________________________________________________
********************************************************************************/ 
const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to serve static files from the "public" directory
app.use(express.static('public'));

// Route to about page
app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Route to return published items (for the public-facing shop)
app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
        .then((publishedItems) => {
            res.json(publishedItems);
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

// Route to return all items
app.get('/items', (req, res) => {
    storeService.getAllItems()
        .then((items) => {
            res.json(items);
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

// Route to return all categories
app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then((categories) => {
            res.json(categories);
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

// Handle 404 (Page Not Found)
app.use((req, res) => {
    res.status(404).send("Page Not Found😢");
});

// Initialize the data and start the server only if successful
storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to initialize the store service:", err);
    });
