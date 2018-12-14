'use strict';

let slug = require('slug');
let Promise = require('arrowjs').Promise;
let _ = require('arrowjs')._;

module.exports = function (action, component, app) {

    /**
     * Find commands by ID
     * @param id {integer} - Id of commands
     */
    action.findById = function (id) {
        return app.models.commands.findById(id);
    };

    /**
     * Find commands with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.find = function (conditions) {
        return app.models.commands.find(conditions);
    };

    /**
     * Find all commands with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.findAll = function (conditions) {
        return app.models.commands.findAll(conditions);
    };

    /**
     * Find and count all commands with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.findAndCountAll = function (conditions) {
        return app.models.commands.findAndCountAll(conditions);
    };

    /**
     * Count commands
     */
    action.count = function () {
        return app.models.commands.count();
    };

    /**
     * Create new commands
     * @param data {object} - Data of new commands
     */
    action.create = function (data) {
        data.Text = data.Text.trim();
        if (!data.Alias) data.Alias = slug(data.Text.toLowerCase());

        return app.models.commands.create(data);
    };

    /**
     * Update commands
     * @param command {object} - commands need to update
     * @param data {object} - New data
     */
    action.update = function (command, data) {
        if (data.Text) {
            data.Text = data.Text.trim();
            if (!data.Alias) data.Alias = slug(data.Text.toLowerCase());
        }

        return command.updateAttributes(data);
    };

    /**
     * Delete commands by ids
     * @param ids {array} - Array ids of commands
     */
    action.destroy = function (ids) {
        return app.models.commands.destroy({
            where: {
                Id: {
                    $in: ids
                }
            }
        })
    };

    /**
     * Split string commands from database to array
     * @param str {string} - String to convert. Example ':1:2:3:'
     */
    action.convertToArray = function (str) {
        if (typeof str == 'string') {
            str = _.compact(str.split(':'));

            // Check elements of str must be integers
            for (var i = 0; i < str.length; i++) {
                if (!Number.isInteger(parseInt(str[i]))) {
                    return [];
                }
            }

            return str;
        } else {
            return [];
        }
    };

};