var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var fs = require('fs');

var crypto = require('crypto');
var User = require('../models/user.js');
var Book = require('../models/book.js');
var Upload = require('../models/upload.js');
var SaveFileClient = require('../models/saveFileClient.js');
var LoadFileClient = require('../models/loadFileClient.js');
var Level = require('../models/level.js');
var Comment = require('../models/comment.js');
var ProcessLog = require('../models/processLog.js');

router.get('/', function (req, res, next) {
    var page = req.query.p ? parseInt(req.query.p) : 1;
    Book.getTen(null, page, 1, function (err, books, total) {
        if (err) {
            books = [];
        }
        res.render('index', {
            title: '书栈',
            books: books,
            page: page,
            isFirstPage: (page - 1) == 0,
            isLastPage: ((page - 1) * 10 + books.length) == total,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});


router.get('/user', checkLogin);
router.get('/user', function (req, res) {
    var page = req.query.p ? parseInt(req.query.p) : 1;
    var currentUser = req.session.user;
    var username = currentUser.name;

    console.log('username=' + username);
    Book.getTen(username, page, null, function (err, books, total) {
        if (err) {
            books = [];
        }
        res.render('user', {
            title: '我的',
            books: books,
            page: page,
            isFirstPage: (page - 1) == 0,
            isLastPage: ((page - 1) * 10 + books.length) == total,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

router.get('/reg', checkNotLogin);
router.get('/reg', function (req, res) {
    res.render('reg', {
        title: '注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

router.post('/reg', checkNotLogin);
router.post('/reg', function (req, res) {
    var name = req.body.name,
    password = req.body.password,
    repassword = req.body.repassword;

    if (password != repassword) {
        req.flash('error', '两次输入的密码不一致！');
        return res.redirect('/reg');
    }

    var md5 = crypto.createHash('md5'),
    password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
        name: req.body.name,
        password: password,
        email: req.body.email
    });

    User.get(newUser.name, function (err, user) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        if (user) {
            req.flash('error', '用户已存在！');
            return res.redirect('/reg');
        }
        newUser.save(function (err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            req.session.user = user;
            req.flash('success', '注册成功！');
            res.redirect('/');
        });
    });
});


router.get('/login', checkNotLogin);
router.get('/login', function (req, res) {
    res.render('login', {
        title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

router.post('/login', checkNotLogin);
router.post('/login', function (req, res) {
    var md5 = crypto.createHash('md5'),
    password = md5.update(req.body.password).digest('hex');

    User.get(req.body.name, function (err, user) {
        if (!user) {
            req.flash('error', '用户不存在！');
            return res.redirect('/login');
        }
        if (user.password != password) {
            req.flash('error', '密码错误！');
            return res.redirect('/login');
        } if (user.enablestatus != 1) {
            req.flash('error', '用户状态错误！');
            return res.redirect('/login');
        }

        req.session.user = user;
        req.flash('success', '登录成功！');
        res.redirect('/');
    })
});


router.get('/book', checkLogin);
router.get('/book', function (req, res) {

    var username = req.session.user.name;
    console.log(username);
    Upload.get(username, 0, function (err, uploads) {
        if (err) {
            console.log(err);
            uploads = [];
        }
        res.render('book', {
            title: '发布',
            user: req.session.user,
            uploads: uploads,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

});

router.post('/book', checkLogin);
router.post('/book', function (req, res) {
    var currentUser = req.session.user;
    var tags = [req.body.tag1, req.body.tag2, req.body.tag3];
    var bookid = req.body.bookid.toString().substr(0, 27);

    Upload.getbyid(bookid, function (err, upload) {
        if (err) {
            console.log(err);
        }
        var introduction = req.body.introduction;
        var extension = upload.extension;
        var mimetype = upload.mimetype;
        console.log("extension=" + extension + ",mimetype=" + mimetype);
        var book = new Book({
            bookid: bookid,
            bookname: req.body.bookname,
            bookservername: upload.filename,
            head: currentUser.picture,
            tags: tags,
            extension: extension,
            mimetype: mimetype,
            introduction: introduction,
            uploader: currentUser.name,
            costpoint: req.body.costpoint,
            uploadtime: new Date(),
            approvalstatus: 1
        });
        book.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            //查找level
            Level.get(function (err, levels) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }

                User.AddPointBookCount(currentUser.name, 1, 1, levels, function (err, ulevel) {
                    if (err) {
                        req.flash('error', err);
                        return res.redirect('/');
                    }
                    console.log(ulevel);
                    //更改upload状态
                    Upload.finish(bookid, 1, function (err) {
                        if (err) {
                            req.flash('error', err);
                            return res.redirect('/');
                        }

                        req.flash('success', '发布成功！');
                        res.redirect('/');
                    });
                });

            });
        });

    });
});

router.get('/logout', checkLogin);
router.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '登出成功！');
    res.redirect('/');
});

router.get('/upload', checkLogin);
router.get('/upload', function (req, res) {
    res.render('upload', {
        title: '上传',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

router.post('/upload', checkLogin);
router.post('/upload', function (req, res) {
    console.log(req.files);

    var filename = req.files.file1.name;
    var uploadfilename = req.files.file1.path.toString();
    console.log("uploadfilename=" + uploadfilename);
    var fileid = "";
    var fileowner = req.session.user;
    var filesize = req.files.file1.size;
    var extension = req.files.file1.extension;
    var mimetype = req.files.file1.mimetype;
    var uploadtime = new Date();
    var status = 0;
    //上传此文件到GridFS，回调函数返回fileid
    var saveFileClient = new SaveFileClient();

    //var fileid = '123';

    saveFileClient.save(uploadfilename, function (err, fileid) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/upload');
        }

        console.log("index.js-savefileclient.save-fileid=" + fileid);
        var upload = new Upload({
            filename: filename,
            extension: extension,
            mimetype: mimetype,
            fileid: fileid,
            fileowner: fileowner.name,
            filesize: filesize,
            uploadtime: uploadtime,
            status: status
        });
        upload.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/upload');
            }
            //删除临时文件
            fs.unlink(uploadfilename, function (err) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/upload');
                }
                req.flash('success', '上传成功！');
                res.redirect('/book');
            });
        });

    });
});

/*
首先查询出本书的作者

比较当前登录人和作者是否是同一人
是，则直接下载，不扣分也不加分--save

不是，则判断是否以前下载过
是，则直接下载，不扣分也不加分--save
不是，则判断当前人是否有充足的分可以扣
是，则扣除当前人的分，并给上传人加分--save
不是，则返回无法下载
*/

router.get('/download/:bookid', function (req, res) {

    var bookid = req.params.bookid;
    var currentUser = req.session.user;
    var currentName = currentUser.name;
    var userid = currentUser._id.toString();
    console.log("userid=" + userid);
    var downloadpath = "./public/books/" + userid + "/";

    //先为下载的目录做准备
    if (fs.existsSync(downloadpath)) {
        console.log(downloadpath + '已经存在');
    } else {
        fs.mkdirSync(downloadpath);

        console.log(downloadpath + '创建完成');
    }

    Book.getOne(req.params.bookid, function (err, book) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        var extension = book.extension;
        var mimetype = book.mimetype;
        var filename = book.bookname;
        var serverpath = "./public/books/" + book.bookservername;
        var bookowner = book.uploader;
        var costpoint = book.costpoint;
        var processLog = new ProcessLog({
            bookid: bookid,
            bookowner: book.uploader,
            name: currentName,
            processtype: 2
        });
        console.log("currentName=" + currentName + ',bookowner=' + bookowner);

        ProcessLog.get(bookid, currentName, 2, function (err, log) {
            if (err) {
                console.log("查询操作日志失败");
            }
            if (log != null || currentName == bookowner || costpoint == 0) {
                //已经下载过，本人的资源，资源分为0   -》   此3中情况 无积分变动

                console.log('远程下载');
                var loadFileClient = new LoadFileClient();
                loadFileClient.load(bookid, book.bookservername, userid, extension, function (err, path, data) {
                    if (err) {
                        req.flash('error', err);
                        console.log("download error=" + err);
                        return res.redirect('/article');
                    }
                    processLog.save(function (err) {
                        if (err) {
                            console.log('proc_log_error=' + err);
                        }

                        Book.download(bookid, function (err) {
                            if (err) {
                                console.log('book.download err' + err);
                            }

                            //var filename = 'Nodejs中文指南.pdf';
                            filename = filename + "." + extension;
                            var userAgent = (req.headers['user-agent'] || '').toLowerCase();
                            console.log("filenamefilename=" + filename);
                            if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
                                res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
                            } else if (userAgent.indexOf('firefox') >= 0) {
                                res.setHeader('Content-Disposition', 'attachment; filename*="utf8\'\'' + encodeURIComponent(filename) + '"');
                            } else {
                                /* safari等其他非主流浏览器只能自求多福了 */
                                res.setHeader('Content-Disposition', 'attachment; filename=' + new Buffer(filename).toString('binary'));
                            }

                            console.log("download:1");

                            res.writeHead(200, { 'Content-Type': mimetype });
                            res.write(data, 'binary');
                            res.end();
                            data = null;
                        });
                    });
                });

            }
            else {//以下是有积分变动的

                //先判断是否有充足的积分
                User.get(currentName, function (err, user) {
                    if (err) {
                        console.log('user.get error=' + err);
                    }
                    var pp = parseInt(user.point, 10);
                    var cp = parseInt(costpoint, 10);

                    if (pp >= cp && pp >= 0 && cp >= 0) {//积分充足

                        console.log('远程下载');
                        var loadFileClient = new LoadFileClient();
                        loadFileClient.load(bookid, book.bookservername, userid, extension, function (err, path, data) {
                            if (err) {
                                req.flash('error', err);
                                console.log("download error=" + err);
                                return res.redirect('/article');
                            }

                            //添加下载记录
                            processLog.save(function (err) {
                                if (err) {
                                    console.log('proc_log_error=' + err);
                                }

                                console.log('bendi_xiazai:costpoint=' + costpoint);

                                //扣分
                                User.AddPoint(currentName, cp * -1, function (err) {
                                    if (err) {
                                        console.log('扣分失败' + err);
                                    }
                                    //加分
                                    User.AddPoint(bookowner, cp * 1, function (err) {
                                        if (err) {
                                            console.log('加分失败' + err);
                                        }

                                        Book.download(bookid, function (err) {
                                            if (err) {
                                                console.log('book.download err' + err);
                                            }

                                            //var filename = 'Nodejs中文指南.pdf';
                                            filename = filename + "." + extension;
                                            var userAgent = (req.headers['user-agent'] || '').toLowerCase();
                                            console.log("filenamefilename=" + filename);
                                            if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
                                                res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
                                            } else if (userAgent.indexOf('firefox') >= 0) {
                                                res.setHeader('Content-Disposition', 'attachment; filename*="utf8\'\'' + encodeURIComponent(filename) + '"');
                                            } else {
                                                /* safari等其他非主流浏览器只能自求多福了 */
                                                res.setHeader('Content-Disposition', 'attachment; filename=' + new Buffer(filename).toString('binary'));
                                            }
                                            console.log("download:3");
                                            res.writeHead(200, { 'Content-Type': mimetype });
                                            res.write(data, 'binary');
                                            res.end();
                                        });
                                    });

                                });

                            });
                        });
                    }
                    else {
                        req.flash('error', '积分不足');
                        console.log("积分不足");
                        return res.redirect('back');
                    }
                });
            }

        })
    });
});


router.get('/article', checkLogin);
router.get('/article/:bookid', function (req, res) {
    var bookid = req.params.bookid.toString();
    Book.getOne(bookid, function (err, book) {
        if (err) {
            console.log("getOne error");
            req.flash('error', err);
            return res.redirect('/');
        }
        console.log("article/bookid:" + book);

        Upload.getOne(bookid, function (err, up) {
            if (err) {
                console.log("getOne error");
                req.flash('error', err);
                return res.redirect('/');
            }

            var filesize = parseFloat(up.filesize, 10)

            filesize = (filesize / 1024 / 1024).toFixed(2);

            console.log("filesize=" + filesize);


            res.render('article', {
                title: '书籍详情',
                book: book,
                filesize: filesize,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });

        });


    });
});

router.get('/links', function (req, res) {
    res.render('links', {
        title: '感悟',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});


router.get('/search', function (req, res) {
    var keyword = req.query.keyword;
    Book.search(keyword, function (err, books) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('search', {
            title: 'SEARCH:' + keyword,
            books: books,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

/*

//Comment下载后才能评论,每个人对每本书只能评论一次，不能评论自己的书
bookid  书籍标识
commentator 评论人
score     评分0~5分(-2,-1,0,1,2)
content   评论内容
publishedtime 发表时间

*/
router.post('/article', function (req, res) {
    var date = new Date();
    var bookid = req.body.bookid;
    var commentator = req.session.user.name;
    var score = parseInt(req.body.score, 10);
    var content = req.body.content;
    var publishedtime = date;
    var newcomment = {
        bookid: bookid,
        commentator: commentator,
        score: score,
        content: content,
        publishedtime: publishedtime
    };
    console.log("post:/article/bookid=" + bookid);
    var comment = new Comment(newcomment);
    comment.save(function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        console.log("before addscore");
        //给用户打分
        User.AddScore(commentator, score, function (err) {
            if (err) {
                console.log("AddScore.error=" + err);
                req.flash('error', err);
                return res.redirect('back');
            }
            console.log("after addscore");
            Book.comment(bookid, function (err) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('back');
                }
                console.log("book comment");
                req.flash('success', '留言成功！');
                res.redirect('back');
            })
        });
    });
});

router.get('/archive', function (req, res) {
    Book.getArchive(function (err, books) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('archive', {
            title: '存档',
            books: books,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

router.get('/tags', function (req, res) {
    Book.getTags(function (err, books) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('tags', {
            title: '标签',
            books: books,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

router.get('/tags/:tag', function (req, res) {
    var tag = req.params.tag;
    Book.getTag(tag, function (err, books) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('tag', {
            title: 'TAG:' + tag,
            books: books,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

router.get('/edit/:bookid', checkLogin);
router.get('/edit/:bookid', function (req, res) {
    var currentUser = req.session.user;
    var bookid = req.params.bookid;

    var username = req.session.user.name;
    console.log(username);
    Upload.get(username, null, function (err, uploads) {
        if (err) {
            console.log(err);
            uploads = [];
        }
        Book.edit(bookid, function (err, book) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            res.render('edit', {
                title: '编辑书籍',
                user: req.session.user,
                uploads: uploads,
                book: book,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });

        });
    });
});

router.post('/edit/:bookid', checkLogin);
router.post('/edit/:bookid', function (req, res) {
    var currentUser = req.session.user;
    var bookid = req.params.bookid;
    var bookname = req.body.bookname;
    var introduction = req.body.introduction;
    var costpoint = req.body.costpoint;
    var book = {
        bookname: bookname,
        introduction: introduction,
        costpoint: costpoint
    };

    console.log(bookid);
    console.log(book);

    Book.update(bookid, book, function (err) {
        var url = encodeURI('/edit/' + bookid);
        if (err) {
            req.flash('error', err);
            return res.redirect(url);
        }
        req.flash('success', '修改成功').toString();
        res.redirect(url);
    });
})

router.get('/remove/:bookid', checkLogin);
router.get('/remove/:bookid', function (req, res) {
    var currentUser = req.session.user;
    var bookid = req.params.bookid;
    Book.remove(bookid, function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        req.flash('success', '删除成功！');
        res.redirect('/');
    });
});

router.get('/level', checkLogin);
router.get('/level', function (req, res) {

    var currentUserName = req.session.user.name;
    Level.get(function (err, levels) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        //
        User.get(currentUserName, function (err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.session.user = user;
            var point = user.point;
            res.render('level', {
                title: '修为',
                user: req.session.user,
                point: point,
                levels: levels,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        })
    })
});


router.get('/rule', checkLogin);
router.get('/rule', function (req, res) {
    res.render('rule', {
        title: '规则',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});


function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录！');
        res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录！');
        res.redirect('back');
    }
    next();
}


module.exports = router;


//module.exports = function (app) {
//    app.get('/', function (req, res) {
//        res.render('index', { title: 'Express' });
//    });
//}
