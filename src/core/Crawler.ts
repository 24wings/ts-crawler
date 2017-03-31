import * as socket from 'socket.io';
import superagent = require('superagent');
import fs = require('fs');
import URL = require('url');
import uuid = require('uuid');
import { ExtractType } from './ExtractType';
import path = require('path');
import cheerio = require('cheerio');
import { UnVisitUrls } from './UnvisitUrls';
import { config } from './configs';
import { CONFIG } from './Config';
import { IEight0, eight0Model } from './model';



export interface Field {
    name: string;
    alias: string;
    required?: boolean;
    extract: {
        selector: string;
        type?: ExtractType;
        attr: string;
    }

}

export interface Data {

}

export interface CrawlerConfig {
    /**
     * 域名删选
     */
    domains: string[];
    // 入口链接
    scanUrls: string[];
    contentUrlRegexes: RegExp[];// 符合内容的链接
    listUrlRegexes: RegExp[];//符合的列表页
    fields: Field[];
    extractFieldCallBack?: (field, data, page) => Data;
}



export class Crawler {
    visitedLink = new Set<string>();
    unvisitedLink = new UnVisitUrls<string>();

    // unVisitedLink= new Queue()
    /**
     * 爬虫的启动入口
     */
    async  start() {

        await this.extractLinks(this.config.scanUrls[0]);


        // console.log(this.unvisitedLink.size());
        while (this.unvisitedLink.hasNext()) {
            /**
             * 暂停五秒,一次轮回
             */
            await new Promise((resovle, reject) => {
                setTimeout(() => { resovle() }, 5000);
            });
            for (var i = 0; i < 5; i++) {
                if (!this.unvisitedLink.hasNext()) break;
                // 检查数据库里是否已经访问,可以用$or操作一下检查5个
                var url = this.unvisitedLink.dequeue();

                var isExisit = await eight0Model.findOne({ url }).count().exec();
                // 若已经入库,不再抓取
                if (isExisit) {
                    this.log('已经入库', url);
                    break;
                } else {
                    this.log('dequeue.txt', url);
                    this.config.listUrlRegexes.forEach(regexp => {
                        regexp.test(url) ? this.extractLinks(url) : '';
                    });
                    this.config.contentUrlRegexes.forEach(regexp => {
                        regexp.test(url) ? this.extractContent(url) : '';
                    });

                }
            }

        }

    }
    async downloadPage(url: string, data: string) {
        var filename = path.join(CONFIG.downloadsDir, uuid.v4() + '.html');
        if (fs.existsSync(url)) {
            this.log('错误', `文件名:${filename} 已经存在`);
        } else {
            fs.writeFile(filename, data, async (err) => {
                if (err) this.log('错误', err);
                // 内容提取完了,将链接和爬取的html文件入库
                var model = await new eight0Model({ url, filename }).save()
                this.log("下载文件", model.filename);
            });
        }

    }
    async extractLinks(url: string) {
        var response = await superagent.get(url).withCredentials().send();
        await this.downloadPage(url, response.text);
        this.visitedLink.add(url);
        this.extreactLinksFromText(url, response.text);
    }
    async extractContent(url: string) {
        var response = await superagent.get(url).withCredentials().send();
        await this.downloadPage(url, response.text);
    }
    async extractData() {
        var data: any = {};
        this.config.fields.forEach(field => {
            data.name = field.name;
            data.alias = field.alias;
            switch (field.extract.type) {
                case ExtractType.attr:
                    data.value = $(field.extract.selector).attr(field.extract.attr);
                    break;
                case ExtractType.text:
                    data.value = $(field.extract.selector).text();
                    break;
            }
            this.dataSet.push(data);
        });
    }
    extreactLinksFromText(url: string, text: string) {
        var $ = cheerio.load(text);
        $('a').each((index, link) => {
            let href: string = link.attribs['href'];
            if (href) {
                if ((!href.startsWith('http://')) && (!href.startsWith('https://'))) {
                    href = URL.resolve(url, href);
                }
                if (!this.visitedLink.has(href)) {
                    /**
                     * 将列表页的链接放入未访问的链接集合里
                     */
                    // console.log(href);
                    this.config.listUrlRegexes.forEach(regexp => {
                        if (regexp.test(href)) {
                            this.unvisitedLink.enqueue(href);
                            this.log('scanListUrl.txt', href);
                        }
                    });
                    this.config.contentUrlRegexes.forEach(regexp => {
                        if (regexp.test(href)) {
                            this.log('detailUrl.txt', href);
                            this.unvisitedLink.enqueueFirst(href);
                        }
                    });

                }
            }
        });

    }



    constructor(public config: CrawlerConfig, public io?: SocketIO.Server) { }

    emitEvent(event: string, data: any) {
        if (this.io) this.io.emit(event, data);
        else console.log('event:', event, 'data:' + data);
    }

    log(fileName, data) {
        console.log(fileName, data);
        fs.appendFile('logs/' + fileName, data + ',\n', (err) => {
            if (err) throw err;

        });
    }

}


new Crawler(config).start();