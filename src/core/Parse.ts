/**
 * 解析文件
 */
import path = require('path');
import fs = require('fs');
import { CONFIG } from './Config';
import cheerio = require('cheerio');
var files = fs.readdirSync(CONFIG.downloadsDir);
files.forEach(file => {
    // console.log(file);
    //    var srcs = [];

    fs.readFile(path.join(CONFIG.downloadsDir, file), 'utf8', (err, data) => {

        var $ = cheerio.load(data);

        $('img').each((index, img) => {
            var data = JSON.stringify(img.attribs['src']) + ',' + '\n';
            fs.appendFile(__dirname + '/data.json', data, (err) => {
                if (err) throw err;
            });

        })
    })
})
