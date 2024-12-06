/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source. 
* 
*  Name: Kemal Batu Turgut Student ID: 122277239 Date: 6/12/2024
*  Cyclic Web App URL: //replit.com/join/ezoqhbddvr-kemalbatu6
*  GitHub Repository URL: //github.com/kbturgut/web322-app.git
********************************************************************************/

const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dmqer8er4',
    api_key: '325835921252566',
    api_secret: '0gjn6m5IyqcxN6EBYTVEmpR5QYI',
    secure: true
});

// Multer configuration
const upload = multer();

// Routes
app.get('/', (req, res) => res.redirect('/about'));

app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'views', 'about.html')));

app.get('/items', (req, res) => {
    const { category, minDate } = req.query;

    if (category) {
        storeService.getItemsByCategory(category)
            .then(items => {
                if (items.length > 0) {
                    res.json(items);
                } else {
                    res.status(404).json({ message: "No items found for the specified category" });
                }
            })
            .catch(err => res.status(500).json({ message: err }));
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then(items => {
                if (items.length > 0) {
                    res.json(items);
                } else {
                    res.status(404).json({ message: "No items found after the specified date" });
                }
            })
            .catch(err => res.status(500).json({ message: err }));
    } else {
        storeService.getAllItems()
            .then(items => {
                if (items.length > 0) {
                    res.json(items);
                } else {
                    res.status(404).json({ message: "No items available" });
                }
            })
            .catch(err => res.status(500).json({ message: err }));
    }
});

app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(categories => {
            if (categories.length > 0) {
                res.json(categories);
            } else {
                res.status(404).json({ message: "No categories available" });
            }
        })
        .catch(err => res.status(500).json({ message: err }));
});

app.get('/items/add', (req, res) => res.sendFile(path.join(__dirname, 'views', 'addItem.html')));

app.post('/items/add', upload.single('featureImage'), (req, res) => {
    const processItem = (imageUrl) => {
        req.body.featureImage = imageUrl;
        storeService.addItem(req.body)
            .then(() => res.redirect('/items'))
            .catch(err => res.status(500).json({ message: err }));
    };

    if (req.file) {
        const streamUpload = (req) => new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream((error, result) => {
                if (result) resolve(result);
                else reject(error);
            });
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        streamUpload(req).then(uploaded => processItem(uploaded.url)).catch(err => res.status(500).json({ message: "Image upload failed" }));
    } else {
        processItem('');
    }
});

app.get('/categories/add', (req, res) => res.sendFile(path.join(__dirname, 'views', 'addCategory.html')));

app.post('/categories/add', (req, res) => {
    storeService.addCategory(req.body)
        .then(() => res.redirect('/categories'))
        .catch(err => res.status(500).json({ message: err }));
});

app.get('/categories/delete/:id', (req, res) => {
    storeService.deleteCategoryById(req.params.id)
        .then(() => res.redirect('/categories'))
        .catch(err => res.status(500).send("Unable to Remove Category / Category not found"));
});

app.get('/items/delete/:id', (req, res) => {
    storeService.deleteItemById(req.params.id)
        .then(() => res.redirect('/items'))
        .catch(err => res.status(500).send("Unable to Remove Item / Item not found"));
});

// 404 Handler
app.use((req, res) => res.status(404).send("Page Not Found 😢"));

// Initialize the service and start the server
storeService.initialize()
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error("Failed to initialize the service:", err));
