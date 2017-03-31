export var configs = {
    domains: ["http://3333av.co/html/tupian/siwa/"],// 网站域名，设置域名后只处理这些域名下的网页
    scanUrls: ["http://3333av.co/html/tupian/siwa/"],// 入口页链接，分别从这些链接开始爬取
    contentUrlRegexes: [
        /http:\/\/3333av.co\/html\/tupian\/siwa\/\d*\/\d*\/\d*/
    ],// 内容页url的正则，符合这些正则的页面会被当作内容页处理
    listUrlRegexes: [/http:\/\/3333av.co\/html\/tupian\/siwa\/index_\d*.html/],// 列表页url的正则，符合这些正则的页面会被当作列表页处理

};