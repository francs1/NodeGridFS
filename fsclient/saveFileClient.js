var net = require("net");
var fs = require("fs");

//文件服务地址
var HOST = "192.192.192.146";

//文件服务端口
var PORT = 6542;

//测试用文件路径
var UPLOADFILE = "D:\\NodeGridFS\\fsclient\\files\\nodejs.png";

fs.readFile(UPLOADFILE,{encoding:"binary"},(err,data)=>{
	if(err){
		console.log(err);
		return;
	}
	var client = net.connect({port:PORT,host:HOST},() => {
		console.log("client connected");

		//第二个区域文件流长度(6位)+文件流
		var buf1 = new Buffer(data,"binary");
		var bf1length = buf1.length.toString();

		buf0content = PadLeft(bf1length,10,"0");
		console.log(buf0content);


		//第一个区域扩展名长度(3位)+扩展名
		var buf0 = new Buffer(buf0content,"binary");


		//合并buffer
		var chunks = [buf0,buf1];
		buf = Buffer.concat(chunks);

		console.log(buf.length);
		client.write(buf,"binary",() => {
			console.log("文件上传完毕");
		});
	}).on("data",(data)=>{
		console.log(data.toString());
		client.end();
	}).on("end",()=>{
		console.log("disconnect");
	});
});

function PadLeft(str,len,char){
	var arr = new Array(len);

	var strlen = str.length;

	var charlen = len - strlen;

	var temp = "";
	for(var i=0;i<charlen;i++){
		temp += char;
	}
	temp += str;

	return temp;
}
