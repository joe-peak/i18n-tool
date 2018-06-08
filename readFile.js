const fs = require('fs');
const pathFunc = require('path');
const dirpath = '/Users/keruyun_joe/workspace/gitlab/supply-merchandise/src/pages';
const msg = '/Users/keruyun_joe/workspace/gitlab/supply-merchandise/src/pages/attributes/Attribute';

let countArr = [];
const fileDisplay = path => {
    fs.readdir(path, (err, files) => {
        if (err) {
            console.warn(err);
        } else {
            files.forEach(filename => {
                const filePath = pathFunc.join(path, filename);
                fs.stat(filePath, (err, stat) => {
                    if (err) {
                        console.log('获取文件stat失败');
                    } else {
                        // const isFile = stats.isFile();
                        const isDir = stat.isDirectory();
//                         if (isFile) {
//                             console.log(filePath);
// 　　　　　　　　　　　　　　　　　// 读取文件内容
//                             var content = fs.readFileSync(filePath, 'utf-8');
//                             console.log(content);
//                         }
                        if (isDir) {
                            if (filename === 'messages' ) {
                                countArr.push({
                                    dir: filePath,
                                    url:pathFunc.join(filePath, 'index.js')
                                });
                            } else {
                                fileDisplay(filePath);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                            }
                        }
                    }
                });
            });
        }
    });
};

fileDisplay(dirpath);

const readContent = file => new Promise((resolve, reject) => {
        fs.readFile(file['url'], (err, data) => {
            if (err) {
                console.log('文件读取失败');
                reject(err);
            } else {
                // {   key: '1',
                //         中文: 'test1',
                //         英文: '30',
                //         繁体: 'China' 
                //     }
                const regx = /.*defineMessages\(((.|\n)*)\);/g;
                const jsonStr = regx.exec(data.toString());
                console.log('****************');
                const json = eval("("+jsonStr[1]+")");
                // console.log(json);
                const f = [];
                for(i in json) {
                    f.push({    
                            key: json[i]['id'],
                            中文: json[i]['defaultMessage'],
                            英文: '',
                            繁体: '' 
                        }
                    );
                }
                resolve(f);
                // console.log(f);
            }
        });
    });

setTimeout(() => {
    const dataArr = [];
    countArr.forEach(file => {
        dataArr.push(readContent(file));
    });
    Promise.all(dataArr).then(result => {
        console.log(result);
    });
}, 300);