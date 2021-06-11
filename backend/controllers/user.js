const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const crypt = require('../controllers/crypt');

/**************************************************/
/******Enregistrement d'un nouvel utilisateur******/
/**************************************************/

exports.signup = (req, res, next) => {

  /*Déclaration d'une expression régulière pour la vérification du mot de passe (Requiert 8 caratères minimum, 1 lettre minuscule, 1 lettre majuscule, 1 chiffre )*/
  const regexpassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/ 
  const password = req.body.password;

  /*Déclaration d'une expression régulière pour demander une adresse mail formatée correctement*/
  const regexmail = /^[A-z0-9._-]+[@]{1}[A-z0-9._-]+[.]{1}[A-z]{2,10}$/
  const email = req.body.email

  /*Cryptage de l'adresse mail pour l'enregistrement dans la base*/
  var cryptedEmail = crypt.encryptage(email)
  console.log('cryptage signup : '+cryptedEmail)

 
    /*Contrôle du format de l'adrresse mail et du mot passe saisis par l'utilisateur, puis enregistrement dans la base*/
    if(email.match(regexmail)) {

        if (password.match(regexpassword)) {

            /*Cryptage du Mdp de l'utilisateur*/ 
            bcrypt.hash(password, 10)
            .then(hash => {
              /*Création du nouvel utilisateur*/
              const user = new User({                
                email: cryptedEmail,                
                password: hash
              });
              /*Enregistrement de l'utilisateur*/
              user.save()
                .then(() => res.status(201).json({
                  message: 'Votre compte a été créé !'
                }))
                .catch(error => res.status(400).json({ error
                })); /* Erreur si il existe déjà un utilisateur avec cette adresse email*/
            })
            .catch(error => res.status(500).json({
              error
            }));

        }
          else /*Si le mot de passe ne respecte pas les règles du regex*/
        {
          throw new Error("Le mot de passe saisi n'est pas assez sécurisé (Necessite 8 caractères minimum, une lettre minuscule, une lettre majuscule et un chiffre");
        }

    }
      else /*Si l'adresse mail ne respecte pas les règles du regex*/
    {
      throw new Error("Le format de l'adresse mail n'est pas valide");
    }

};


/**************************************/
/******Connexion d'un utilisateur******/
/**************************************/

exports.login = (req, res, next) => {

  /*Cryptage de l'adresse mail pour recherche de l'utilisateur dans la base*/
  var cryptedEmail = crypt.encryptage(req.body.email)
  console.log('cryptage login : '+cryptedEmail)

  /*Recherche de l'email qui a été saisi par l'utilisateur et crypté*/
  User.findOne({
    email: cryptedEmail
  })
  .then(user => {
    /*Si l'utilisateur n'est pas trouvé, retour d'un code 401 "non autorisé"*/
    if (!user) {
      return res.status(401).json({
        error: 'Le compte saisi n existe pas !'
      });
    }
    /*Comparaison des mot de passe en base avec celui saisi*/
    bcrypt.compare(req.body.password, user.password)
      .then(valid => {
        /*Si les mots de passe ne correspondent pas, retour erreur 401*/
        if (!valid) {
          return res.status(401).json({
          error: 'Le mot de passe saisi est incorrect !'            
          });
        }
        /*Si les mots de passe correspondent, on renvoie un statut 200 et un objet JSON avec un userID + un token*/
        res.status(200).json({ /*Le serveur backend renvoie un token au frontend*/
          userId: user._id,
          /*Authenfication de la requête avec un token*/
          token: jwt.sign( /*Encode un nouveau token avec une chaine de développement temporaire*/
            {
              userId: user._id
            }, /*Encodage de l'userdID*/
            'RANDOM_TOKEN_SECRET', 
            
            {
              expiresIn: '24h'
            }
          )
        });
      })
      .catch(error => res.status(500).json({
        error
      }));
  })
  .catch(error => res.status(500).json({
    error
  }));

  
};



