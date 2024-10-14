/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Kemal Batu Turgut Student ID: 122277239 Date: 10/13/2024
*  Cyclic Web App URL: //replit.com/join/ezoqhbddvr-kemalbatu6
* 
*  GitHub Repository URL: https://github.com/kbturgut/web322-app.git
*
********************************************************************************/ 
const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const app = express();
const PORT = process.env.PORT || 8080;

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dmqer8er4',
    api_key: '325835921252566',
    api_secret: '0gjn6m5IyqcxN6EBYTVEmpR5QYI',
    secure: true
});

// Multer middleware setup
const upload = multer(); // No disk storage

// Middleware to serve static files from the "public" directory
app.use(express.static('public'));

// Route to about page
app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Route to add item page
app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
});

// POST route to handle new item submission
app.post('/items/add', upload.single('featureImage'), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            return result;
        }

        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        }).catch((err) => {
            res.status(500).json({ message: "Image upload failed" });
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
        storeService.addItem(req.body)
            .then(() => {
                res.redirect('/items');
            })
            .catch((err) => {
                res.status(500).json({ message: "Failed to add item" });
            });
    }
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
    const { category, minDate } = req.query;

    if (category) {
        storeService.getItemsByCategory(category)
            .then((items) => {
                res.json(items);
            })
            .catch((err) => {
                res.status(500).json({ message: err });
            });
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then((items) => {
                res.json(items);
            })
            .catch((err) => {
                res.status(500).json({ message: err });
            });
    } else {
        storeService.getAllItems()
            .then((items) => {
                res.json(items);
            })
            .catch((err) => {
                res.status(500).json({ message: err });
            });
    }
});

// Route to return an item by ID
app.get('/item/:id', (req, res) => {
    storeService.getItemById(req.params.id)
        .then((item) => {
            res.json(item);
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
            console.log(`Express http server listening on port ${PORT}, http://localhost:${PORT}/`);
        });
    })
    .catch((err) => {
        console.error("Failed to initialize the store service:", err);
    });
