import * as socket from 'socket.io';
import superagent = require('superagent');
import path = require('url');
import cheerio = require('cheerio');
import { UnVisitUrls } from './UnvisitUrls';
var configs = {
    domains: ["qiushibaike.com"],// 网站域名，设置域名后只处理这些域名下的网页
    scanUrls: ["http://www.qiushibaike.com"],// 入口页链接，分别从这些链接开始爬取
    contentUrlRegexes: [/http:\/\/www\.qiushibaike\.com\/article\/\d+/],// 内容页url的正则，符合这些正则的页面会被当作内容页处理
    listUrlRegexes: [/http:\/\/www\.qiushibaike\.com\/(8hr\/page\/\d+.*)?/],// 列表页url的正则，符合这些正则的页面会被当作列表页处理
    fields: [  // 从内容页中抽取需要的数据  
        {
            name: "article_title",
            alias: "文章标题",
            selector: "//*[@id='single-next-link']//div[contains(@class,'content')]/text()[1]",// 默认使用xpath抽取
            required: true // required为true表示该项数据不能为空
        },
        {
            name: "article_content",
            alias: "文章内容",
            selector: "//*[@id='single-next-link']",
            required: true
        },
        {
            name: "article_author",
            alias: "作者",
            selector: "//div[contains(@class,'author')]//h2"

        },
        {
            name: "article_publish_time",
            alias: "文章发布日期",
            selector: "//div[contains(@class,'author')]//h2"
        }
    ]
};

export interface Field {
    name: string;
    alias: string;
    required?: boolean;
    selector: string;
}

export interface Data {

}

interface CrawlerConfig {
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
            console.log(this.unvisitedLink.size());
            await new Promise((resovle, reject) => {
                setTimeout(() => { resovle() }, 5000);
            });
            var url = this.unvisitedLink.dequeue();
            this.config.listUrlRegexes.forEach(regexp => {
                regexp.test(url) ? this.extractLinks(url) : '';
            });
            this.config.contentUrlRegexes.forEach(regexp => {
                regexp.test(url) ? this.extractContent(url) : '';
            });
        }



    }
    async extractLinks(url: string) {

        var response = await superagent.get(url).withCredentials().send();
        this.visitedLink.add(url);
        var $ = cheerio.load(response.text);
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
                    console.log(href);
                    this.config.listUrlRegexes.forEach(regexp => {
                        if (regexp.test(href)) {
                            this.unvisitedLink.enqueue(href);
                            console.log('扫描到列表页' + href);
                        }
                    });
                    this.config.contentUrlRegexes.forEach(regexp => {
                        if (regexp.test(href)) {
                            console.log('扫描到详情页' + href);
                            this.unvisitedLink.enqueue(href);
                        }
                    });

                }
            }
        });
    }
    async extractContent(url: string) {
        var response = await superagent.get(url).withCredentials().send();

    }

    async extractItemUrlfromListPageUrl(listPageUrl: string) {
        var results = [];
        if (!listPageUrl.startsWith('http://')) {
            listPageUrl = this.config.scanUrls[0] + listPageUrl;
        }
        if (this.visitedLink.has(listPageUrl)) {
            return [];
        }

        console.log('开始抓取', listPageUrl);
        if (this.io) this.io.emit('crawler-listPageUrl', listPageUrl);
        var response = await superagent.get(listPageUrl).withCredentials().send();
        var $ = cheerio.load(response.text);
        $('a').each((index, linkElement) => {
            this.config.contentUrlRegexes.forEach(regex => {
                var href = linkElement.attribs['href'];
                href ? results.push(href) : ''
            });
        });
        this.visitedLink.add(listPageUrl);
        return results;
    }

    extractListPageUrl(text: string): string[] {
        var $ = cheerio.load(text);
        var result = [];
        $('a').each((index, linkElement) => {

            this.config.listUrlRegexes.forEach(regex => {
                var href = linkElement.attribs['href'];
                // console.log(regex, href);
                // console.log(regex, href)
                if (regex.test(href)) {
                    result.push(href);
                }
            });
        });
        return result;

    }

    constructor(public config: CrawlerConfig, public io?: SocketIO.Server) {

    }

    emitEvent(event: string, data: any) {
        if (this.io) this.io.emit(event, data);
        else console.log('event:', event, 'data:' + data);
    }



}


new Crawler(configs).start();