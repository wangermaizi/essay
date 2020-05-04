// 监听上传路径
var express = require('express');
const multer = require("multer");

// 实例化路由
var router = express.Router();
const upload = multer({dest:'/upload/uploadImg'});
router.post('/uploadImg', upload.single('file'), function (req, res) {
    console.log(req.body.file);
    console.log("接收到请求");
    res.json(
        {
        code:0,
        url:'11111',
        data:{
            url:'1111'
        }
    })
});
router.post("/excel", function (req, res, next) {
    // console.log(req.body);
    try {
        // 对于服务端的请求,尽量使用字符串的形式进行传输
        let data = req.body.data;
        data = JSON.parse(data);
        console.log(data.title);
    } catch (e) {
        console.log(e);
    }
    res.json({
        msg:"success",
        code:200
    })
});

// router.post('/aa', function (req, res) {
//     console.log(req.body.message);
//     res.send("hello");
// })

module.exports = router;