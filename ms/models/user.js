var mongodb = require('./db');
var crypto = require('crypto');
/*User
name   名称（登录名）
password   密码
email    邮箱
picture  头像 string  default('')
userlevel   用户级别(0~255) int default(0)
point    积分，下载消耗积分，上传获得积分 int default(0)
score    评论分，被评论获得的积分，可按比例（1:5）兑换为point
bookcount  上传书数量
vip      是否是VIP（0不是，1是） int default(0)
enablestatus  状态(0禁用，1启用) int default(0)
*/

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
    if (user.picture) {
        this.picture = user.picture;
    }
    else {
        this.picture = '';
    }
    if (user.userlevel) {
        this.userlevel = user.userlevel;
    }
    else {
        this.userlevel = 0;
    }
    if (user.potin) {
        this.point = user.potin;
    }
    else {
        this.point = 0;
    }
    if (user.score) {
        this.score = user.score;
    }
    else {
        this.score = 0;
    }

    if (user.bookcount) {
        this.bookcount = bookcount;
    }
    else {
        this.bookcount = 0;
    }

    if (user.vip) {
        this.vip = user.vip;
    }
    else {
        this.vip = 0;
    }
    if (user.enablestatus) {
        this.enablestatus = user.enablestatus;
    }
    else {
        this.enablestatus = 1;
    }
}

module.exports = User;

User.prototype.save = function (callback) {
    var md5 = crypto.createHash('md5');
    var email_MD5 = md5.update(this.email.toLowerCase()).digest('hex');
    var picture = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";

    var user = {
        name: this.name,
        password: this.password,
        email: this.email,
        picture: picture,
        userlevel: this.userlevel,
        point: this.point,
        score: this.score,
        bookcount: this.bookcount,
        vip: this.vip,
        enablestatus: this.enablestatus
    };

    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }

        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.insert(user, {
                safe: true
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, user[0]);
            });
        });
    });
};

User.get = function (name, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }

        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({ name: name }, function (err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                console.log("User.js get user=" + user);
                callback(null, user);
            });
        });
    });
};

User.AddPoint = function (name, point, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update(
            { name: name },
            {
                $inc: { "point": point }
            },
                    function (err) {
                        mongodb.close();
                        if (err) {
                            return callback(err);
                        }
                        callback(null);
                    }
            );
        });
    });
};



User.AddPointBookCount = function (name, point, bookcount, levels, callback) {
    var p = parseInt(point, 10);
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.findOne({ name: name }, function (err, user) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }

                var cur_bookcount = parseInt(user.bookcount, 10) + 1;

                var lastlevel = 0;

                levels.forEach(function (lv, index) {
                    var ln = parseInt(lv.levelnumber);
                    if (cur_bookcount >= ln) {
                        lastlevel = ln;
                    }
                    else {
                    }
                });
                console.log("p=" + p);

                collection.update(
            { name: name },
            {
                $inc: { "point": p, "bookcount": bookcount },
                $set: { "userlevel": lastlevel }

            },
                    function (err) {
                        mongodb.close();
                        if (err) {
                            return callback(err);
                        }
                        callback(null, lastlevel);
                    }
            );

            });
        });
    });
};


User.AddScore = function (name, score, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            mongodb.close();
            return callback(err);
        }
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update(
                { name: name },
                {
                    $inc: { "score": score }
                },
                    function (err) {
                        mongodb.close();
                        if (err) {
                            return callback(err);
                        }
                        callback(null);
                    }
            );
        });
    });
};


