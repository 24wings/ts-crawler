import * as socket from 'socket.io';
import superagent = require('superagent');
import fs = require('fs');
import { ExtractType } from './ExtractType';
import path = require('url');
import cheerio = require('cheerio');
import { UnVisitUrls } from './UnvisitUrls';
import { config } from './configs';



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
    dataSet: { image: string, title: string }[] = [];
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
            for (var i = 0; i < 50; i++) {
                if (!this.unvisitedLink.hasNext()) break;
                var url = this.unvisitedLink.dequeue();
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
    async extractLinks(url: string) {

        var response = await superagent.get(url).withCredentials().send();
        this.visitedLink.add(url);
        this.extreactLinksFromText(url, response.text);

    }
    async extractContent(url: string) {
        var response = await superagent.get(url).withCredentials().send();
        this.extreactLinksFromText(url, response.text);
        var $ = cheerio.load(response.text);

        var data: any = {};
        console.log(url);
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
        });
        this.dataSet.push(data);
        this.log('data.txt', data);


    }
    extreactLinksFromText(url: string, text: string) {
        var $ = cheerio.load(text);
        $('a').each((index, link) => {
            let href: string = link.attribs['href'];
            if (href) {
                if ((!href.startsWith('http://')) && (!href.startsWith('https://'))) {
                    href = path.resolve(url, href);
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
                            this.unvisitedLink.enqueue(href);
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
            console.log(data);
        });
    }

}


new Crawler(config).start();