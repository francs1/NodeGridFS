var mongodb = require('./db');
//var markdown = require('markdown').markdown;

/*Book
bookid    书籍标识*  string     on page
bookname  书籍名称*  string     on page
bookservername  书籍服务器上的名称  string on page
tags      标签
extension     扩展名（txt pdf） string
mimetype        mimetype类型  text/plain
introduction 简介    string    on page
comments     评论
categoryid   类别编号（OjbID），default(0)   管理员审核时确定
uploader   上传人name    string    session读取
head       上传人头像
uploadtime 上传时间      date      系统计算
costpoint  消耗积分*     int       on page
downloadtimes  下载数量  int      default(0)
commenttimes   评论数量  int      default(0)
totalscore     总得分    int      default(0)
approvalstatus  审批状态（0未审批，1通过，2拒绝） int  default(0)

*/

function Book(book) {
    this.bookid = book.bookid;
    console.log(book.bookid);
    this.bookname = book.bookname;
    this.bookservername = book.bookservername;
    this.tags = book.tags;
    this.extension = book.extension;
    this.mimetype = book.mimetype;
    this.introduction = book.introduction;

    if (book.comments) {
        this.comments = book.comments;
    }
    else {
        this.comments = [];
    }

    if (book.pv) {
        this.pv = book.pv;
    }
    else {
        this.pv = 0;
    }

    if (book.categoryid) {
        this.categoryid = book.categoryid;
    }
    else {
        this.categoryid = 0;
    }

    var date = new Date();
    if (book.uploadtime) {
        this.uploadtime = book.uploadtime;
    }
    else {
        this.uploadtime = date;
    }

    this.uploader = book.uploader;
    this.head = book.head;
    this.costpoint = book.costpoint;

    if (book.downloadtimes) {
        this.downloadtimes = book.downloadtimes;
    }
    else {
        this.downloadtimes = 0;
    }

    if (book.commenttimes) {
        this.commenttimes = book.commenttimes;
    }
    else {
        this.commenttimes = 0;
    }

    if (book.totalscore) {
        this.totalscore = book.totalscore;
    }
    else {
        this.totalscore = 0;
    }

    if (book.approvalstatus) {
        this.approvalstatus = book.approvalstatus;
    }
    else {
        this.approvalstatus = 0;
    }
}

module.exports = Book;

Book.prototype.save = function (callback) {
    var book = {
        bookid: this.bookid,
        bookname: this.bookname,
        bookservername: this.bookservername,
        tags: this.tags,
        extension: this.extension,
        mimetype: this.mimetype,
        introduction: this.introduction,
        comments: this.comments = [],
        pv: this.pv,
        categoryid: this.categoryid,
        uploader: this.uploader,
        head: this.head,
        uploadtime: this.uploadtime,
        costpoint: this.costpoint,
        downloadtimes: this.downloadtimes,
        commenttimes: this.commenttimes,
        totalscore: this.totalscore,
        approvalstatus: this.approvalstatus
    };

    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('books', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.insert(book, {
                safe: true
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

Book.getAll = function (name, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('books', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            collection.find(query).sort({
                uploadtime: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};

Book.getArchive = function (callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('books', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.find({ approvalstatus: 1 }, {
                bookid: 1,
                bookname: 1,
                uploadtime: 1,
                uploader: 1,
                costpoint: 1,
                downloadtimes: 1
            }).sort({
                uploadtime: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                //docs.forEach(function (doc) {
                //    doc.introduction = markdown.toHTML(doc.introduction);
                //});

                callback(null, docs);
            });
        });
    });
};

Book.getTen = function (name, page, approvalstatus, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('books', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.uploader = name;
            }
            if (approvalstatus != null) {
                query.approvalstatus = approvalstatus;
            }
            collection.count(query, function (err, total) {
                collection.find(query, {
                    skip: (page - 1) * 10,
                    limit: 10
                }).sort({
                    uploadtime: -1
                }).toArray(function (err, docs) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    //docs.forEach(function (doc) {
                    //    doc.introduction = markdown.toHTML(doc.introduction);
                    //});

                    callback(null, docs, total);
                });
            });
        });
    });
};

Book.getOne = function (bookid, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection("books", function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "bookid": bookid
            }, function (err, doc) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }

                if (doc) {
                    collection.update({
                        "bookid": bookid
                    },
                    {
                        $inc: { "pv": 1 }
                    },
                    function (err) {
                        mongodb.close();
                        if (err) {
                            return callback(err);
                        }
                        callback(null, doc);
                    });
                }
                else {
                    mongodb.close();
                    callback(null, doc);
                }
            });
        });
    });
};

Book.getTags = function (callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('books', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.distinct("tags", { approvalstatus: 1 }, function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            })
        });
    });
};

Book.getTag = function (tag, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('books', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            collection.find({
                tags: tag
            }, {
                bookid: 1,
                bookname: 1,
                uploadtime: 1,
                uploader: 1,
                costpoint: 1,
                downloadtimes: 1
            }).sort(
            { uploadtime: -1 }
            ).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};

Book.edit = function (bookid, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('books', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                bookid: bookid
            }, function (err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, doc);
            });
        });
    });
};

Book.update = function (bookid, book, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('books', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            console.log("update.book=" + book);
            collection.update({
                bookid: bookid
            }, {
                $set:
                    {
                        bookname: book.bookname,
                        introduction: book.introduction,
                        costpoint: book.costpoint
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

Book.download = function (bookid, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('books', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({
                bookid: bookid
            }, {
                $inc: { "downloadtimes": 1 }
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

Book.comment = function (bookid, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('books', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({
                bookid: bookid
            }, {
                $inc: { "commenttimes": 1 }
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

Book.remove = function (bookid, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('books', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.remove(
            { bookid: bookid },
            { w: 1 },
            function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    })
};

Book.search = function (keyword, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection("books", function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var pattern = new RegExp(keyword, "i");
            collection.find({ bookname: pattern },
            { bookid: 1,
                bookname: 1,
                uploadtime: 1,
                uploader: 1,
                costpoint: 1,
                downloadtimes: 1
            }
            ).sort({
                uploadtime: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);

            });
        });
    });
};