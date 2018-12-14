
"use strict";

module.exports = function (sequelize, DataTypes) {
    let Role = sequelize.define("role", {
        Id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true,
            validate : {
                isInt : {
                    msg : 'Please input integer value'
                }
            }
        },
        Name: {
            type : DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len : {
                    args : [1,255],
                    msg : 'please input not too long'
                }
            }
        },
        Permissions: {
            type : DataTypes.TEXT
        },
        CreatedAt: {
            type : DataTypes.DATE
        },
        CreatedBy: {
            type : DataTypes.INTEGER,
            validate : {
                isInt : {
                    msg : 'Please input integer value'
                }
            }
        },
        ModifiedAt: {
            type : DataTypes.DATE
        },
        ModifiedBy: {
            type : DataTypes.INTEGER,
            validate : {
                isInt : {
                    msg : 'Please input integer value'
                }
            }
        },
        Status: {
            type : DataTypes.STRING(15),
            validate : {
                isIn : {
                    args : [['publish', 'un-publish']],
                    msg : 'Please only input publish or un-publish'
                }
            }
        }

    }, {
        tableName: 'B00RoleList',
        createdAt: 'CreatedAt',
        updatedAt: 'ModifiedAt',
        deletedAt: false
    });
    return Role;
};