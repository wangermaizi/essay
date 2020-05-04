const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const sqlQueryFn = require('../public/javascripts/sqlQuery');
const url = require('url');

function allowOrigin (req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Content-Type', 'application/json;charset=utf-8');
    next()
}

// 获取分类id以及内容, 项目启动之后必须要先访问一遍该路径
router.get('/getCate', allowOrigin , async function (req, res, next) {
    let originUrl = "http://finance.haiwainet.cn/";
    let result = await axios.get(originUrl);
    let $ = cheerio.load(result.data);
    let cateList = $(".wnav a").text();
    let time = 0;
    let cateArr = [];
    $(".wnav a").each(function (index, item) {
        // $(item).text()
        cateArr.push({
            cateId:time,
            cate:$(item).text(),
            href:$(item).attr('href')
        });
        time++;
    });
    let selectSql = "select * from catalist";
    let sqlResult = await sqlQueryFn(selectSql);
    if (Array.from(sqlResult).length === 0) {
        cateArr.forEach((item, index)=>{
            let sqlStr = `INSERT INTO catalist ( cateId, cate, href )
                       VALUES
                       ( ?, ? ,?);`;
            sqlQueryFn(sqlStr, [item.cateId, item.cate, item.href])
        });
        res.send(cateArr)
    } else {
        res.send(Array.from(sqlResult))
    }
    // console.log(cateArr);
});

// 获取新闻的分类和分页ID, 需要传入分类的ID 和 分页的Page (两者均为数字)
router.get('/getNewsList/:id/:page', allowOrigin, async function (req, res, next) {
    // id 为新闻id, page:未页数
    let newsCateId = req.params.id;
    newsCateId = parseInt(newsCateId);
    let newsListPage = req.params.page;
    newsListPage = parseInt(newsListPage);
    console.log(newsCateId);
    // 先获取到数据库关于其分类的URl, 再拼接新的URL
    let sqlStr = "select href from catalist where cateId=?";
    let sqlResult = await sqlQueryFn(sqlStr,[newsCateId]);
    // console.log(Array.from(sqlResult)[0].href + newsListPage + ".html");
    // 拼接好URL 开始查询是否有这个分类的分类分页, 没有就开始爬取并且返回
    let seleceStr = "select * from newslist where cateId=? limit ?,10";
    let selectResult = await sqlQueryFn(seleceStr,[newsCateId, newsListPage]);
    if (Array.from(selectResult).length > 0) {
        res.send(Array.from(selectResult))
    } else {
        if (newsListPage === 1) {
            newsListPage = "index"
        }
        let reqResult = await axios.get(Array.from(sqlResult)[0].href+newsListPage+".html");
        // console.log(reqResult);
        let $ = cheerio.load(reqResult.data);
        // let doc = $('.w650.show_list.fl ul li').html();
        let dataList = [];
        console.log($('.w650.show_list.fl ul li').length);
        $('.w650.show_list.fl ul li').each((index,item)=>{
            // let jj = cheerio.load($(item).html());
            // let title = jj("a").text();
            // let href = jj("a").attr("href");
            // let publishTime = jj("span").text();
            let title = $(item).children("a").text();
            let href = $(item).children("a").attr("href");
            let newsObj = url.parse(href);
            let newsPath = newsObj.path.split('/').pop();
            newsPath = newsPath.split('.')[0];
            let publishTime = $(item).children("span").text();
            if (!(title === "" || publishTime === "")) {
                dataList.push({
                    title:title,
                    newsId:newsPath,
                    publishTime:publishTime,
                    href:href
                })
                let insetSql = "INSERT INTO newslist (newsId, title, href, publishTime,cateId) VALUES (?, ?, ?, ?, ?)";
                sqlQueryFn(insetSql,[newsPath, title, href, publishTime, newsCateId]);
            }
        });
        res.send(dataList);
    }
});

// 获取新闻内容, 需要传入参数: 分类iD 新闻Id
router.get('/newsInfo/:cateId/:newsId', allowOrigin, async function (req, res, next) {
    let newsId = req.params.newsId;
    let cataId= req.params.cateId;
    // console.log(cataId);
    cataId = parseInt(cataId);
    let selectSql = "select * from newsinfo where newsId=? and cateId=?";
    let sqlResult = await sqlQueryFn(selectSql,[newsId, cataId]);
    // console.log(sqlResult);
    if (Array.from(sqlResult).length > 0) {
        res.send(Array.from(sqlResult))
    } else {
        // console.log(newsId, cataId);
        let selectHref = await sqlQueryFn("SELECT href FROM `newslist` as n WHERE n.newsId=? AND n.cateId=?;",[newsId, cataId]);
        let href = Array.from(selectHref)[0].href;
        let reqResult = await axios.get(href);
        let $ = cheerio.load(reqResult.data);

        let title = $(".show_text.fl .show_wholetitle").text();
        let subTitle = $(".show_text.fl .show_shorttitle").text();
        let time = $(".show_text.fl .contentExtra span.first").text();
        let origin = $(".show_text.fl .contentExtra span:nth-child(2) a").text();
        let content = $(".show_text.fl .contentMain").html();
        let writer = $(".show_text.fl .contentMain p.writer").text();

        // 插入数据库
        let insetSql = "INSERT INTO newsinfo (newsId, title, publishTime, content, cateId, publishmen, subTitle) VALUES (?, ?, ?, ?, ?, ?, ?)";
        sqlQueryFn(insetSql,[newsId,title,time,content,cataId,writer,subTitle]);
        let option = {
            title,
            subTitle,
            time,
            origin,
            content,
            writer
        };
        res.json(option);
    }
});



module.exports = router;