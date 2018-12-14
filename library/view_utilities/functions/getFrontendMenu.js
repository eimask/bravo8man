"use strict";

let _ = require('arrowjs')._;
let log = require('arrowjs').logger;

module.exports = {

    async: true,

    /**
     * Get sidebar by name
     *
     * @param sidebarName - Name of sidebar
     * @param callback - Content of sidebar
     */
    handler: function (sidebarName, callback) {
        let app = this;

        // Find all widgets in the sidebar
        app.models.commands.findAll({
            attributes: ['Id', 'ParentId', 'Text', 'Alias', 'DocumentId'],
            where: {
                IsActive: 1
            },
            order: ['Id'],
            raw: true
        }).then(function (commands) {
            // Check the sidebar has widget
            if (commands && commands.length) {
                let html = '';
                let resolve = Promise.resolve();
                let commandsSort = _queryTreeSort({q: commands});
                let commandsTree = _makeTree({q: commandsSort});

                html = _renderTree(commandsTree);

                // Return content of the sidebar
                resolve.then(function () {
                    callback(null, html);
                });
            } else {
                callback(null, '');
            }
        }).catch(function (err) {
            log.error(err);
        });
    }

};

function _queryTreeSort(options) {
    var cfi, e, i, id, o, pid, rfi, ri, thisid, _i, _j, _len, _len1, _ref, _ref1;
    id = options.Id || "Id";
    pid = options.ParentId || "ParentId";
    ri = [];
    rfi = {};
    cfi = {};
    o = [];
    _ref = options.q;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        e = _ref[i];
        rfi[e[id]] = i;
        if (cfi[e[pid]] == null) {
            cfi[e[pid]] = [];
        }
        cfi[e[pid]].push(options.q[i][id]);
    }
    _ref1 = options.q;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        e = _ref1[_j];
        if (rfi[e[pid]] == null) {
            ri.push(e[id]);
        }
    }
    while (ri.length) {
        thisid = ri.splice(0, 1);
        o.push(options.q[rfi[thisid]]);
        if (cfi[thisid] != null) {
            ri = cfi[thisid].concat(ri);
        }
    }
    return o;
};

function _makeTree(options) {
    var children, e, id, o, pid, temp, _i, _len, _ref;
    id = options.Id || "Id";
    pid = options.ParentId || "ParentId";
    children = options.Children || "Children";
    temp = {};
    o = [];
    _ref = options.q;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        e[children] = [];
        temp[e[id]] = e;
        if (temp[e[pid]] != null) {
            temp[e[pid]][children].push(e);
        } else {
            o.push(e);
        }
    }
    return o;
};

function _renderTree(tree) {
    var e, html, _i, _len;
    html = "<ul>";
    for (_i = 0, _len = tree.length; _i < _len; _i++) {
        e = tree[_i];
        if (e.ParentId == -1){
            html += "<li class='sub-item-" + e.ParentId + "'>" +

                "<span id='" + e.Id + "' data-toggle='collapse' data-parent='.menu-group' href='.sub-item-" + e.Id + "' " +
                "   class='glyphicon glyphicon-folder-open header-icon'></span>" +
                "<a href='" + (e.DocumentId != -1 ? "/document/" + e.DocumentId + "/" + e.Alias : "#") + "'>" +
                "<span id='"+ e.DocumentId + "' class='tree-Header' style='word-break:break-word;'>" + e.Text + "</span>";
        } else {
            html += "<li class='sub-item-" + e.ParentId + " accordion-body collapse'>" +
                "<a href='" + (e.DocumentId != -1 ? "/document/" + e.DocumentId + "/" + e.Alias : "#") + "'>" +
                "<span class='glyphicon glyphicon-file tree-icon'></span>" +
                "<span id='"+ e.DocumentId + "' class='tree-content' style='word-break:break-word;'>" + e.Text + "</span>";
        }

        if (e.Children != null) {
            html += _renderTree(e.Children);
        }
        html += "</a></li>";
    }
    html += "</ul>";
    return html;
};