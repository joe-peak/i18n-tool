const glob = require('glob');
const fs = require('fs');
const langs = ['zh-TW', 'en'];
const path = lang => `/Users/keruyun_joe/workspace/github/merchandis-i18n/public/lang/${lang}/*.json`;

// const readFile = file => new Promise((resolve, reject) => {
//     fs.readFile(file, 'utf8', (err, data) => {
//         if (err) {
//             reject(`读取文件${file}失败`);
//         } else {
//             resolve(JSON.parse(data));
//         }
//     });
// });

// const readLangFiles = dir => new Promise((resolve, reject) => {
//     glob(dir, {}, function(err, files) {
//         if (err) {
//             reject(`匹配目录${dir}下的文件失败`);
//         } else {
//             let langMsgs = {};
//             files.forEach( async (file, index) => {
//                 const json = await readFile(file);
//                 langMsgs = {...langMsgs, ...json};
//                 if (index === files.length - 1) {
//                     resolve(langMsgs);
//                 }
//             });
//         }
//     });
// });

const langMap = {};

langs.forEach(lang => {
    const langDir = path(lang);
    let templist = {};
    const langFileNames = glob.sync(langDir);

    langFileNames.forEach(filename => {
        // 单个文件的json
        const singleFileJson = JSON.parse(fs.readFileSync(filename, 'UTF-8'));
        templist = { ...templist, ...singleFileJson };
    });
    langMap[lang] = templist;
});

module.exports = langMap;