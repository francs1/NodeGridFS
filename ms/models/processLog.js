var mongodb = require('./db');

/*
//ProcessLog日志，
bookid 书籍标识
bookowner  书籍所有人
name 操作人
processtype 操作类型（0收藏，1举报,2下载）
processtime  发生时间
remark  备注：
每个人对每本书只能收藏一次
每个人对每个书籍只能举报一次

每个人下载每本书，只扣一次分，上传资源者加等同的分；下载自己的书，不扣分，不加分。
首先查询出本书的作者

比较当前登录人和作者是否是同一人
是，则直接下载，不扣分也不加分--save

不是，则判断是否以前下载过
是，则直接下载，不扣分也不加分--save
不是，则判断当前人是否有充足的分可以扣
是，则扣除当前人的分，并给上传人加分--save
不是，则返回无法下载
*/

function ProcessLog(processLog) {
    this.bookid = processLog.bookid;
    this.bookowner = processLog.bookowner;
    this.name = processLog.name;
    this.processtype = processLog.processtype;
    this.processtime = new Date();
    if (processLog.remark) {
        this.remark = processLog.remark;
    }
    else {
        this.remark = "";
    }
}

module.exports = ProcessLog;

ProcessLog.prototype.save = function (callback) {
    var processLog = {
        bookid: this.bookid,
        bookowner: this.bookowner,
        name: this.name,
        processtype: this.processtype,
        processtime: this.processtime,
        remark: this.remark
    };

    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('processLogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.insert(processLog, {
                safe: true
            }, function (err, log) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, log[0]);
            });
        });
    });
};

ProcessLog.get = function (bookid, name, processtype, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }

        db.collection('processLogs', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({ bookid: bookid, name: name, processtype: processtype }, function (err, log) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, log);
            });
        });
    });

};
