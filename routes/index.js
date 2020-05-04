var express = require('express');
var router = express.Router();
var Mock = require("mockjs");
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/form', function (req, res, next) {
  res.render('form')
});
router.get("/object", function (req, res, next) {
  res.render('object')
});
router.get("/error", function (req, res, next) {
  res.render('aboutError')
});
router.get("/variable", function (req, res, next) {
  res.render('variable')
});
router.get('/excel', function (req, res, next) {
  res.render('layui_excel')
});
router.get('/video', function (req, res, next) {
  let option = {
    url: "https://ksv-video-publish.cdn.bcebos.com/cfcbe0b4462d1ec9b0272d56bc9fc27cdb3bb853.mp4?auth_key=1634626297-0-0-71314fd8374a4a733716467060d13653",
    title:'短视频怎么赚钱'
  };
  res.render('video', {option})
});

// mock数据模拟
router.get('/mock', function (req, res, next) {
  var data = Mock.mock({
    'title': 'Syntax Demo',
    'string1|1-10': '★',
    'string2|3': 'value',
    'number1|+1': 100,
    'number2|1-100': 100,
    'number3|1-100.1-10': 1,
    'number4|123.1-10': 1,
    'number5|123.3': 1,
    'number6|123.10': 1.123,
    'boolean1|1': true,
    'boolean2|1-2': true,
    'object1|2-4': {
      '110000': '北京市',
      '120000': '天津市',
      '130000': '河北省',
      '140000': '山西省'
    },
    'object2|2': {
      '310000': '上海市',
      '320000': '江苏省',
      '330000': '浙江省',
      '340000': '安徽省'
    },

    'array1|1': ['AMD', 'CMD', 'KMD', 'UMD'],
    'array2|1-10': ['Mock.js'],
    'array3|3': ['Mock.js'],

    'function': function () {
      return this.title
    }
  });
  console.log(data);
  var ret = JSON.stringify(data, null, 4);
  // res.render('mock', {ret})
  res.send(ret);
});

// 处理pdf
router.get("/pdf", async function (req, res, next) {
  // res.send("PDF!!!");
  res.render('pdf_view');
});

// 实现翻书的效果
router.get('/turn', async function (req, res, next) {
  res.render('turnbook')
});

module.exports = router;
