const { allSheetsJson: sheetsJsons, headers } = require('./toJson');
const langConfig = require('./lang.config.json');
const path  = require('path');
const fs = require('fs');

//从命令行获取根路径参数
const writeBaseDir = process.argv.slice(2)[0];

/**
 * 
 * @param {String} filename 文件写入操作完成时的回调函数
 */
const callback = filename => err => {
    if (err) {
        console.log(`写入文件${filename}失败`);
    } else {
        console.log(`写入文件${filename}成功`);
    }
};

/**
 * 
 * @param {String} filepath 文件写入路径
 * @param {String} filename 写入的文件命名
 * @param {Object} data 写入的文件内容
 */
const writeSingleFile = (filepath, filename, data) => {
    fs.writeFile(`${filepath}.json`,JSON.stringify(data), {
        flag:'w',
        encoding:'utf-8'
    }, callback(filename));
};

/**
 * 
 * @param {String} filename 写入的文件命名
 * @param {Object} sheet 将excel中单个sheet数据写入文件
 */
const writeBySheet = (filename, sheet) => {
    const langKeys = Object.keys(langConfig);
    langKeys.forEach(key => {
        const dir = path.join(writeBaseDir, key);
        const writeDir = path.join(writeBaseDir, key, filename);
        writeSingleFile(writeDir, filename, sheet[key]);
    });
};

/**
 * 批量将excel中的每个sheet数据写入文件
 */
const batchWriteFile = () => {
    for(let sheet = 0, len = sheetsJsons.length; sheet < len ; sheet++){
        const filename = sheetsJsons[sheet].fileName;
        writeBySheet(filename, sheetsJsons[sheet]);
    }
};

/**
 * 语言文件目录不存在时，创建对应语言文件目录
 */
const mkdirNotExist = () => {
    const langKeys = Object.keys(langConfig);
    const mkdirNotExistList = langKeys.map(key => new Promise((resolve, reject) => {
        const dir = path.join(writeBaseDir, key);
        fs.exists(dir, exists => {
            if (exists) {
                resolve(true);
            } else {
                fs.mkdir(dir, err => {
                    if (err) {
                        reject(err);
                        console.log(`dir ${key}创建目录失败`);
                    } else {
                        resolve(true);
                        console.log(`dir ${key}创建目录成功`);
                    }
                });
            }
        });
    }));

    return Promise.all(mkdirNotExistList);
};

mkdirNotExist().then(res => {
    const isDirsExisted = res.reduce(((result, item) =>  result && item), true);
    if (isDirsExisted) {
        batchWriteFile();
    } else {
        console.log(`Some dir is not existed`);
    }
}).catch(e => {});
