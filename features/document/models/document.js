'use strict';

module.exports = function (sequelize, DataTypes) {

    return sequelize.define("document", {
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
        Title: {
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: [0, 255],
                    msg: 'Title cannot too long'
                }
            }
        },
        Title_English: {
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
        IntroText: {
            type: DataTypes.TEXT
        },
        IntroText_English: {
            type: DataTypes.TEXT
        },
        Content: {
            type:DataTypes.TEXT
        },
        Content_English: {
            type:DataTypes.TEXT
        },
        Commands: {
            type:DataTypes.TEXT
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
                fields: ['Alias']
            }
        ],
        tableName: 'B30Document',
        createdAt: 'CreatedAt',
        updatedAt: 'ModifiedAt'
    });
};