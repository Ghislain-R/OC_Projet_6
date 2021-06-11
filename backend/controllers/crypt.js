const crypto = require('crypto');

var exports = module.exports = {}; 

/*Algorithme et mdp secret pour les fonctions de cryptage et decryptage*/
var algorithm = process.env.DB_ALGO;
var mdp = process.env.DB_SECRET;

/*Fonction de cryptage*/
exports.encryptage = function encrypt(text) {

    var cipher = crypto.createCipher(algorithm,mdp);
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');

    return(crypted);

}
  
/*Fonction de décryptage*/
exports.decryptage = function decrypt(text) {
  
    var decipher = crypto.createDecipher(algorithm,mdp);
    var decrypted = decipher.update(crypted,'hex','utf8');
    decrypted += decipher.final('utf8');
  
    return(decrypted);
}

