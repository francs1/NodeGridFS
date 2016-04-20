var mongodb = require('./db');

/*

//Comment下载后才能评论,每个人对每本书只能评论一次，不能评论自己的书
bookid  书籍标识
commentator 评论人
score     评分0~5分(-2,-1,0,1,2)
content   评论内容
publishedtime 发表时间

*/

function Comment(comment) {
    this.bookid = comment.bookid;
    this.commentator = comment.commentator;
    this.score = comment.score;
    this.content = comment.content;
    if (comment.publishedtime) {
        this.publishedtime = comment.publishedtime;
    }
    else {
        this.publishedtime = new Date();
    }
}

module.exports = Comment;

Comment.prototype.save = function (callback) {
    var comment = {
        bookid: this.bookid,
        commentator: this.commentator,
        score: this.score,
        content: this.content,
        publishedtime: this.publishedtime
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
            collection.update(
            { bookid: comment.bookid },
            { $push: {
                'comments': comment
            }
            },
            function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
}