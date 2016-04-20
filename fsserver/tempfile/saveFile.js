var net = require('net');
var fs = require('fs');

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

		fs.writeFile("C:\\"+filename, filebuf,{encoding:"binary"},(err)=>{
			if(err){
				console.log(err);
			}
			
		});

		console.log("filebuf.length=" + filebuf.length);
		console.log("end");

		socket.end();
	});
}).on('error',(err)=>{
	throw err;
});

saveserver.listen(6542,()=>{
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