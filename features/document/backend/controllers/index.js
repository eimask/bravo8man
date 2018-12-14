'use strict';

let _ = require('arrowjs')._;
let Promise = require('arrowjs').Promise;
let logger = require('arrowjs').logger;

module.exports = function (controller, component, app) {

    let baseRoute = '/admin/document/';
    let permissionManageAll = 'documents_manage_all';

    function getErrorMsg(err, oldData, newData) {
        logger.error(err);

        let errorMsg = 'Name: ' + err.name + '<br />' + 'Message: ' + err.message;

        if (err.name == ArrowHelper.UNIQUE_ERROR) {
            for (let i in err.errors) {
                if (oldData && oldData._previousDataValues)
                    newData[err.errors[i].path] = oldData._previousDataValues[err.errors[i].path];
                else
                    newData[err.errors[i].path] = '';
            }

            errorMsg = 'A document with the alias provided already exists';
        }

        return errorMsg;
    }

    function updateCommand(post) {
        let documentAction = app.feature.document.actions;

        if (post.IsActive) {
            let commands = post.commands;

            if (commands) {
                commands = documentAction.convertToArray(commands);
                return documentAction.updateCommand(commands, 'B00Command', 'DocumentId', post.Id);
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    function updateDocument(doc, data) {
        let documentAction = app.feature.document.actions;

        // Union categories before and after edit
        let commands = doc.Commands ? documentAction.convertToArray(doc.Commands) : [];
        let newCommmands = data.Commands ? documentAction.convertToArray(data.Commands) : [];
        let needUpdate = _.union(commands, newCommmands);

        return app.feature.document.actions.update(doc, data).then(function () {
            return app.feature.document.actions.updateCommand(needUpdate, 'B00Command', 'DocumentId', doc.Id);
        });
    }

    controller.documentList = function (req, res) {
        // Get current page and default sorting
        let page = req.params.page || 1;
        let itemOfPage = app.getConfig('pagination').numberItem || 10;

        // Add buttons and check authorities
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton(baseRoute);
        toolbar.addSearchButton();
        toolbar.addCreateButton(true, baseRoute + 'create');
        toolbar.addDeleteButton();
        toolbar = toolbar.render();

        // Config columns
        let tableStructure = [
            {
                column: "Id",
                width: '1%',
                header: "",
                type: 'checkbox'
            },
            {
                column: 'Title',
                width: '25%',
                header: __('all_table_column_title'),
                link: baseRoute + '{Id}',
                filter: {
                    data_type: 'string'
                }
            },
            {
                column: 'Alias',
                width: '25%',
                header: __('all_table_column_alias'),
                filter: {
                    data_type: 'string'
                }
            },
            {
                column: 'CreatedAt',
                width: '15%',
                header: __('m_blog_backend_page_filter_column_created_date'),
                type: 'datetime',
                filter: {
                    data_type: 'datetime',
                    filter_key: 'CreatedAt'
                }
            },
            {
                column: 'IsActive',
                width: '10%',
                header: __('all_table_column_status'),
                type: 'custom',
                alias: {
                    "1": "Publish",
                    "0": "Draft"
                },
                filter: {
                    type: 'select',
                    filter_key: 'published',
                    data_source: [
                        {
                            name: 'Publish',
                            value: 1
                        },
                        {
                            name: 'Draft',
                            value: 0
                        }
                    ],
                    display_key: 'name',
                    value_key: 'value'
                }
            }
        ];

        let filter = ArrowHelper.createFilter(req, res, tableStructure, {
            rootLink: baseRoute + 'page/$page/sort',
            limit: itemOfPage,
            customCondition: ' AND IsActive=1',
            backLink: 'document_back_link'
        });

        app.feature.document.actions.findAndCountAll({
            where: filter.conditions,
            order: filter.order,
            limit: filter.limit,
            offset: (page - 1) * itemOfPage
        }).then(function (results) {
            let totalPage = Math.ceil(results.count / itemOfPage);

            // Replace title of no-title post
            let items = results.rows;
            items.map(function (item) {
                if (!item.title) item.title = '(no title)';
            });

            // Render view
            res.backend.render('index', {
                title: __('m_documents_backend_document_render_title'),
                totalPage: totalPage,
                items: items,
                currentPage: page,
                toolbar: toolbar,
                queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop()),
                baseRoute: baseRoute
            });
        }).catch(function (err) {
            logger.error(err);
            req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + err.message);

            // Render view if has error
            res.backend.render('index', {
                title: __('m_documents_backend_post_render_title'),
                totalPage: 1,
                items: null,
                currentPage: page,
                toolbar: toolbar,
                queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop()),
                baseRoute: baseRoute
            });
        });
    };

    controller.documentCreate = function (req, res) {
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'document_back_link');
        toolbar.addSaveButton();

        app.feature.commands.actions.findAll({
            where: {
                IsActive: 1,
                DocumentId: {
                    $eq: null
                }
            }
        }).then(function (command) {
            res.backend.render('new', {
                title: __('m_blog_backend_post_render_create'),
                commands: command,
                baseRoute: baseRoute,
                toolbar: toolbar.render()
            });
        }).catch(function (err) {
            req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + err.message);
            res.redirect(baseRoute);
        });
    };

    controller.documentSave = function (req, res, next) {
        let data = req.body;
        let author = req.user.Id;
        let documentAction = app.feature.document.actions;
        let doc_id = 0;
        let oldDoc;
        let resolve = Promise.resolve();

        if (data.Id && data.Id > 0) {
            doc_id = data.Id;

            // Update draft post
            resolve = resolve.then(function () {
                data.ModifiedBy = author;
                return documentAction.findById(doc_id).then(function (doc) {
                    return updateDocument(doc, data);
                });

            });
        } else {
            // Create post
            resolve = resolve.then(function () {
                data.CreatedBy = author;

                return documentAction.create(data).then(function (doc) {
                    doc_id = doc.Id;
                    oldDoc = doc;

                    return updateDocument(doc, data);
                });
            });
        }

        resolve.then(function () {
            req.flash.success(__('m_blog_backend_post_flash_create_success'));
            res.redirect(baseRoute + doc_id);
        }).catch(function (err) {
            req.flash.error(getErrorMsg(err, oldDoc, data));
            res.locals.document = data;
            next();
        });
    };

    controller.documentView = function (req, res) {
        let document = req.document;

        // Check permissions
        if (req.permissions.indexOf(permissionManageAll) == -1) {
            req.flash.error("You do not have permission to manage this post");
            return res.redirect(baseRoute);
        }

        // Add buttons
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'document_back_link');
        toolbar.addSaveButton();
        toolbar.addDeleteButton();

        app.feature.document.actions.findById(req.params.Id).then(function (doc) {
            app.feature.commands.actions.findAll({
                where: {
                    IsActive: 1
                }
            }).then(function(com){
                // Add preview button
                toolbar.addGeneralButton(true, {
                    title: '<i class="fa fa-eye"></i> Preview',
                    link: baseRoute + 'preview/' + doc.Id,
                    target: '_blank',
                    buttonClass: 'btn btn-info'
                });

                // Render view
                res.backend.render('new', {
                    title: __('m_blog_backend_post_render_update'),
                    commands: com,
                    document: doc,
                    baseRoute: baseRoute,
                    toolbar: toolbar.render()
                });
            }).catch(function (err) {
                logger.error(err);
                req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + err.message);
                res.redirect(baseRoute);
            });
        });
    };

    controller.documentUpdate = function (req, res, next) {
        let document = req.document;
        let author = req.user.Id;

        // Check permissions
        if (req.permissions.indexOf(permissionManageAll) == -1) {
            req.flash.error("You do not have permission to manage this post");
            return res.redirect(baseRoute);
        }

        let data = req.body;
        data.ModifiedBy = author;

        app.feature.document.actions.findById(req.params.Id).then(function (document) {
            // Update post
            updateDocument(document, data).then(function () {
                req.flash.success(__('m_blog_backend_post_flash_update_success'));
                res.redirect(baseRoute + req.params.Id);
            }).catch(function (err) {
                req.flash.error(getErrorMsg(err, document, data));
                res.locals.document = data;
                next();
            });
        })
    };

    controller.documentPreview = function (req, res) {
        app.feature.document.actions.findById(req.params.Id).then(function (document) {
            if (document){
                if (req.permissions.indexOf(permissionManageAll) == -1) {
                    req.flash.error("You do not have permission to view this document");
                    return res.redirect(baseRoute);
                }

                // Render frontend view
                res.frontend.render('index', {
                    document: document
                });
            }
        }).catch(function (err) {
            res.frontend.render('_404');
        });
    };

    controller.documentAutosave = function (req, res) {
        let data = req.body;
        let author = req.user.Id;

        if (data.Id) {
            app.feature.document.actions.findById(data.Id).then(function (post) {
                // Recheck permissions to prevent user access by ajax
                if (req.permissions.indexOf(permissionManageAll) == -1 && post.CreatedBy != author) {
                    return res.jsonp({id: 0});
                }

                data.ModifiedBy = author;

                // Update post
                updateDocument(post, data).then(function () {
                    res.jsonp({id: post.id});
                }).catch(function (err) {
                    logger.error(err);
                    res.jsonp({id: 0});
                });
            })
        } else {
            data.CreatedBy = author;
            let newPost;

            // Create post
            app.feature.document.actions.create(data, 'post').then(function (post) {
                newPost = post;
            }).then(function () {
                if (newPost && newPost.Id)
                    res.jsonp({id: newPost.Id});
                else
                    res.jsonp({id: 0});
            }).catch(function (err) {
                logger.error(err);
                res.jsonp({id: 0});
            })
        }
    };

    controller.documentDelete = function (req, res) {
        let ids = req.body.ids.split(',');
        let categoryAction = app.feature.category.actions;
        let blogAction = app.feature.blog.actions;

        // Find posts need to delete
        blogAction.findAll({
            where: {
                id: {
                    $in: ids
                }
            }
        }).then(function (posts) {
            return Promise.map(posts, function (post) {
                // Recheck permissions to prevent user access by ajax
                if (req.permissions.indexOf(permissionManageAll) == -1 && post.created_by != req.user.id) {
                    return null;
                } else {
                    return blogAction.destroy([post.id]).then(function () {
                        let categories = post.categories ? categoryAction.convertToArray(post.categories) : [];
                        if (categories.length > 0) {
                            // Update count of categories
                            return categoryAction.updateCount(categories, 'arr_post', 'categories', 'AND type = \'post\' AND published = 1');
                        } else {
                            return null;
                        }
                    });
                }
            });
        }).then(function () {
            req.flash.success(__('m_blog_backend_post_flash_delete_success'));
            res.sendStatus(200);
        }).catch(function (err) {
            logger.error(err);
            req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + err.message);
            res.sendStatus(200);
        });
    };

    controller.documentRead = function (req, res, next, id) {
        app.feature.blog.actions.findById(id).then(function (post) {
            if (post) {
                req.post = req.page = req.interview = post;
                next();
            } else {
                req.flash.error('Post is not exists');
                res.redirect(baseRoute);
            }
        }).catch(function (err) {
            req.flash.error(err.name + ': ' + err.message);
            res.redirect(baseRoute);
        });
    };
};