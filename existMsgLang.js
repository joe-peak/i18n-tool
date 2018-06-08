const glob = require('glob');
const fs = require('fs');
const path = '/Users/keruyun_joe/workspace/github/merchandis-i18n/public/lang/zh-CN/*.json';

const readFile = file => new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            reject(`读取文件${file}失败`);
        } else {
            resolve(JSON.parse(data));
        }
    });
});

const readLangFiles = dir => new Promise((resolve, reject) => {
    glob(dir, {}, function(err, files) {
        if (err) {
            reject(`匹配目录${dir}下的文件失败`);
        } else {
            let langMsgs = {};
            files.forEach( async (file, index) => {
                const json = await readFile(file);
                langMsgs = {...langMsgs, ...json};
                if (index === files.length - 1) {
                    resolve(langMsgs);
                }
            });
        }
    });
});

readLangFiles(path).then(res => {
    console.log(res);
});