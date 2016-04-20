var net = require('net');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var GridStore = require('mongodb').GridStore;
var ObjectID = require('mongodb').ObjectID;
var mongo = new MongoClient();
var myDB = null;

//临时存储文件目录
var tempfilepath = "/usr/local/NodeGridFS/fsserver/tempfile/";

//server.listen(port, [host], [backlog], [callback])
//指定连接的客户端地址，省略表示接受任何地址的请求
var HOST = "";

//文件服务监听端口
var PORT = 6542;

//mongodb服务器地址
var MONGODBHOST = "mongodb://localhost:27017/myFS";

var saveserver = net.createServer((socket)=>{
	//socket.end('goodbye');	
    var buf =new Buffer(0);

	socket.setEncoding("binary");
	var filename = genFileName();
	socket.write("019"+filename.toString());

	socket.on("data",(data)=>{
		//console.log(data.toString());
		buf+=data;
	});

	socket.on("end",()=>{
		console.log(buf.length);

		var filelength = parseInt(buf.slice(0,10),10);
		console.log(filelength);

		var filebuf = buf.slice(10,buf.length);
		var filePath = tempfilepath + filename
		fs.writeFile(filePath, filebuf,{encoding:"binary"},(err)=>{
			if(err){
				console.log(err);
				return;
			}

			mongo.connect(MONGODBHOST, function(err, db) {
            myDB = db;
            console.log("\nFiles Before Put:");
            // var fileId = new ObjectID();
            // console.log("fileID="+fileId);
            var myFS = new GridStore(db, filename, "w");
            myFS.open(function(err, myFS) {
            	// var dbFile = new Buffer("hello");
            	// console.log("dbFile.length="+dbFile.length);
            	myFS.writeFile(filePath, function(err, myFS){
    				if(err){
						console.log(err);
						return;
    				}
					console.log("success");
					fs.unlink(filePath,(err)=>{
						if(err){
							console.log(err);
							return;
						}
						console.log("临时文件已删除");
					});
    			});
            });    		
        });
			
	});
		
	console.log("filebuf.length=" + filebuf.length);
	console.log("end");

	socket.end();
	});
}).on('error',(err)=>{
	throw err;
});

saveserver.listen(PORT,()=>{
	address = saveserver.address();
	console.log('opened server on %j',address);
});



function getRandomNum(lbound, ubound) {
	return (Math.floor(Math.random() * (ubound - lbound)) + lbound);
}

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


function genFileName(){
	var timestamp = (new Date()).valueOf(); 

	var ran = getRandomNum(0,999999).toString();

	var strran = PadLeft(ran,6,"0");

	var filename = timestamp+strran;

	console.log("filename="+filename);

	return filename;
}