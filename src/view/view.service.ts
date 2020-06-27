import { readdir, readFileSync } from 'fs';

const views: any = {};

export const buildViews = () => {
    readdir('views', 'utf-8', (err, files) => {
        files.forEach((value) => {
            const [name, extension] = value.split('.');
            if(extension === 'html') {
                views[name] = readFileSync(`views/${value}`, 'utf-8');
            }
        })
    });
}

export const getMailView = (viewName: string) => {
    return views[viewName];
}
