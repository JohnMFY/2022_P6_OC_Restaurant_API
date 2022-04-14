const Sauce = require('../models/Sauce');
const fs = require('fs')

//////////// Recover all the sauce ////////////
  exports.getAllSauce = (req, res, next) => {
    Sauce.find()
    .then((sauces) => {res.status(200).json(sauces);})
    .catch((error) => {res.status(400).json({error: error});});
  };
//////////////////////////////////////////////////

//////////////// Get One Sauce ////////////////
  exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})

    .then((sauce) => {res.status(200).json(sauce);})
    .catch((error) => {res.status(404).json({error: error});});
  };
//////////////////////////////////////////////////

///////////////// Create a Sauce /////////////////
  exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;

    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, 
    });
    
    if (sauce.userId !== req.auth.userId) {
      res.status(400).json({error:'Unauthorized Creation'});
    }else{
      sauce.save()
      .then(() => res.status(201).json({ message: 'Sauce save'}))
      .catch(error => res.status(400).json({ error }));
    }
  };
//////////////////////////////////////////////////

//////////////// Modify One Sauce ////////////////

  exports.modifySauce = (req, res, next) => {
   
      const sauceObject = req.file ?
        {
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body }; 
      
      if (sauceObject.userId !== req.auth.userId) {
        res.status(400).json({error:'Unauthorized modification'});
      }else{
      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modify'}))
        .catch(error => res.status(400).json({ error }));
      }  
  };
//////////////////////////////////////////////////

/////////////// Delete a sauce //////////////////
  exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
      .then((sauce) =>{
        if (sauce.userId !== req.auth.userId) {
          res.status(400).json({error: 'Unauthorized suppression'});
        }else{
          const filename = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({ _id: req.params.id })
              .then(() => res.status(200).json({ message: 'Sauce deleted' }))
              .catch(error => res.status(400).json({ error }));
          });
        }
      })
      .catch(error => res.status(500).json({ error }));
  };
//////////////////////////////////////////////////

////////////// Like & dislike sauce //////////////

  exports.likeSauce = (req, res, next) => {
    switch(req.body.like){

      case 0 :// check for like and dislike of userId and if one remove the like and the userIdLike/Dislike of the array
        Sauce.findOne({ _id: req.params.id }) 
          .then((sauce)=>{
            if (sauce.usersLiked.includes(req.body.userId))
              Sauce.updateOne({_id: req.params.id},
              {
                $inc:{likes: -1},
                $pull:{usersLiked: req.body.userId},
              })
            .then(() => res.status(200).json({ message: 'Like = 0' }))
            .catch(error => res.status(400).json({ error }));

            if (sauce.usersDisliked.includes(req.body.userId))
              Sauce.updateOne({_id: req.params.id},
              {
                $inc:{dislikes: -1},
                $pull:{usersDisliked: req.body.userId},
              })
            .then(() => res.status(200).json({ message: 'Dislike = 0' }))
            .catch(error => res.status(400).json({ error }));

          })
          .catch(error => res.status(404).json({ error }));
      break;

      case 1: // Like : add a like associate to the userId and the userId in the array userLiked
        Sauce.updateOne({_id: req.params.id},
          {
          $inc:{likes: 1},
          $push:{usersLiked: req.body.userId},
          })
        .then(() => res.status(200).json({ message: 'Like' }))
        .catch(error => res.status(400).json({ error }));
      break; 

      case -1: // Dislike : add a Dislike associate to the userId and the userId in the array userDisliked
        Sauce.updateOne({_id: req.params.id},
          {
          $inc:{dislikes: 1},
          $push:{usersDisliked: req.body.userId},
          })
        .then(() => res.status(200).json({ message: 'Dislike' }))
        .catch(error => res.status(400).json({ error }));
      break;
     
    }
  }

//////////////////////////////////////////////////