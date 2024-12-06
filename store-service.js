const Sequelize = require('sequelize');

const sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'hpAe85ajNyVk', {
    host: 'ep-yellow-voice-a5tbg8vt.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    logging: console.log, // Enable query logging for debugging
});

const Item = sequelize.define('Item', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: Sequelize.STRING },
    price: { type: Sequelize.NUMERIC },
    postdate: { type: Sequelize.DATE }, // Correcting to match the database column name
    featureimage: { type: Sequelize.TEXT }, // Correcting to match the database column name
    published: { type: Sequelize.BOOLEAN },
    category: { type: Sequelize.INTEGER },
    body: { type: Sequelize.TEXT }
}, {
    tableName: 'items', // Ensure lowercase table name
    timestamps: false // Disable Sequelize's automatic `createdAt` and `updatedAt` fields
});

const Category = sequelize.define('Category', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    category: { type: Sequelize.STRING }
}, {
    tableName: 'categories', // Ensure lowercase table name
    timestamps: false
});

Item.belongsTo(Category, { foreignKey: 'category' });
// Functions

// Initialize the database
function initialize() {
    return sequelize.sync()
        .then(() => Promise.resolve())
        .catch(err => Promise.reject("unable to sync the database"));
}

// Get all items
function getAllItems() {
    return Item.findAll()
        .then((data) => Promise.resolve(data))
        .catch(() => Promise.reject("no results returned"));
}


// Get published items
function getPublishedItems() {
    return Item.findAll({ where: { published: true } })
        .then(data => Promise.resolve(data))
        .catch(() => Promise.reject("no results returned"));
}

// Get all categories
function getCategories() {
    return Category.findAll()
        .then(data => Promise.resolve(data))
        .catch(() => Promise.reject("no results returned"));
}

// Add a new item
function addItem(itemData) {
    itemData.published = itemData.published ? true : false;
    itemData.postDate = new Date();

    // Set empty fields to null
    for (const field in itemData) {
        if (itemData[field] === "") itemData[field] = null;
    }

    return Item.create(itemData)
        .then(() => Promise.resolve())
        .catch(() => Promise.reject("unable to create item"));
}

// Get items by category
function getItemsByCategory(category) {
    return Item.findAll({ where: { category } })
        .then(data => Promise.resolve(data))
        .catch(() => Promise.reject("no results returned"));
}

// Get items by minimum date
function getItemsByMinDate(minDateStr) {
    const { gte } = Sequelize.Op;
    return Item.findAll({
        where: {
            postDate: {
                [gte]: new Date(minDateStr)
            }
        }
    })
        .then(data => Promise.resolve(data))
        .catch(() => Promise.reject("no results returned"));
}

// Get an item by ID
function getItemById(id) {
    return Item.findAll({ where: { id } })
        .then(data => Promise.resolve(data[0]))
        .catch(() => Promise.reject("no results returned"));
}

// Add a new category
function addCategory(categoryData) {
    // Set empty fields to null
    for (const field in categoryData) {
        if (categoryData[field] === "") categoryData[field] = null;
    }

    return Category.create(categoryData)
        .then(() => Promise.resolve())
        .catch(() => Promise.reject("unable to create category"));
}

// Delete a category by ID
function deleteCategoryById(id) {
    return Category.destroy({ where: { id } })
        .then(rowsDeleted => {
            if (rowsDeleted === 0) return Promise.reject("no category found");
            else return Promise.resolve();
        })
        .catch(() => Promise.reject("unable to delete category"));
}

// Delete an item by ID
function deleteItemById(id) {
    return Item.destroy({ where: { id } })
        .then(rowsDeleted => {
            if (rowsDeleted === 0) return Promise.reject("no item found");
            else return Promise.resolve();
        })
        .catch(() => Promise.reject("unable to delete item"));
}

// Export functions
module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    addCategory,
    deleteCategoryById,
    deleteItemById
};
