'use strict';

let Promise = require('arrowjs').Promise;
let logger = require('arrowjs').logger;

module.exports = function (controller, component, app) {

    let baseRoute = '/admin/commands/';

    controller.commandList = function (req, res) {
        let page = req.params.page || 1;
        let itemOfPage = app.getConfig('pagination').numberItem || 10;

        let tableStructure = [
            {
                column: 'Id',
                header: '',
                type: 'checkbox',
                width: '1%'
            },
            {
                column: 'CommandKey',
                header: __('all_table_column_name'),
                link: baseRoute + '{Id}',
                filter: {
                    data_type: 'string'
                },
                width: '25%'
            },
            {
                column: 'Alias',
                header: __('all_table_column_alias'),
                filter: {
                    data_type: 'string'
                },
                width: '25%'
            },
            {
                column: 'Text',
                header: 'Text',
                filter: {
                    data_type: 'string'
                },
                width: '25%'
            },
            {
                column: "document.Title",
                width: '10%',
                header: __('all_table_column_name'),
                link: '/admin/document/{document.Id}',
                filter: {
                    type: 'select',
                    filter_key: 'DocumentId',
                    data_source: 'document', // name of models (in older version is name of table)
                    display_key: 'Title',
                    value_key: 'Id'
                }
            }
        ];

        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton(baseRoute);
        toolbar.addSearchButton();
        toolbar.addCreateButton(true, baseRoute + 'create');
        toolbar.addDeleteButton();
        toolbar = toolbar.render();

        // Config columns
        let filter = ArrowHelper.createFilter(req, res, tableStructure, {
            rootLink: baseRoute + 'page/$page/sort',
            limit: itemOfPage,
            customCondition: " AND commands.IsActive=1",
            backLink: 'command_back_link'
        });

        app.feature.commands.actions.findAndCountAll({
            where: filter.conditions,
            include: [
                {
                    model: app.models.document
                }
            ],
            //order: filter.order,
            limit: filter.limit,
            offset: filter.offset
        }).then(function (results) {
            let totalPage = Math.ceil(results.count / itemOfPage);

            res.backend.render('index', {
                title: __('m_commands_backend_command_render_title'),
                toolbar: toolbar,
                totalPage: totalPage,
                currentPage: page,
                items: results.rows,
                baseRoute: baseRoute,
                queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop())
            });
        }).catch(function (err) {
            logger.error(err);
            req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + err.message);

            // Render view if has error
            res.backend.render('index', {
                title: __('m_commands_backend_command_render_title'),
                totalPage: 1,
                items: null,
                currentPage: page,
                queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop())
            });
        })
    };

    controller.commandQuickCreate = function (req, res) {
        app.feature.command.actions.create(req.body).then(function () {
            req.flash.success(__('m_commands_backend_command_flash_save_success'));
            res.redirect(baseRoute);
        }).catch(function (err) {
            logger.error(err);

            let errorMsg = 'Name: ' + err.name + '<br />' + 'Message: ' + err.message;

            if (err.name == ArrowHelper.UNIQUE_ERROR) {
                errorMsg = 'A Command with the name provided already exists';
            }

            req.flash.error(errorMsg);

            res.redirect(baseRoute);
        })
    };

    controller.commandCreate = function (req, res) {
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'command_back_link');
        toolbar.addSaveButton();

        app.feature.commands.actions.findAll({
            where:{
                IsActive: 1
            }
        }).then(function (commands) {
            app.feature.document.actions.findAll().then(function (document) {
                res.backend.render('new', {
                    title: 'New commands',
                    parent_commands: commands,
                    document: document,
                    toolbar: toolbar.render()
                });
            }).catch(function (err) {
                logger.error(err);

                let errorMsg = 'Name: ' + err.name + '<br />' + 'Message: ' + err.message;
                req.flash.error(errorMsg);

                res.locals.command = data;
                next();
            })
        })
    };

    controller.commandSave = function (req, res, next) {
        let data = req.body;

        app.feature.commands.actions.create(data).then(function (cmd) {
            req.flash.success(__('m_commands_backend_command_flash_save_success'));
            let Pusher = require('pusher');
            let pusher = new Pusher({
                appId: process.env.PUSHER_APP_ID,
                key: process.env.PUSHER_APP_KEY,
                secret: process.env.PUSHER_APP_SECRET,
                cluster: process.env.PUSHER_APP_CLUSTER
            });

            pusher.trigger('notifications', 'post_updated', cmd, req.headers['x-socket-id']);

            res.redirect(baseRoute + cmd.dataValues.Id);

        }).catch(function (err) {
            logger.error(err);

            let errorMsg = 'Name: ' + err.name + '<br />' + 'Message: ' + err.message;

            if (err.name == ArrowHelper.UNIQUE_ERROR) {
                for (let i in err.errors) {
                    data[err.errors[i].path] = '';
                }

                if (err.fields.name)
                    errorMsg = 'A commands with the name provided already exists';
                else
                    errorMsg = 'A commands with the alias provided already exists';
            }

            req.flash.error(errorMsg);

            res.locals.command = data;
            next();
        })
    };

    controller.commandView = function (req, res) {
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'category_back_link');
        toolbar.addSaveButton();

        app.feature.commands.actions.findById(req.params.Id).then(function (command) {
            app.feature.commands.actions.findAll({
                where:{
                    IsActive: 1
                }
            }).then(function (commands) {
                app.feature.document.actions.findAll().then(function (document) {
                    res.backend.render('new', {
                        title: 'Edit commands',
                        toolbar: toolbar.render(),
                        command: command.dataValues,
                        parent_commands: commands,
                        document: document
                    });
                })
            })
        }).catch(function (err) {
            logger.error(err);
            req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + err.message);
            res.redirect(baseRoute);
        })
    };

    controller.commandUpdate = function (req, res, next) {
        let commandId = req.params.Id;
        let data = req.body;
        let oldCommand;

        app.feature.commands.actions.find({
            where: {
                Id: commandId
            }
        }).then(function (command) {
            oldCommand = command;
            return app.feature.commands.actions.update(command, data);
        }).then(function () {
            req.flash.success(__('m_commands_backend_command_update_success'));
            res.redirect(baseRoute + commandId);
        }).catch(function (err) {
            logger.error(err);

            let errorMsg = 'Name: ' + err.name + '<br />' + 'Message: ' + err.message;

            if (err.name == ArrowHelper.UNIQUE_ERROR) {
                for (let i in err.errors) {
                    if (oldCommand && oldCommand._previousDataValues)
                        data[err.errors[i].path] = oldCommand._previousDataValues[err.errors[i].path];
                    else
                        data[err.errors[i].path] = '';
                }

                if (err.fields.name)
                    errorMsg = 'A commands with the name provided already exists';
                else
                    errorMsg = 'A commands with the alias provided already exists';
            }

            req.flash.error(errorMsg);

            res.locals.command = data;
            next();
        })
    };

    controller.commandDelete = function (req, res) {
        let listId = req.body.ids.split(',');

        Promise.all([
            app.feature.commands.actions.destroy(listId)
        ]).then(function () {
            req.flash.success(__('m_commands_backend_command_flash_delete_success'));
            res.sendStatus(200);
        }).catch(function (err) {
            logger.error(err);
            req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + err.message);
            res.sendStatus(200);
        })
    };
}