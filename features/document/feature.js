'use strict';

module.exports = {
    title: "Documents",
    author: 'P.PTSP',
    version: '0.1.0',
    description: __('m_documents_backend_module_desc'),
    permissions: [
        {
            name: 'documents_manage_all',
            title: 'Manage all document'
        }
    ],
    backend_menu: {
        title: __('m_documents_backend_module_menu_backend_menu_title'),
        icon: 'fa fa-newspaper-o',
        menus:[
            {
                permission: ['documents_manage_all'],
                title: __('m_documents_backend_module_menu_backend_menu_post_index'),
                link: '/'
            },
            {
                permission: ['documents_manage_all'],
                title: __('m_documents_backend_module_menu_backend_menu_post_create'),
                link: '/create'
            }
        ]
    }
};

