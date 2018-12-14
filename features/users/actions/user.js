'use strict';

module.exports = function (action, comp, app) {

    /**
     * Find user by ID
     * @param id {integer} - Id of user
     */
    action.findById = function (id) {
        return app.models.user.findById(id);
    };

    /**
     * Find user by email
     * @param email {string} - Email of user
     */
    action.findByEmail = function (email) {
        return app.models.user.find({
            where: {
                UserEmail: email.toLowerCase()
            }
        });
    };

    /**
     * Find user with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.find = function (conditions) {
        return app.models.user.find(conditions);
    };

    /**
     * Find user with conditions, include roles
     * @param conditions {object} - Conditions used in query
     */
    action.findWithRole = function (conditions) {
        return app.models.user.find({
            include: [app.models.role],
            where: conditions
        });
    };

    /**
     * Find all users with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.findAll = function (conditions) {
        return app.models.user.findAll(conditions);
    };

    /**
     * Find and count all users with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.findAndCountAll = function (conditions) {
        return app.models.user.findAndCountAll(conditions);
    };

    /**
     * Count users
     */
    action.count = function () {
        return app.models.user.count()
    };

    /**
     * Create new user
     * @param data {object} - Data of new user
     */
    action.create = function (data) {
        data = optimizeData(data);
        return app.models.user.create(data);
    };

    /**
     * Update user
     * @param user {object} - User need to update
     * @param data {object} - New data
     */
    action.update = function (user, data) {
        data = optimizeData(data, user);
        return user.updateAttributes(data);
    };

    /**
     * Delete users by ids
     * @param ids {array} - Array ids of users
     */
    action.destroy = function (ids) {
        return app.models.user.destroy({
            where: {
                Id: {
                    $in: ids
                }
            }
        })
    };

    function optimizeData(data, user) {
        // Trim display name
        if (data.DisplayName) data.DisplayName = data.DisplayName.trim();

        if (user) {
            // Get role of user
            if (data.RoleId && !data.RoleIds) {
                data.RoleIds = user.RoleIds;
            } else if (!data.RoleId && data.RoleIds) {
                data.RoleId = user.RoleId;
            }
        }

        if (data.RoleId) {
            if (data.RoleIds) {
                // Check RoleId must in RoleIds
                data.RoleIds = data.RoleIds.toString().split(',');
                if (data.RoleIds.indexOf(data.RoleId.toString()) === -1) data.RoleId = data.RoleIds[0];
            } else {
                data.RoleId = data.RoleIds = null;
            }
        }

        if (data.RoleIds === null) {
            data.RoleId = data.RoleIds = null;
        }

        // Convert RoleIds to string
        if (Array.isArray(data.RoleIds)) data.RoleIds = data.RoleIds.toString();

        return data;
    }

};