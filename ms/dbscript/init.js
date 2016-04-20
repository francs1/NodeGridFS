//load('d:\\NodeGridFS\\ms\\dbscript\\init.js')
var mongo = new Mongo('localhost');
var myDB = mongo.getDB('blog');
var managerColl = myDB.getCollection('managers');
managerColl.insert({'name':'admin','password':'123'});

//level级别
//levelnumber  级别数值
//levelname    级别名称

var levelColl = myDB.getCollection('levels');
//levelColl.insert({'levelnumber':'','levelname':''});
levelColl.insert({'levelnumber':	0	,'levelname':'不堪一击'});
levelColl.insert({'levelnumber':	5	,'levelname':'毫不足虑'});
levelColl.insert({'levelnumber':	10	,'levelname':'不足挂齿'});
levelColl.insert({'levelnumber':	15	,'levelname':'初学乍练'});
levelColl.insert({'levelnumber':	20	,'levelname':'勉勉强强'});
levelColl.insert({'levelnumber':	25	,'levelname':'初窥门径'});
levelColl.insert({'levelnumber':	30	,'levelname':'初出茅庐'});
levelColl.insert({'levelnumber':	35	,'levelname':'略知一二'});
levelColl.insert({'levelnumber':	40	,'levelname':'普普通通'});
levelColl.insert({'levelnumber':	45	,'levelname':'平平常常'});
levelColl.insert({'levelnumber':	50	,'levelname':'平淡无奇'});
levelColl.insert({'levelnumber':	55	,'levelname':'粗懂皮毛'});
levelColl.insert({'levelnumber':	60	,'levelname':'半生不熟'});
levelColl.insert({'levelnumber':	65	,'levelname':'登堂入室'});
levelColl.insert({'levelnumber':	70	,'levelname':'略有小成'});
levelColl.insert({'levelnumber':	75	,'levelname':'已有小成'});
levelColl.insert({'levelnumber':	80	,'levelname':'鹤立鸡群'});
levelColl.insert({'levelnumber':	85	,'levelname':'驾轻就熟'});
levelColl.insert({'levelnumber':	90	,'levelname':'青出於蓝'});
levelColl.insert({'levelnumber':	95	,'levelname':'融会贯通'});
levelColl.insert({'levelnumber':	100	,'levelname':'心领神会'});
levelColl.insert({'levelnumber':	105	,'levelname':'炉火纯青'});
levelColl.insert({'levelnumber':	110	,'levelname':'了然於胸'});
levelColl.insert({'levelnumber':	115	,'levelname':'略有大成'});
levelColl.insert({'levelnumber':	120	,'levelname':'已有大成'});
levelColl.insert({'levelnumber':	125	,'levelname':'豁然贯通'});
levelColl.insert({'levelnumber':	130	,'levelname':'非比寻常'});
levelColl.insert({'levelnumber':	135	,'levelname':'出类拔萃'});
levelColl.insert({'levelnumber':	140	,'levelname':'罕有敌手'});
levelColl.insert({'levelnumber':	145	,'levelname':'技冠群雄'});
levelColl.insert({'levelnumber':	150	,'levelname':'神乎其技'});
levelColl.insert({'levelnumber':	155	,'levelname':'出神入化'});
levelColl.insert({'levelnumber':	160	,'levelname':'傲视群雄'});
levelColl.insert({'levelnumber':	165	,'levelname':'登峰造极'});
levelColl.insert({'levelnumber':	170	,'levelname':'无与伦比'});
levelColl.insert({'levelnumber':	175	,'levelname':'所向披靡'});
levelColl.insert({'levelnumber':	180	,'levelname':'一代宗师'});
levelColl.insert({'levelnumber':	185	,'levelname':'精深奥妙'});
levelColl.insert({'levelnumber':	190	,'levelname':'神功盖世'});
levelColl.insert({'levelnumber':	195	,'levelname':'举世无双'});
levelColl.insert({'levelnumber':	200	,'levelname':'惊世骇俗'});
levelColl.insert({'levelnumber':	205	,'levelname':'撼天动地'});
levelColl.insert({'levelnumber':	210	,'levelname':'震古铄今'});
levelColl.insert({'levelnumber':	215	,'levelname':'超凡入圣'});
levelColl.insert({'levelnumber':	220	,'levelname':'威镇寰宇'});
levelColl.insert({'levelnumber':	225	,'levelname':'空前绝后'});
levelColl.insert({'levelnumber':	230	,'levelname':'天人合一'});
levelColl.insert({'levelnumber':	235	,'levelname':'深藏不露'});
levelColl.insert({'levelnumber':	240	,'levelname':'深不可测'});
levelColl.insert({'levelnumber':	245	,'levelname':'返璞归真'});
levelColl.insert({'levelnumber':	255	,'levelname':'极轻很轻'});


