"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const views = {};
exports.buildViews = () => {
    fs_1.readdir('views', 'utf-8', (err, files) => {
        files.forEach((value) => {
            const [name, extension] = value.split('.');
            if (extension === 'html') {
                views[name] = fs_1.readFileSync(`views/${value}`, 'utf-8');
            }
        });
    });
};
exports.getMailView = (viewName) => {
    return views[viewName];
};
//# sourceMappingURL=view.service.js.map