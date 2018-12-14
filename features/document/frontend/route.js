'use strict';

module.exports = function (component) {
    let controller = component.controllers.frontend;

    return {
        "/": {
            get: {
                handler: controller.allDocuments
            }
        },
        "/document": {
            get: {
                handler: controller.allDocuments
            }
        },
        '/document/page-:page([0-9]+)?(/)?': {
            get: {
                handler: controller.allDocuments
            }
        },
        "/document/:Id([0-9]+)/:Alias": {
            get: {
                handler: controller.documentDetail
            }
        },
        "/document/search(/page/:page([0-9]+)/(:searchStr)?)?" : {
            get : {
                handler : controller.search
            }
        }
    }
};