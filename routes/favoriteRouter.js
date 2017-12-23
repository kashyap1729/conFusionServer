const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite'); // Favorite model

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// .all(authenticate.verifyOrdinaryUser) // this middleware will be included in the methods 
.get(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req,res,next) => {
    Favorites.findOne( { user: req.user._id } )
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (favorites) { // we add the dish(es) to the document
            for(var i = 0; i < req.body.length; i++) {
                console.log(req.body[i]);
                if (favorites.dishes.indexOf(req.body[i]._id) == -1) 
                    favorites.dishes.push(req.body[i]._id);
            }
            favorites.save()
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(favorites);
              })
              .catch(err => next(err));
        }
        else { // we create the document
            Favorites.create({user: req.user._id, dishes: req.body})
            .then((favorites) => {
                console.log('Favorites created', favorites);
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));   
})

.delete(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (favorites) { // we delete the document
            Favorites.remove({user: req.user._id})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (favorites) { // we add the dish to the document
            if (favorites.dishes.indexOf(req.params.dishId) == -1) 
                favorites.dishes.push(req.params.dishId);            
            favorites.save()
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
        }
        else { // we create the document
            Favorites.create({user: req.user._id, dishes: req.body})
            .then((favorite) => {
                console.log('Favorite created', favorite);
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (favorites) { // we delete the dish from the document
            var index = favorites.dishes.indexOf(req.params.dishId);
            if (index > -1) { 
                favorites.dishes.splice(index, 1);            
                favorites.save()
                .then((favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-type', 'application/json');
                    res.json(favorites);
                })
                .catch(err => next(err));
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;