var net = require('net');
var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var GridStore = require('mongodb').GridStore;
var ObjectID = require('mongodb').ObjectID;
var fs = require('fs');
var mongo = new MongoClient();
var myDB = null;

//server.listen(port, [host], [backlog], [callback])
//指定连接的客户端地址，省略表示接受任何地址的请求
var HOST = "";

//文件服务监听端口
var PORT = 6543;

//mongodb服务器地址
var MONGODBHOST = "mongodb://localhost:27017/myFS";

var socketarray = [];

var loadserver = net.createServer(function (socket) {

    console.log("下载服务端.建立socket连接");
    var buf = new Buffer(0);
    var buf1 = new Buffer(0);
    socket.setEncoding("binary");

    socket.on("connect", function () {
        console.log("下载服务端。被连接");
    });

    socket.on("data", function (data) {
        buf = data;
        var filelength = parseInt(buf.slice(0, 3), 10);
        var fileid = buf.slice(3, buf.length);
        MongoClient.connect(MONGODBHOST, function (err, db) {
            if (err) {
                console.log("下载服务端.mongodb连接失败" + err);
                return;
            }
            console.log("下载服务端.连接mongodb");
            GridStore.read(db, fileid, function (err, data) {
                if (err) {
                    console.log("下载服务端.读取gridfs失败" + err);
                    return;
                }
                console.log("下载服务端.从GridFS中读取文件");

                if (err) {
                    console.log("下载服务端.关闭失败" + err);
                    return;
                }
                console.log("data.length=" + data.length);
                var fileprfx = PadLeft(data.length.toString(), 10, "0");
                buf1 = new Buffer(fileprfx, "binary");
                buf = new Buffer(data);

                buf = Buffer.concat([buf1, buf]);
                socket.write(buf, "binary");
                console.log("下载服务端.通过socket将数据发回客户端,buf.len=" + buf.length);
                db.close();
            });
        });
        data = null;

    });
    socket.on("end", function () {
        console.log('下载服务端.触发end事件');        
        buf = null;
        buf1 = null;
        socket.end();
    });
}).on('error', function (err) {
    throw err;
});

loadserver.listen(PORT, function () {
    address = loadserver.address();
    console.log('下载服务开始监听 %j', address);
});

function getRandomNum(lbound, ubound) {
    return (Math.floor(Math.random() * (ubound - lbound)) + lbound);
}

function PadLeft(str, len, char) {
    var arr = new Array(len);

    var strlen = str.length;

    var charlen = len - strlen;

    var temp = "";
    for (var i = 0; i < charlen; i++) {
        temp += char;
    }
    temp += str;

    return temp;
}


function genFileName() {
    var timestamp = (new Date()).valueOf();

    var ran = getRandomNum(0, 999999).toString();

    var strran = PadLeft(ran, 6, "0");

    var filename = timestamp + strran;

    console.log("filename=" + filename);

    return filename;
}