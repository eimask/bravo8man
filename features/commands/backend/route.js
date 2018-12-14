'use strict';

/**
 * Map final part of URL to equivalent functions in controller
 */
module.exports = function (component, application) {

    let controller = component.controllers.backend;
    let commandPermission = ['commands_manage_all'];

    return {
        "/commands": {
            get: {
                handler: controller.commandList,
                authenticate: true,
                permissions: commandPermission
            },
            delete: {
                handler: controller.commandDelete,
                authenticate: true,
                permissions: commandPermission
            }
        },
        "/commands/page/:page": {
            get: {
                handler: controller.commandList,
                authenticate: true,
                permissions: commandPermission
            }
        },
        "/commands/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: controller.commandList,
                authenticate: true,
                permissions: commandPermission
            }
        },
        "/commands/quick-create": {
            post: {
                handler: controller.commandQuickCreate,
                authenticate: true,
                permissions: commandPermission
            }
        },
        "create": {
            get: {
                handler: controller.commandCreate,
                authenticate: true,
                permissions: commandPermission
            },
            post: {
                handler: [controller.commandSave, controller.commandCreate],
                authenticate: true,
                permissions: commandPermission
            }
        },
        "/commands/:Id([0-9]+)": {
            get: {
                handler: controller.commandView,
                authenticate: true,
                permissions: commandPermission
            },
            post: {
                handler: [controller.commandUpdate, controller.commandView],
                authenticate: true,
                permissions: commandPermission
            }
        }
    }
};