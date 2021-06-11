const mongoose = require('mongoose');
const uniqueValidator = require ('mongoose-unique-validator');

/*Déclaration du modèle de données "Utilisateur"*/
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

/*Export du modèle pour son utilisation*/
module.exports = mongoose.model('User', userSchema);