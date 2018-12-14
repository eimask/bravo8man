"use strict";

module.exports = {
    db: {
        host: 'localhost',
        port: '5432',
        database: 'arrowjs',
        username: 'postgres',
        password: '',
        dialect: 'postgres',
        logging: false
    },
    associate: function (models) {
        models.user.belongsTo(models.role, {foreignKey: 'RoleId'});
        models.role.hasMany(models.user, {foreignKey: 'RoleId'});
        models.post.belongsTo(models.user, {foreignKey: "CreatedBy"});
        models.commands.belongsTo(models.document, {foreignKey: "DocumentId"});
    }
};