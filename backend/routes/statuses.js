const express = require('express');
const { adminAuth } = require('./authMiddleware');
const { getAllItems, createItem, getItemById, updateItem, upload } = require('../controllers/statusController');

const router = express.Router();

//Showcase all the data in the Database
router.get('/', adminAuth, async (req, res) => {
    try {
        const items = await getAllItems();
        const itemCount = items.length;
        res.render("status", { itemCollection: items, itemCount });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

//Router for create item page
router.get('/createItem', adminAuth, (req, res) => {
    res.render("createItem");
});

//Route for submitting the edit
router.post('/submitItem', upload.single('picture'), adminAuth, async (req, res) => {
    try {
        if (!req.body.product || !req.body.quantity || !req.body.maxQuantity) {
            return res.status(400).send({
                message: 'Send all required fields: product, quantity, maxQuantity',
            });
        }
        const newItem = await createItem(req.body, req.file);
        return res.redirect('/status');
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ message: error.message })
    }
});

//Route for updating the current item
router.get('/edit/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const item = await getItemById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.render("edit", { item });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message });
    }
});

//Route for submitting the updated current item
router.post('/submitEdit/:id', adminAuth, async (req, res) => {
    try {
        if (!req.body.product || !req.body.quantity || !req.body.maxQuantity) {
            return res.status(400).send({
                message: 'Send all required fields: product, quantity, maxQuantity'
            });
        }
        const { id } = req.params;
        if (req.body._method && req.body._method.toUpperCase() === 'PUT') {
            const result = await updateItem(id, req.body);
            if (!result) {
                return res.status(404).json({ message: "item not found" });
            }
            return res.redirect('/status');
        } else {
            return res.status(400).json({ message: 'Invalid request method' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: error.message })
    }
});

module.exports = router;