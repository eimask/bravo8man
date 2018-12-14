'use strict';

module.exports = {
    title: "Commands",
    author: 'P.PTSP',
    version: '0.1.0',
    description: __('m_commands_backend_module_desc'),
    permissions: [
        {
            name: 'commands_manage_all',
            title: 'Manage all commands'
        }
    ],
    backend_menu: {
        title: __('m_commands_backend_module_menu_backend_menu_title'),
        icon: 'fa fa-newspaper-o',
        menus: [
            {
                permission: ['commands_manage_all'],
                title: __('m_commands_backend_module_menu_backend_menu_command_index'),
                link: '/'
            },
            {
                permission: ['commands_manage_all'],
                title: __('m_commands_backend_module_menu_create'),
                link: '/create'
            }
        ]
    }
};

