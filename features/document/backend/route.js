'use strict';

/**
 * Map final part of URL to equivalent functions in controller
 */
module.exports = function (component, application) {

    let controller = component.controllers.backend;
    let documentPermissions = ['documents_manage_all'];

    return {
        "/document": {
            get: {
                handler: controller.documentList,
                authenticate: true,
                permissions: documentPermissions
            },
            delete: {
                handler: controller.documentDelete,
                authenticate: true,
                permissions: documentPermissions
            }
        },
        "/document/page/:page": {
            get: {
                handler: controller.documentList,
                authenticate: true,
                permissions: documentPermissions
            }
        },
        "/document/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: controller.documentList,
                authenticate: true,
                permissions: documentPermissions
            }
        },
        "create": {
            get: {
                handler: controller.documentCreate,
                authenticate: true,
                permissions: documentPermissions
            },
            post: {
                handler: [controller.documentSave, controller.documentCreate],
                authenticate: true,
                permissions: documentPermissions
            }
        },
        "/document/:Id([0-9]+)": {
            get: {
                handler: controller.documentView,
                authenticate: true,
                permissions: documentPermissions
            },
            post: {
                handler: [controller.documentUpdate, controller.documentView],
                authenticate: true,
                permissions: documentPermissions
            }
        },
        "/document/preview/:Id([0-9]+)": {
            get: {
                handler: controller.documentPreview,
                authenticate: true,
                permissions: documentPermissions
            }
        },
        "/document/autosave": {
            post: {
                handler: controller.documentAutosave,
                authenticate: true,
                permissions: documentPermissions
            }
        }
    }
};