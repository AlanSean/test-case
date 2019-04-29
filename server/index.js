const http = require('http');
const fs = require('fs');
const path =require("path");
const url =require("url");
const request = require("request");
const {
        writeHeader,
        fileFactory
} = require("./http.js");


var libFilePath = path.resolve('./lib');
var lib,liext;
console.log(libFilePath)
fs.readdir(libFilePath,(err,files) =>{

    if(err) {
        console.log(err)
    } else {
        lib = files;
    }

})

var param = {
    css:"text/css",
    js:"application/javascript",
    html:"text/html;charset=utf-8"
}

var server = http.createServer((req,res)=>{
    //req 接收客户端数据
    //res 向客户端发送数据
        var url = req.url;
        ext = req.url.match(/([^.]+|)$/)[0];
        if(url == '/lib'){
            li = "";
            lib.map( item => {
                li += `<li>
                    <a href=${url}/${item} >${item}</a>
                </li>`;
            })
            var datas = fs.readFileSync(path.resolve(__dirname,'../static/css/index.css'));
            writeHeader(res)(200)({
                'Content-Type':"text/html;charset=utf-8"
            })(String(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <meta http-equiv="X-UA-Compatible" content="ie=edge">
                        <title>lib</title>
                        <style>
                            ${datas}
                        </style>
                    </head>
                    <body>
                        ${li}
                    </body>
                </html>
            `))
            return false;
        }
        switch (ext) {
            case 'css':
            case 'js':
                try {
                    var  datas= fs.readFileSync(path.resolve(__dirname,'../'+req.url));

                    writeHeader(res)(200)({
                        'Content-Type':{
                            "css":"text/css",
                            "js":"application/javascript"
                        }[ext]
                    })(datas);

                } catch (e) {

                    writeHeader(res)(404)({
                        'Content-Type':{
                            "css":"text/css",
                            "js":"application/javascript"
                        }[ext]
                    })('加载出错');

                }
            break;
            default:
                fs.readFile(path.resolve(__dirname,'../'+req.url+'/index.html'),'utf-8',(err,data)=>{
                    if(err)  {
                        writeHeader(res)(404)({'Content-Type':"text/html;charset=utf-8"})("页面错误");
                    } else {
                        writeHeader(res)(200)({
                            'Content-Type':"text/html;charset=utf-8"
                        })(data);
                    }
                })
        }
}).listen(811)
