import superagent = require('superagent');
import cheerio = require('cheerio');
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
    helperUrlRegexes: RegExp[];//符合的列表页
    fields: Field[];
    extractFieldCallBack?: (field, data, page) => Data;
}



export class Crawler {
    visitedLink = new Set<string>();
    // unVisitedLink= new Queue()
    /**
     * 爬虫的启动入口
     */
    async  start() {

        var res = await superagent.get(this.config.scanUrls[0]).withCredentials();
        this.visitedLink.add(this.config.scanUrls[0]);
        var listUrls = await this.extractListPageUrl(res.text);
        var result = [];
        var count = 0, maxCount = 10;        // 控制多线程

        for (var i = 0; i < listUrls.length / 5; i++) {
            var tenItems = [];
            for (var j = 0; j < 5; j++) {
                var items = await this.extractItemUrlfromListPageUrl(listUrls[i]);
                tenItems.push(items);
            }
            result.push(...tenItems);
        }
        console.log(result);
    }
    async extract10Links() {

    }
    async extractItemUrlfromListPageUrl(listPageUrl: string) {
        var results = [];



        if (!listPageUrl.startsWith('http://')) {
            listPageUrl = this.config.scanUrls + listPageUrl;
        }
        if (this.visitedLink.has(listPageUrl)) {
            return [];
        }

        console.log('开始抓取', listPageUrl);
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

            this.config.helperUrlRegexes.forEach(regex => {
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

    constructor(public config: CrawlerConfig) { }




}



var configs = {
    domains: ["qiushibaike.com"],// 网站域名，设置域名后只处理这些域名下的网页
    scanUrls: ["http://www.qiushibaike.com"],// 入口页链接，分别从这些链接开始爬取
    contentUrlRegexes: [/http:\/\/www\.qiushibaike\.com\/article\/\d+/],// 内容页url的正则，符合这些正则的页面会被当作内容页处理
    helperUrlRegexes: [/http:\/\/www\.qiushibaike\.com\/(8hr\/page\/\d+.*)?/, /article\/\d+/],// 列表页url的正则，符合这些正则的页面会被当作列表页处理
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

new Crawler(configs).start()