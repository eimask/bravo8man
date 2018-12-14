'use strict';

let logger = require('arrowjs').logger;
let promise = require('arrowjs').Promise;

/**
 * Function create user admin if database does not have an user
 */
exports.createUserAdmin = function (app, callback) {
    let permissions = app.permissions;
    try {
        permissions = delete permissions.widget;
        permissions = JSON.stringify(app.permissions);
    } catch (err) {
        callback(null);
    }

    app.models.user.count().then(function (count) {
        if (count < 1) {
            app.models.role.findAndCountAll({
                limit: 1,
                order: 'Id DESC'
            }).then(function (result) {
                if (result.count < 1) {
                    app.models.role.create({
                        Name: 'Admin',
                        Status: 'publish',
                        Permissions: permissions
                    }).then(function (role) {
                        createUser(app, role.Id, function (user) {
                            callback(user, role);
                        });
                    }).catch(function (err) {
                        callback(null);
                    })
                } else {
                    createUser(app, result.rows[0].Id, function (user) {
                        callback(user);
                    });
                }
            }).catch(function (err) {
                logger.error('Error At CreateUserAdmin in ArrowHelper function : ', err);
                callback(null);
            });
        } else {
            callback(null);
        }
    }).catch(function (err) {
        callback(null);
    });
};

function createUser(app, role_id, callback) {
    if (role_id < 1)
        callback(null);
    app.models.user.create({
        UserPass: '123456',
        UserEmail: 'admin@example.com',
        user_url: 'https://facebook.com/...',
        UserStatus: 'publish',
        DisplayName: 'Administrator',
        UserImageURL: '/img/admin.jpg',
        RoleId: role_id,
        RoleIds: role_id
    }).then(function (user) {
        callback(user);
    }).catch(function (err) {
        logger.error(err);
        callback(err);
    })
}
