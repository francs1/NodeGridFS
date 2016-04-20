var mongodb = require('./db');

/*
//level级别 上传提升等级
levelnumber  级别数值
levelname    级别名称

*/

function Level(level) {
    this.levelnumber = level.levelnumber;
    this.levelname = level.levelname;
}

module.exports = Level;

Level.getLevelByCount = function (bookcount, callback) {
    var level = {
        levelnumber: this.levelnumber,
        levelname: this.levelname
    };

    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('levels', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (bookcount) {
                //选择小于等于目标值的数据
                levelnumber: { $lte: bookcount }
            }
            //按照等级从大到小排序
            collection.find(query).sort({
                levelnumber: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                //返回最大的一个数据
                callback(null, docs[0]);
            });
        });
    });
};

Level.get = function (callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('levels', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            //按照等级从小到大排序
            collection.find(query).sort({
                levelnumber: 1
            }).toArray(function (err, docs) {
                mongodb.close();                
                if (err) {                    
                    return callback(err);
                }                
                callback(null, docs);
            });
        });
    });
}