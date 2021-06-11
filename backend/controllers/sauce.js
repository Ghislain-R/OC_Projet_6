/*Utilisation du module fs de node pour gérer les fichiers physiques*/
const fs = require('fs');

const Sauce = require('../models/Sauce');

/*Creation d'une sauce*/
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({message: 'La sauce a bien été enregistrée !'}))
    .catch((error) => res.status(400).json({ error }));
};

/*Affichage du détail d'une sauce*/
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }))
};

/*Modification d'une sauce*/
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'La sauce a bien été modifiée !'}))
    .catch(error => res.status(400).json({ error }));
};

/*Suppression d'une sauce*/
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'La sauce a bien été supprimée !'}))
        .catch(error => res.status(400).json({ error }));
    });
  })
  .catch(error => res.status(500).json({ error }));
};

/*Affichage de la liste des sauces*/
exports.getAllSauces = (req, res, next) => {
 Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};


exports.likeOrDislikeSauce = (req, res, next) => {
  /*Récupération des éléments dans le corps de la page*/
  let like = req.body.like /*Valeur du like*/
  let userId = req.body.userId /*ID du user*/
  let sauceId = req.params.id /*ID de la sauce affichée*/

  /*Cas d'un Like (Valeur du like  = 1)*/
  if (like === 1) { 
    Sauce.updateOne({
        _id: sauceId
      }, {
        /*Enregistrement de l'utilisateur dans usersliked*/
        $push: {
          usersLiked: userId
        },
        /*Incrémentation du nombre de likes*/
        $inc: {
          likes: +1
        },
      })
      .then(() => res.status(200).json({
        message: 'j aime ajouté !'
      }))
      .catch((error) => res.status(400).json({
        error
      }))
  }
  /*Cas d'un DisLike*/
  if (like === -1) {
    Sauce.updateOne( 
        {
          _id: sauceId
        }, {
          /*Enregistrement de l'utilisateur dans usersDisliked*/
          $push: {
            usersDisliked: userId
          },
          /*Incrémentation du nombre de Dislikes*/
          $inc: {
            dislikes: +1
          },
        }
      )
      .then(() => {
        res.status(200).json({
          message: 'Dislike ajouté !'
        })
      })
      .catch((error) => res.status(400).json({
        error
      }))
  }

  /*Cas Annulation d'un like ou d'un Dislike*/
  if (like === 0) { 
    Sauce.findOne({
        _id: sauceId
      })
      .then((sauce) => {
        /*Annulation d'un like*/
        if (sauce.usersLiked.includes(userId)) { 
          Sauce.updateOne({
              _id: sauceId
            }, {
              $pull: {
                usersLiked: userId
              },
              $inc: {
                likes: -1 /*Décramentation du nombre de likes*/
              }, 
            })
            .then(() => res.status(200).json({
              message: 'Like supprimé'
            }))
            .catch((error) => res.status(400).json({
              error
            }))
        }
        /*Annulation d'un dislike*/
        if (sauce.usersDisliked.includes(userId)) { 
          Sauce.updateOne({
              _id: sauceId
            }, {
              $pull: {
                usersDisliked: userId
              },
              $inc: {
                dislikes: -1 /*Décramentation du nombre de dislikes*/
              }, 
            })
            .then(() => res.status(200).json({
              message: 'Dislike supprimé'
            }))
            .catch((error) => res.status(400).json({
              error
            }))
        }
      })
      .catch((error) => res.status(404).json({
        error
      }))
  }
}



