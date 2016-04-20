var mongodb = require('./db');

/*
//upload文件上传记录
filename    文件名
fileid      文件标识
fileowner   上传人  
filesize    文件大小
uploadtime  上传时间
status      状态（0未提交，1已提交）
*/

function Upload(upload) {
    this.filename = upload.filename;
    this.fileid = upload.fileid;
    this.fileowner = upload.fileowner;
    this.filesize = upload.filesize;
    this.extension = upload.extension;
    this.mimetype = upload.mimetype;
    this.uploadtime = upload.uploadtime;
    this.status = upload.status;
}

module.exports = Upload;

Upload.prototype.save = function (callback) {
    var upload = {
        filename: this.filename,
        extension: this.extension,
        mimetype: this.mimetype,
        fileid: this.fileid,
        fileowner: this.fileowner,
        filesize: this.filesize,
        uploadtime: this.uploadtime,
        status: this.status
    };

    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }

        db.collection('uploads', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.insert(upload, {
                safe: true
            }, function (err, upload) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, upload);
            });
        });
    });
};

Upload.get = function (name, status, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('uploads', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.fileowner = name;
            }
            if (status != null) {
                query.status = status;
            }
            collection.find(query).sort({
                uploadtime: -1
            }).toArray(function (err, uploads) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                //docs.forEach(function (doc) {
                //    doc.introduction = markdown.toHTML(doc.introduction);
                //});
                console.log("Upload.get.uploads=" + uploads);
                callback(null, uploads);
            });
        });
    });
};

Upload.getOne = function (fileid, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('uploads', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (fileid) {
                query.fileid = fileid;
            }

            collection.find(query).sort({
                uploadtime: -1
            }).toArray(function (err, uploads) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                //docs.forEach(function (doc) {
                //    doc.introduction = markdown.toHTML(doc.introduction);
                //});
                console.log("Upload.get.uploads=" + uploads[0]);
                callback(null, uploads[0]);
            });
        });
    });
};


Upload.getbyid = function (fileid, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('uploads', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = { status: 0 };
            if (fileid) {
                query.fileid = fileid;
            }
            collection.findOne(query,
            function (err, upload) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                console.log("Upload.get.uploads=" + upload);
                callback(null, upload);
            });
        });
    });
};

//删除硬盘上的文件
Upload.finish = function (fileid, status, callback) {
    //将状态修改为1
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('uploads', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({
                fileid: fileid
            }, {
                $set:
                    {
                        status: status
                    }
            }, function (err) {
                mongodb.close();
                if (err) {                    
                    return callback(err);
                }
                callback(null);
            });
        });
    });

};


