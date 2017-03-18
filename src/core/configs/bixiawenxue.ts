import { CrawlerConfig } from '../Crawler';
import { ExtractType } from '../ExtractType';

export var configs: CrawlerConfig = {
    domains: ["http://www.80s.tw"],// 网站域名，设置域名后只处理这些域名下的网页
    scanUrls: ["http://www.80s.tw"],// 入口页链接，分别从这些链接开始爬取
    contentUrlRegexes: [/http:\/\/www.80s.tw\/.+\/.+/],// 内容页url的正则，符合这些正则的页面会被当作内容页处理
    listUrlRegexes: [/http:\/\/www.80s.tw\/\w.\/list/],// 列表页url的正则，符合这些正则的页面会被当作列表页处理
    fields: [  // 从内容页中抽取需要的数据  
        {
            name: "article_title",
            alias: "文章标题",
            extract: {
                selector: ".dlname.nm a",// 默认使用xpath抽取
                attr: 'href',
                type: ExtractType.attr
            },
            required: true // required为true表示该项数据不能为空
        }
    ]
};