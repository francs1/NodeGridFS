var net = require("net");
var fs = require("fs");

//文件服务地址
var HOST = "192.192.192.146";

//文件服务端口
var PORT = 6543;

//测试文件下载的目录
var FILEPATH = "D:\\NodeGridFS\\fsclient\\tempfile\\";

//测试需要下载的文件的标识
var FILENAME = "570b20e0c69062235ec52a1d";

//测试文件的扩展名
var EXTEND = ".png";

var resBuf = new Buffer(0);

var unRead = true;
var realfilelength = 0;

var client = net.connect({port:PORT,host:HOST},() => {
	console.log("client connected");

	client.setEncoding("binary");
	//第二个区域文件流长度(3位)+文件流
	var buf1 = new Buffer(FILENAME,"binary");
	var bf1length = buf1.length.toString();

	//第一个区域扩展名长度(3位)+扩展名
	var filelen = FILENAME.length;

	var flen = PadLeft(filelen.toString(),3,"0");

	var buf0 = new Buffer(flen,"binary");

	//合并buffer
	var chunks = [buf0,buf1];
	buf = Buffer.concat(chunks);

	console.log(buf.length);

	console.log("buf="+buf);
	client.write(buf,"binary",() => {
		console.log("文件请求完毕");
	});
}).on("data",(data)=>{
	resBuf += data;

if(unRead){
	unRead = false;
	var filelength = resBuf.slice(0,10).toString();
	console.log("filelength="+filelength);
	realfilelength = parseInt(filelength,10);
	console.log("realfilelength="+realfilelength);
}

var currentlength = resBuf.length;
console.log("currentlength="+currentlength);

if(currentlength==realfilelength+10){
	console.log("rB.length1="+resBuf.length);
	var rbuf0 = resBuf.slice(0,10);
	console.log("rB.length2="+resBuf.length);
	console.log("rb0="+rbuf0);
	var rbuf1 = resBuf.slice(10);
	console.log("rbuf1.length="+rbuf1.length);

	var fpath = FILEPATH + FILENAME + EXTEND;
	fs.writeFile(fpath, rbuf1, {encoding:"binary"}, (err,data)=>{
		if(err){
		console.log(err);
	}
	client.end();
});
}
	console.log("data.length="+data.length);
	//client.end();
}).on("end",()=>{
	console.log("disconnect");
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
