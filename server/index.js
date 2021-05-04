require('dotenv').config();

const port = process.env.PORT || 3000;
const mongoUsername = encodeURIComponent(process.env.MONGODB_USERNAME);
const mongoPassword = encodeURIComponent(process.env.MONGODB_PASSWORD);

const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const verifyToken = require('./routes/verifyToken');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('yoyo');
});

app.use('/api/users', authRoutes);

mongoose.connect(`mongodb+srv://${mongoUsername}:${mongoPassword}@reactnativecoursecluste.uxith.mongodb.net/auth_system?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(port, () => console.log(`Server is running on port ${port}`));
  })
  .catch(err => console.log(err));