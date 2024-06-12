const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

const ECWID_API_URL = 'https://app.ecwid.com/api/v3/88026380';
const ECWID_TOKEN = 'secret_DMi2RyJLCCpC5Gt7enYVcDqVzShwGp9R';

const createEcwidCustomer = async (customerData) => {
    try {
        const response = await axios.post(`${ECWID_API_URL}/customers`, customerData, {
            headers: { 'Authorization': `Bearer ${ECWID_TOKEN}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating customer:', error);
    }
};

const addProductToCart = async (customerId, productId) => {
    try {
        const response = await axios.post(`${ECWID_API_URL}/carts/${customerId}/products`, { productId }, {
            headers: { 'Authorization': `Bearer ${ECWID_TOKEN}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error adding product to cart:', error);
    }
};

app.post('/webhook/bookafy', async (req, res) => {
    const event = req.body.event;
    const data = req.body.data;

    if (event === 'customer.created') {
        await createEcwidCustomer(data);
    } else if (event === 'customer.updated') {
        const customerId = data.id; // Assuming data contains customer ID
        await updateEcwidCustomer(customerId, data);
    } else if (event === 'category.created') {
        await createEcwidCategory(data);
    } else if (event === 'category.updated') {
        const categoryId = data.id; // Assuming data contains category ID
        await updateEcwidCategory(categoryId, data);
    } else if (event === 'category.deleted') {
        const categoryId = data.id; // Assuming data contains category ID
        await deleteEcwidCategory(categoryId);
    } else if (event === 'appointment.type.created') {
        await createEcwidProduct(data);
    } else if (event === 'appointment.type.updated') {
        const productId = data.id; // Assuming data contains product ID
        await updateEcwidProduct(productId, data);
    } else if (event === 'appointment.type.deleted') {
        const productId = data.id; // Assuming data contains product ID
        await deleteEcwidProduct(productId);
    } else if (event === 'booking.confirmed') {
        const { customerId, productId } = data; // Assuming data contains customer ID and product ID
        await addProductToCart(customerId, productId);
    }

    res.status(200).send('Webhook received');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
