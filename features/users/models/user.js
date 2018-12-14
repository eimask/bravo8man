'use strict';

let crypto = require('crypto');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserPass: {
            type: DataTypes.STRING(255),
            validate: {
                notEmpty: true
            }
        },
        UserEmail: {
            type: DataTypes.STRING,
            unique: true,
            validate: {
                isEmail: {
                    msg: 'Invalid email address'
                }
            }
        },
        UserRegistered: {
            type: DataTypes.DATE,
            defaultValue: sequelize.NOW
        },
        UserStatus: {
            type: DataTypes.STRING(15),
            validate: {
                isIn: {
                    args: [['publish', 'un-publish']],
                    msg: 'Invalid data value'
                }
            }
        },
        DisplayName: {
            type: DataTypes.STRING(250),
            validate: {
                len: {
                    args: [1, 250],
                    msg: 'Display name cannot empty or exceed 250 characters'
                }
            }
        },
        UserImageURL: {
            type: DataTypes.STRING(1000),
            defaultValue: '/img/noImage.png'
        },
        Salt: {
            type: DataTypes.STRING(255)
        },
        RoleId: {
            type: DataTypes.INTEGER,
            validate: {
                isInt: {
                    msg: 'ID must be a number'
                }
            }
        },
        RoleIds: {
            type: DataTypes.STRING
        },
        ResetPasswordExpires: {
            type: DataTypes.BIGINT
        },
        ResetPasswordToken: {
            type: DataTypes.STRING
        },
        ChangeEmailExpires: {
            type: DataTypes.BIGINT
        },
        ChangeEmailToken: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: false,
        tableName: 'B00UserList',
        instanceMethods: {
            authenticate: function (password) {
                return this.UserPass === this.hashPassword(password);
            },
            hashPassword: function (password) {
                if (this.Salt && password) {
                    return crypto.pbkdf2Sync(password, this.Salt, 10000, 64, 'sha512').toString('base64');
                } else {
                    return password;
                }
            }
        },
        hooks: {
            beforeCreate: function (user, op, fn) {
                user.Salt = randomid(50);
                user.UserPass = user.hashPassword(user.UserPass);
                fn(null, user);
            }
        }
    });
};

let randomid = function (length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};