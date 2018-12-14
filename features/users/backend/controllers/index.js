'use strict';

let Promise = require('arrowjs').Promise;
let fs = require('fs');
let writeFileAsync = Promise.promisify(fs.writeFile);
let readdirAsync = Promise.promisify(fs.readdir);
let formidable = require('formidable');
Promise.promisifyAll(formidable);

let logger = require('arrowjs').logger;
let view_template = 'new';
let folder_upload = '/img/users/';

module.exports = function (controller, component, app) {

    let redis = app.redisClient;
    let adminPrefix = app.getConfig('admin_prefix') || 'admin';
    let redisPrefix = app.getConfig('redis_prefix') || 'arrowCMS_';
    let isAllow = ArrowHelper.isAllow;
    let baseRoute = '/admin/users/';

    function updateImage(dataBase64, user) {
        let check = (dataBase64 != user.UserImageURL);

        if (dataBase64 && check) {
            let fileName = folder_upload + user.Id + '.png';
            let base64Data = dataBase64.replace(/^data:image\/png;base64,/, '');

            return writeFileAsync(__base + 'upload' + fileName, base64Data, 'base64').then(function () {
                return user.updateAttributes({UserImageURL: fileName});
            });
        } else
            return new Promise(function (fullfil, reject) {
                fullfil(null);
            });
    }

    function updateCache(userId) {
        let key = redisPrefix + 'current-user-' + userId;
        redis.del(key, function (err, reply) {
            if (!err)
                return app.feature.users.actions.findWithRole({
                    Id: userId,
                    UserStatus: 'publish'
                }).then(function (user) {
                    if (user) {
                        let user_tmp = {Id: 0};

                        try {
                            user_tmp = JSON.parse(JSON.stringify(user));
                            user_tmp.acl = JSON.parse(user_tmp.role.Permissions);
                        } catch (err) {
                            user_tmp.acl = {};
                        }

                        redis.setex(key, 300, JSON.stringify(user_tmp));
                    }
                }).catch(function (error) {
                    logger.error(error);
                });
        });
    }

    controller.list = function (req, res) {
        let itemOfPage = app.getConfig('pagination').numberItem || 10;

        let tableStructure = [
            {
                column: "Id",
                width: '8%',
                header: "ID",
                filter: {
                    model: 'user',
                    data_type: 'number'
                }
            },
            {
                column: "DisplayName",
                width: '15%',
                header: __('m_users_backend_full_name'),
                link: baseRoute + '{Id}',
                filter: {
                    data_type: 'string'
                }
            },
            {
                column: "UserEmail",
                width: '15%',
                header: __('all_table_column_email'),
                filter: {
                    data_type: 'string'
                }
            },
            {
                column: "role.Name",
                width: '10%',
                header: __('all_table_column_role'),
                link: '/admin/roles/{role.Id}',
                filter: {
                    type: 'select',
                    filter_key: 'RoleId',
                    data_source: 'role', // name of models (in older version is name of table)
                    display_key: 'Name',
                    value_key: 'Id'
                }
            },
            {
                column: "UserStatus",
                width: '10%',
                header: __('all_table_column_status'),
                filter: {
                    type: 'select',
                    filter_key: 'UserStatus',
                    data_source: [
                        {
                            name: "publish"
                        },
                        {
                            name: "un-publish"
                        }
                    ],
                    display_key: 'name',
                    value_key: 'name'
                }
            }
        ];

        // Add toolbar
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton(baseRoute);
        toolbar.addSearchButton(isAllow(req, 'index'));
        toolbar.addCreateButton(isAllow(req, 'create'), baseRoute + 'create');
        toolbar = toolbar.render();

        // Config columns
        let filter = ArrowHelper.createFilter(req, res, tableStructure, {
            rootLink: baseRoute + '$page',
            limit: itemOfPage,
            backLink: 'user_back_link'
        });

        // List users
        app.feature.users.actions.findAndCountAll({
            attributes: filter.attributes,
            include: [
                {
                    model: app.models.role
                }
            ],
            //order: filter.order,
            limit: filter.limit,
            offset: filter.offset,
            where: filter.conditions
        }).then(function (results) {
            let totalPage = Math.ceil(results.count / itemOfPage);

            res.backend.render('index', {
                title: __('m_users_backend_controllers_index_list'),
                items: results.rows,
                totalPage: totalPage,
                toolbar: toolbar,
                queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop())
            });
        }).catch(function (error) {
            logger.error(error);
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            res.backend.render('index', {
                title: __('m_users_backend_controllers_index_list'),
                totalPage: 1,
                items: null
            });
        });
    };

    controller.create = function (req, res) {
        // Add button on view
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'user_back_link');
        toolbar.addSaveButton(isAllow(req, 'index'));
        toolbar = toolbar.render();

        // Get list roles
        app.feature.roles.actions.findAll({
            order: "Id ASC"
        }).then(function (roles) {
            res.backend.render(view_template, {
                title: __('m_users_backend_controllers_index_add_user'),
                roles: roles,
                toolbar: toolbar
            });
        }).catch(function (error) {
            logger.error(error);
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            res.backend.render(view_template, {
                title: __('m_users_backend_controllers_index_add_user'),
                roles: null,
                toolbar: toolbar
            });
        });
    };

    controller.save = function (req, res, next) {
        // Get form data
        let data = req.body;

        if (!(data.UserPass && data.UserPass.match(/[a-zA-Z0-9_!@#$%^&*()_]{5,32}/))) {
            req.flash.error('Mật khẩu không hợp lệ');
            return next();
        }

        // Set role equal first role in RoleIds
        data.RoleId = [].concat(data.RoleIds)[0];

        app.feature.users.actions.create(data).then(function (user) {
            // Update avatar
            return updateImage(data.base64, user).then(function () {
                req.flash.success(__('m_users_backend_controllers_index_add_flash_success'));
                res.redirect(baseRoute + user.Id);
            });
        }).catch(function (error) {
            if (error.name == ArrowHelper.UNIQUE_ERROR) {
                req.flash.error(__('m_users_backend_controllers_index_flash_email_exist'));
                return next();
            } else {
                req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
                return next();
            }
        });
    };

    controller.view = function (req, res) {
        // Add button
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'user_back_link');
        toolbar.addSaveButton(isAllow(req, 'index'));
        toolbar.addDeleteButton(isAllow(req, 'delete'));
        toolbar = toolbar.render();

        // Get user by session and list roles
        app.feature.roles.actions.findAll().then(function (roles) {
            res.backend.render(view_template, {
                title: __('m_users_backend_controllers_index_update'),
                roles: roles,
                item: req._user,
                id: req.params.uid,
                toolbar: toolbar
            });
        }).catch(function (error) {
            logger.error(error);
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            res.backend.render(view_template, {
                title: __('m_users_backend_controllers_index_update'),
                roles: null,
                item: null,
                id: 0,
                toolbar: toolbar
            });
        });
    };

    controller.update = function (req, res, next) {
        let userAction = app.feature.users.actions;
        let edit_user = req._user;
        let data = req.body;

        if (data.RoleIds === undefined)
            data.RoleIds = null;
        else if (!edit_user.RoleIds && data.RoleIds)  // If user does not have a role, set role_id equal to first role in RoleIds
            data.RoleId = [].concat(data.RoleIds)[0];

        return userAction.update(edit_user, data).then(function (user) {
            // Update avatar
            return updateImage(data.base64, user).then(function () {
                // Update cache
                updateCache(user.Id);

                req.flash.success(__('m_users_backend_controllers_index_update_flash_success'));
                return res.redirect('/' + adminPrefix + '/users/' + req.params.uid);
            });
        }).catch(function (error) {
            logger.error(error);
            if (error.name == ArrowHelper.UNIQUE_ERROR) {
                req.flash.error(__('m_users_backend_controllers_index_flash_email_exist'));
                return next();
            } else {
                req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
                return next();
            }
        });
    };

    controller.delete = function (req, res) {
        // Check delete current user
        let ids = req.body.ids.split(',');
        let id = req.user.Id.toString();
        let index = ids.indexOf(id);
        let userActions = app.feature.users.actions;

        if (index == -1) {
            userActions.find({
                where: {
                    Id: {
                        $in: ids
                    }
                }
            }).then(function (user) {
                // Delete user
                userActions.destroy(ids).then(function () {
                    // Delete user avatar
                    fs.unlink(__base + 'upload' + folder_upload + user.Id + '.png', function (err) {
                        if (err)
                            logger.error(err);
                    });

                    req.flash.success(__('m_users_backend_controllers_index_delete_flash_success'));
                    res.sendStatus(204);
                }).catch(function (error) {
                    req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
                    res.sendStatus(200);
                });
            });
        } else {
            req.flash.error('Cannot delete yourself');
            res.sendStatus(200);
        }
    };

    controller.profile = function (req, res) {
        // Get current user role
        let RoleIds = [];
        if (req.user.RoleIds) {
            RoleIds = req.user.RoleIds.split(/\D/).filter(function (val) {
                return val.match(/\d/g);
            });
        }

        // Add button on view
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'user_back_link');
        toolbar.addSaveButton();
        toolbar = toolbar.render();

        app.feature.roles.actions.findAll({
            where: {
                Id: {
                    $in: RoleIds
                }
            }
        }).then(function (roles) {
            res.backend.render(view_template, {
                item: req.user,
                toolbar: toolbar,
                RoleIds: roles
            });
        }).catch(function (err) {
            logger.error(error);
            res.backend.render(view_template, {
                item: req.user,
                toolbar: toolbar,
                RoleIds: null
            });
        });
    };

    controller.updateProfile = function (req, res, next) {
        let userAction = app.feature.users.actions;
        let data = req.body;

        userAction.findById(req.user.Id).then(function (user) {
            // Don't allow change RoleIds and email
            if (data.RoleIds !== undefined) delete data.RoleIds;
            if (data.Email !== undefined) delete data.Email;

            return userAction.update(user, data).then(function (result) {
                return updateImage(data.base64, user).then(function () {
                    // Update cache
                    updateCache(result.id);

                    req.flash.success(__('m_users_backend_controllers_index_update_profile_flash_success'));
                    return res.redirect('/' + adminPrefix + '/users/profile');
                });
            });
        }).catch(function (error) {
            logger.error(error);
            if (error.name == ArrowHelper.UNIQUE_ERROR) {
                req.flash.error(__('m_users_backend_controllers_index_flash_email_exist'));
                return next();
            } else {
                req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
                return next();
            }
        });
    };

    /**
     * Get Avatar library
     */
    controller.getAvatarGallery = function (req, res) {
        readdirAsync(__base + 'upload/avatar-gallery').then(function (files) {
            res.json(files);
        }).catch(function (err) {
            res.status(500).send(err.stack);
        });
    };

    /**
     * Change pass view
     */
    controller.changePass = function (req, res) {
        // Add button on view
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'user_back_link');
        toolbar = toolbar.render();

        res.backend.render('change-pass', {
            title: "Change User's password",
            item: req.user,
            toolbar: toolbar
        });
    };

    /**
     * Update pass view
     */
    controller.updatePass = function (req, res) {
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'user_back_link');
        toolbar = toolbar.render();
        let old_pass = req.body.old_pass.trim();
        let UserPass = req.body.UserPass.trim();

        app.feature.users.actions.findById(req.user.Id).then(function (user) {
            if (user.authenticate(old_pass)) {
                user.updateAttributes({
                    UserPass: user.hashPassword(UserPass)
                }).then(function () {
                    req.flash.success(__('m_users_backend_controllers_index_update_pass_flash_success'));
                }).catch(function (error) {
                    req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
                }).finally(function () {
                    res.backend.render('change-pass', {toolbar: toolbar});
                });
            } else {
                req.flash.error(__('m_users_backend_controllers_index_update_pass_flash_error'));
                res.backend.render('change-pass', {toolbar: toolbar});
            }
        });
    };

    controller.userById = function (req, res, next, id) {
        app.feature.users.actions.findWithRole({Id: id}).then(function (user) {
            if (user) {
                req._user = user;
                next();
            } else {
                req.flash.error('User is not exists');
                res.redirect(baseRoute);
            }
        }).catch(function (err) {
            req.flash.error(err.name + ': ' + err.message);
            res.redirect(baseRoute);
        });
    };

};