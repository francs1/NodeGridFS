var net = require('net');
var fs = require('fs');

var loadserver = net.createServer((socket)=>{
	//socket.end('goodbye');	
    var buf = new Buffer(0);

	socket.setEncoding("binary");
	//var filename = genFileName();
	//socket.write("019"+filename.toString());

	socket.on("data",(data)=>{
		console.log(data.toString());	
		buf=data;

		console.log(buf.length);

		var filelength = parseInt(buf.slice(0,3),10);
		console.log(filelength);

		var filebuf=buf.slice(3,buf.length);
		console.log(filebuf);

		fs.readFile("C:\\"+filebuf, {encoding:"binary"}, (err,data)=>{
			if(err){
				console.log(err);
			}
			var buf1 = new Buffer(data,"binary");

			var filelength = buf1.length.toString();
			var fileprfx = PadLeft(filelength,10,"0");

			var buf0 = new Buffer(fileprfx,"binary");
			console.log("buf0="+buf0);
			console.log("buf1.length="+buf1.length);

			var buf = Buffer.concat([buf0,buf1]);
			console.log("buf.length="+buf.length);			

			socket.end(buf,"binary");
		});

		console.log("filebuf.length=" + filebuf.length);
		console.log("end");

	});
	socket.on("end",()=>{		
		console.log("finished");
	});
}).on('error',(err)=>{
	throw err;
});

loadserver.listen(6543,()=>{
	address = loadserver.address();
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