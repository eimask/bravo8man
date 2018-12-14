'use strict';

module.exports = function (sequelize, DataTypes) {

    return sequelize.define("commands", {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ParentId: {
            type: DataTypes.INTEGER,
            defaultValue: -1
        },
        IsGroup: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        CommandKey:{
            type: DataTypes.STRING,
            allowNull: false,
            validate:{
                len: {
                    args: [0, 255],
                    msg: 'Command key cannot too long'
                }
            }
        },
        Text: {
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: [0, 255],
                    msg: 'Title cannot too long'
                }
            }
        },
        Text_English: {
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: [0, 255],
                    msg: 'Title cannot too long'
                }
            }
        },
        Alias: {
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: [1, 255],
                    msg: 'Alias cannot empty or too long'
                },
                isSlug: function (value) {
                    if (typeof value !== 'string' || !value.match(/[a-zA-Z0-9-_]/g)) {
                        throw new Error('Alias cannot includes special characters!');
                    }
                }
            }
        },
        DocumentId: {
            type: DataTypes.INTEGER,
            defaultValue: -1
        },
        IsActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        CreatedAt: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    msg: 'Invalid date value'
                }
            }
        },
        CreatedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: -1
        },
        ModifiedAt: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    msg: 'Invalid date value'
                }
            }
        },
        ModifiedBy: {
            type: DataTypes.INTEGER
        }
    }, {
        indexes: [
            {
                unique: true,
                fields: ['CommandKey']
            },
            {
                unique: true,
                fields: ['Alias']
            },
            {
                unique: true,
                fields: ['CommandKey', 'DocumentId']
            }
        ],
        tableName: 'B00Command',
        createdAt: 'CreatedAt',
        updatedAt: 'ModifiedAt'
    });
};