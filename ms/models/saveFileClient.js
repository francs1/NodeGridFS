var net = require("net");
var fs = require("fs");

function saveFileClient() {

}
module.exports = saveFileClient;

saveFileClient.prototype.save = function (path, callback) {
    //文件服务地址
    var HOST = "localhost";

    //文件服务端口
    var PORT = 6542;

    //测试用文件路径
    //var UPLOADFILE = "";

    var fileid = "";
    var buf = new Buffer(0);
    var buf1 = new Buffer(0);

    fs.readFile(path, { encoding: "binary" }, function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        console.log("上传客户端.读取磁盘文件:" + path);
        var client = net.connect({ port: PORT, host: HOST }, function () {
            console.log("上传客户端.开始连接");
            //第二个区域文件流长度(6位)+文件流
            buf = new Buffer(data, "binary");
            var bf1length = buf.length.toString();
            buf0content = PadLeft(bf1length, 10, "0");
            //第一个区域扩展名长度(3位)+扩展名            
            buf1 = new Buffer(buf0content, "binary");
            //合并buffer            
            buf = Buffer.concat([buf1, buf]);
            client.write(buf, "binary", function () {
                console.log("上传客户端.文件上传完毕");
            });
        }).on("data", function (data) {
            fileid = data.toString();
            client.end();
            data = null;
        }).on("end", function () {            
            buf = null;
            buf1 = null;
            client.end();
            console.log("上传客户端.断开socket连接");
            callback(null, fileid);
        });
    });

};


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
