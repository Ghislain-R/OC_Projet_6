const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const path = require('path');
const result = require('dotenv').config();

const app = express();

const saucesRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user')
const Sauce = require('./models/Sauce');

/*Connexion à la base de données*/
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.c48zo.mongodb.net/test?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

/*Gestion du CORS*/
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());

app.use(mongoSanitize({
  replaceWith: '_'
}))

app.use(helmet());

/*Fonction express.static pour utilisation des fichiers dans le dossier 'images'*/
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes)

module.exports = app;


