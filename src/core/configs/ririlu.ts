export var configs = {
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