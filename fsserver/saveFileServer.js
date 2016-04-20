var net = require('net');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var GridStore = require('mongodb').GridStore;
var ObjectID = require('mongodb').ObjectID;
var mongo = new MongoClient();
var myDB = null;

//临时存储文件目录
var tempfilepath = "D:\\NodeGridFS\\fsserver\\tempfile\\";

//server.listen(port, [host], [backlog], [callback])
//指定连接的客户端地址，省略表示接受任何地址的请求
var HOST = "";

//文件服务监听端口
var PORT = 6542;

//mongodb服务器地址
var MONGODBHOST = "mongodb://localhost:27017/myFS";

var saveserver = net.createServer(function (socket) {

    console.log("上传服务端.建立socket连接");
    var buf = new Buffer(0);
    //var filebuf = new Buffer(0);
    socket.setEncoding("binary");
    //var filename = genFileName();
    var filename = new ObjectID().toString();
    var unRead = true;
    var realfilelength = 0;
    socket.on("data", function (data) {
        console.log("上传服务端.文件接收中...");
        buf += data;
        if (unRead) {
            unRead = false;
            var filelength = buf.slice(0, 10).toString();
            realfilelength = parseInt(filelength, 10);
        }

        var currentlength = buf.length;

        if (currentlength == realfilelength + 10) {
            console.log("上传服务端.文件接收完毕");
            var filelength = parseInt(buf.slice(0, 10), 10);
            buf = buf.slice(10, buf.length);
            var filePath = tempfilepath + filename

            MongoClient.connect(MONGODBHOST, function (err, db) {
                if (err) {
                    console.log("上传服务端.mongodb连接失败" + err);
                    return;
                }
                console.log("上传服务端.连接mongodb");
                var myFS = new GridStore(db, filename, "w");
                myFS.open(function (err, myFS) {
                    if (err) {
                        console.log("上传服务端.gridfs打开失败" + err);
                        return;
                    }
                    console.log("上传服务端.连接GridFS");
                    myFS.write(buf, function (err, myFS) {
                        console.log("上传服务端.文件写入GridFS,buf.length=" + buf.length);
                        if (err) {
                            console.log("上传服务端.写入gridfs失败" + err);
                            return;
                        }
                        myFS.close(function (err, result) {
                            if (err) {
                                console.log("上传服务端.关闭失败" + err);
                                return;
                            }
                            console.log("上传服务端.GridFS断开连接");
                            var filelen = filename.toString().length.toString();
                            filelen = PadLeft(filelen, 3, "0");
                            socket.write(filelen + filename.toString());
                            db.close();
                        });
                    });
                });
            });
        }
        data = null;
    });

    socket.on("end", function () {
        buf = new Buffer(0);
        buf = null;
        console.log("上传服务端.断开socket连接");
        socket.end();
    });
}).on('error', function (err) {
    throw err;
});

saveserver.listen(PORT, function () {
    address = saveserver.address();
    console.log('上传服务开始监听 %j', address);
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