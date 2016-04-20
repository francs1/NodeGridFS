var net = require("net");
var fs = require("fs");

function loadFileClient() {

}

module.exports = loadFileClient;

loadFileClient.prototype.load = function (fileid, filename, userid, extention, callback) {

    //文件服务地址
    var HOST = "localhost";

    //文件服务端口
    var PORT = 6543;

    //测试文件下载的目录
    var FILEPATH = "./public/books/";

    //测试需要下载的文件的标识
    //var FILENAME = "570b20e0c69062235ec52a1d";

    //测试文件的扩展名
    //var EXTEND = ".png";

    var unRead = true;
    var realfilelength = 0;
    var buf = new Buffer(0);
    var buf1 = new Buffer(0);
    var FILENAME = fileid;
    var EXTEND = extention;
    var returnpath = "";
    var client = net.connect({ port: PORT, host: HOST }, function () {
        console.log("下载客户端.开始连接");
        client.setEncoding("binary");
        client.write(new Buffer(FILENAME, "binary"), "binary", function () {
            console.log("下载客户端.文件请求信息发送完毕");
            data = null;
        });
    }).on("data", function (data) {

        buf += data;
        //console.log("下载客户端.文件接收中.buf.len=" + buf.length);

        if (unRead) {
            unRead = false;
            var filelength = buf.slice(0, 10).toString();
            realfilelength = parseInt(filelength, 10);
        }

        var currentlength = buf.length;

        if (currentlength == realfilelength + 10) {
            console.log("下载客户端.文件已经全部下载");
            buf1 = new Buffer(buf.slice(0, 10), 'binary');
            buf = new Buffer(buf.slice(10), 'binary');
            console.log('下载客户端.通知服务端ok');
            buf = Buffer.concat([buf1, buf]);
            returnpath = FILEPATH + userid + "/" + filename;
            callback(null, returnpath, buf);
            console.log("下载客户端.执行callback，rbuf1.len=:" + buf.length);
            client.end();
        }
        data = null;

    }).on("end", function () {

        console.log("下载客户端.断开socket连接");
        buf = null;
        buf1 = null;
        client.end();
    });
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
