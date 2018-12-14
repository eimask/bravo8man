'use strict';

let Promise = require('arrowjs').Promise;
let logger = require('arrowjs').logger;

module.exports = function (controller, component, app) {

    controller.allDocuments = function (req, res) {
        let page = req.params.page || 1;
        let number_item = 10;
        let totalPage = 1;
        let commandKey = req.query.commandKey || '';

        if (commandKey != '' && commandKey != 'null'){
            app.feature.commands.actions.find({
                where: {
                    CommandKey: commandKey,
                    IsActive: 1
                }
            }).then(function (command) {
                app.feature.document.actions.find({
                    where: {
                        Id: command.DocumentId,
                        IsActive: 1
                    }
                }).then(function (doc) {
                    if (doc) {
                        res.frontend.render('index', {
                            document: doc
                        });
                    } else {
                        // Redirect to 404 if post not exist
                        res.frontend.render('_404');
                    }
                });
            })
        } else {
            app.feature.document.actions.findAndCountAll({
                where: {
                    IsActive: 1
                },
                offset: (page - 1) * number_item,
                limit: number_item,
                order: 'Id DESC'
            }).then(function (docs) {
                if (docs) {
                    totalPage = Math.ceil(parseInt(docs.count) / number_item) || 1;
                    // Render view
                    res.frontend.render('list', {
                        document: docs.rows,
                        totalPage: totalPage,
                        currentPage: page,
                        baseURL: '/document/page-{page}'
                    });
                } else {
                    // Redirect to 404 if posts not exist
                    res.frontend.render('_404');
                }
            });
        }
    };

    controller.documentDetail = function (req, res) {
        let docId = req.params.Id;

        app.feature.document.actions.find({
            where: {
                Id: docId,
                IsActive: 1
            },
            raw: true
        }).then(function (doc) {
            if (doc) {
                res.frontend.render('index', {
                    document: doc
                });
            } else {
                // Redirect to 404 if post not exist
                res.frontend.render('_404');
            }
        });
    };

    controller.documentDetailByCommandKey = function (req, res, next, id) {
        let commandKey = req.params.commandKey;

        app.feature.commands.actions.findAll({
            where: {
                CommandKey: commandKey,
                IsActive: 1
            }
        }).then(function (command) {
            app.feature.document.action.find({
                where: {
                    Id: command.DocumentId,
                    IsActive: 1
                },
                raw: true
            }).then(function (doc) {
                if (doc) {
                    res.frontend.render('index', {
                        document: doc
                    });
                } else {
                    // Redirect to 404 if post not exist
                    res.frontend.render('_404');
                }
            });
        })
    };

    controller.search = function (req, res) {
        let page = req.params.page || 1;
        let number_item = app.getConfig('pagination').frontNumberItem || 10;
        let totalPage = 1;
        let key = req.body.searchStr || req.params.searchStr || req.query.searchStr || '';

        app.feature.document.actions.findAndCountAll({
            where: {
                $or: {
                    Title: {
                        $like: '%' + key + '%'
                    },
                    IntroText: {
                        $like: '%' + key + '%'
                    }
                },
                IsActive: 1
            },
            offset: (page - 1) * number_item,
            limit: number_item,
            order: 'Id DESC'
        }).then(function (docs) {
            totalPage = Math.ceil(parseInt(docs.count) / number_item) || 1;

            res.frontend.render('list', {
                document: docs.rows,
                totalPage: totalPage,
                currentPage: page,
                baseURL: '/document/search/page/{page}/' + key
            });
            // Render view
        }).catch(function (err) {
            logger.error('search error : ', err);
            res.frontend.render('_404');
        });
    }
};