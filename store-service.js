const fs = require('fs');
const path = require('path');

// Global arrays to store the data from JSON files
let items = [];
let categories = [];

// Helper function to read JSON files
function readJSONFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject("unable to read file");
            } else {
                try {
                    resolve(JSON.parse(data));
                } catch (parseError) {
                    reject("unable to parse file");
                }
            }
        });
    });
}

// Function to initialize the data by reading both JSON files
function initialize() {
    return new Promise((resolve, reject) => {
        readJSONFile(path.join(__dirname, 'data', 'items.json'))
            .then((itemsData) => {
                items = itemsData; 
                
                return readJSONFile(path.join(__dirname, 'data', 'categories.json'));
            })
            .then((categoriesData) => {
                categories = categoriesData;
                resolve();
            })
            .catch((err) => {
                reject("unable to read file");
            });
    });
}

// Function to get all items
function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items);
        } else {
            reject("no results returned");
        }
    });
}

// Function to get all published items
function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published);
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject("no results returned");
        }
    });
}

// Function to get all categories
function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject("no results returned");
        }
    });
}

// Function to add a new item
function addItem(itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published ? true : false;
        itemData.id = items.length + 1;
        items.push(itemData);
        resolve(itemData);
    });
}

// Function to get items by category
function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category == category);
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("no results returned");
        }
    });
}

// Function to get items by minimum date
function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("no results returned");
        }
    });
}

// Function to get an item by ID
function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id == id);
        if (item) {
            resolve(item);
        } else {
            reject("no result returned");
        }
    });
}

// Export the functions
module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById
};
