require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: 1, email: 'test@test.com' }, process.env.JWT_SECRET || 'fallback_secret_key');

async function test() {
    try {
        const FormData = require('form-data');
        const form = new FormData();
        form.append('type', 'lost');
        form.append('author', 'Test Author');
        form.append('item', 'Test Item');
        form.append('description', 'Test Description');
        form.append('contact', '123456');

        const res = await axios.post('http://localhost:3000/api/lost-items', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });
        console.log("SUCCESS:");
        console.log(res.data);
    } catch (err) {
        console.log("ERROR STATUS:", err.response?.status);
        console.log("ERROR DATA:", err.response?.data);
        console.log("ERROR MSG:", err.message);
    }
}
test();
