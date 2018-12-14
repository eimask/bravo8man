'use strict';

let slug = require('slug');
let Promise = require('arrowjs').Promise;
let _ = require('arrowjs')._;

module.exports = function (action, comp, app) {
    /**
     * Find document by ID
     * @param id {integer} - Id of document
     */
    action.findById = function (id) {
        return app.models.document.findById(id);
    };

    /**
     * Find document with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.find = function (conditions) {
        return app.models.document.find(conditions);
    };

    /**
     * Find all document with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.findAll = function (conditions) {
        return app.models.document.findAll(conditions);
    };

    /**
     * Find and count all document with conditions
     * @param conditions {object} - Conditions used in query
     */
    action.findAndCountAll = function (conditions) {
        return app.models.document.findAndCountAll(conditions);
    };

    /**
     * Count document
     */
    action.count = function () {
        return app.models.document.count()
    };

    /**
     * Create new document
     * @param data {object} - Data of new document
     */
    action.create = function (data) {
        data = optimizeData(data);

        return app.models.document.create(data);
    };

    /**
     * Update document
     * @param document {object} - document need to update
     * @param data {object} - New data
     */
    action.update = function (document, data) {
        data = optimizeData(data);

        return document.updateAttributes(data);
    };

    /**
     * Delete document by ids
     * @param ids {array} - Array ids of document
     */
    action.destroy = function (ids) {
        return app.models.document.destroy({
            where: {
                Id: {
                    $in: ids
                }
            }
        })
    };

    function optimizeData(data) {
        if (data.Title) {
            // Trim title, slug alias
            data.Title = data.Title.trim();
            data.Alias = data.Alias || slug(data.Title.toLowerCase());
        }

        // Set default values
        data.Alias = data.Alias || Date.now().toString();

        return data;
    };

    /**
     * Split string categories from database to array
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

    /**
     * Update count of categories
     * @param: listCategories {array} - List ids of categories need to update
     * @param: table {string} - Name of table need to count
     * @param: column {string} - Name of column used to store categories
     * @param: conditions {string} - More conditions if needed
     */
    action.updateCommand = function (listCommand, table, column, documentId) {
        return Promise.map(listCommand, function (id) {
            let updateQuery = `UPDATE ${table}
                                SET ${column} = ${documentId}
                                WHERE Id = ${id};`;
            return app.models.rawQuery(updateQuery);
        });
    };
}