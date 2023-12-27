const express = require('express');
const mysql = require('mysql');
const Web3 = require('web3');
const cors = require('cors');


const userRoutes = require('./routes/userRoutes');
const passRoutes = require('./routes/passRoutes');

const app = express();


app.use(express.json());
app.use(userRoutes);
app.use(cors());

app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/pass', passRoutes);


const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
