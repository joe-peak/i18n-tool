const xlsx = require('xlsx');
const fs = require('fs');
const pathFunc = require('path');
const dirpath = process.argv.slice(2)[0];
let countArr = [];

const getMsgFilesInfo = path => {
    fs.readdir(path, (err, files) => {
        if (err) {
            console.warn(err);
        } else {
            files.forEach(filename => {
                // 拼接子目录路径
                const filePath = pathFunc.join(path, filename);
                fs.stat(filePath, (err, stat) => {
                    if (err) {
                        console.log('获取文件stat失败');
                    } else {
                        // const isFile = stats.isFile();
                        const isDir = stat.isDirectory();
                        if (isDir) {
                            if (filename === 'messages' ) {
                                countArr.push({
                                    dir: filePath.slice(filePath.indexOf('src')),
                                    url:pathFunc.join(filePath, 'index.js')
                                });
                            } else {
                                getMsgFilesInfo(filePath);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                            }
                        }
                    }
                });
            });
        }
    });
};

getMsgFilesInfo(dirpath);

// 异步读取文件内容
const readContent = file => new Promise((resolve, reject) => {
        fs.readFile(file['url'], (err, data) => {
            if (err) {
                console.log('文件读取失败');
                reject(err);
            } else {
                const regx = /.*defineMessages\(((.|\n)*)\);/g;
                const jsonStr = regx.exec(data.toString());
                // 将字符串转换为js对象
                const json = eval("("+jsonStr[1]+")");
                console.log(file['url'])
                console.log(jsonStr[1]);
                const f = [];
                // 组装Excel数据结构
                for(i in json) {
                    f.push({    
                            key: json[i]['id'],
                            中文: json[i]['defaultMessage'],
                            英文: '',
                            繁体: '' 
                        }
                    );
                }
                f.path = file.dir;
                resolve(f);
            }
        });
    });
  const isAllEqual = array => {
        if(array.length>0){
           return !array.some(function(value,index){
             return value !== array[0];
           });   
        }else{
            return true;
        }
    }
setTimeout(() => {
    const dataArr = [];
        countArr.forEach(file => {
            dataArr.push(readContent(file));
        });
    const dataList = Promise.all(dataArr);
    const _headers = ['key', '中文', '英文', '繁体'];
    const headers = _headers.map((v, i) => Object.assign({}, {v: v, position: String.fromCharCode(65+i) + 2 }))
                        .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {});

    const formatData = data => data.map((v, i) => _headers.map((k, j) => Object.assign({}, {    v: v[k], position: String.fromCharCode(65+j) + (i+3) })))
    .reduce((prev, next) => prev.concat(next))
    .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {});

    const wb = {
        SheetNames: [],
        Sheets: {}
    };

    const title = [];
    dataList.then(result => {
        const moduleMap = {}; 
        const modulesArr = [];
        result.forEach((data, i) => {
            const modules = data.map(item => item.key.slice(0, item.key.indexOf('.')));
            const firstKey = data[0]['key'];
            const moduleName = firstKey.slice(0, firstKey.indexOf('.'));
            // 将同一根路径下的msg合并到同一个excel
            // 相同且不存在key
            if (isAllEqual(modules)) {
                if (!moduleMap[moduleName]) {
                    moduleMap[moduleName] = data;
                } else {
                    moduleMap[moduleName] = moduleMap[moduleName].concat(data)
                }
            } else {
                data.forEach(item => {
                    const module = item.key.slice(0, item.key.indexOf('.'));
                    if (!moduleMap[module]) {
                        moduleMap[module] = [];
                        moduleMap[module].push(item);
                    } else {
                        moduleMap[module].push(item);
                    }
                })
            }
        });
        const moduleKeysArr = Object.keys(moduleMap);
        moduleKeysArr.forEach(key => {
            moduleMap[key]['filename'] = key;
            modulesArr.push(moduleMap[key]);
        });
        return modulesArr;
    }).then(result => {
        result.forEach((data, i) => {
            title[0] = `模块: ${data.filename}`;
            // 获取模块文件名
            const fileName = data.filename;
            const _title = title.map((v, i) => Object.assign({}, {v: v, position:           String.fromCharCode(65+i) + 1 }))
            .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {});

            // 合并 headers 和 data
            const output = Object.assign({}, _title, headers, formatData(data));
            // 获取所有单元格的位置
            const outputPos = Object.keys(output);
            // 计算出范围
            const ref = outputPos[0] + ':' + outputPos[outputPos.length - 1];
            wb.SheetNames.push(fileName);
            wb.Sheets[fileName] = Object.assign({}, output, { '!ref': ref });
        });
        
        // 导出 Excel
        xlsx.writeFile(wb, 'hahaha.kry_messages.xlsx');
    });
}, 300);