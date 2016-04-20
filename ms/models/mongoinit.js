/*
一期用户前台功能

//Book书籍  objid
bookid    书籍标识*  string     on page
bookname  书籍名称*  string     on page
extension     扩展名（txt pdf） string
mimetype      mime类型  text/plain
introduction 简介    string    on page
categoryid   类别编号（OjbID），default(0)   管理员审核时确定
uploader   上传人name              session读取
uploadtime 上传时间            系统计算
costpoint  消耗积分*            on page
downloadtimes  下载数量        default(0)
comments        评论
commenttimes   评论数量        default(0)
totalscore     总得分          default(0)
approvalstatus  审批状态（0未审批，1通过，2拒绝）  default(0)


//Upload文件上传记录
filename    文件名
fileid      文件标识
fileowner   上传人  
filesize    文件大小
uploadtime  上传时间
status      状态（0未提交，1已提交）


//User用户
name   名称（登录名）
password   密码
email    邮箱
picture  头像 string  default('')
userlevel   用户级别(0~255) int default(0)
point    积分，下载消耗积分，上传获得积分 int default(0)
score    评论分，被评论获得的积分，可按比例（1:5）兑换为point
uploadbook  上传书数量
vip      是否是VIP（0不是，1是） int default(0)
enablestatus  状态(0禁用，1启用) int default(0)


//Comment下载后才能评论,每个人对每本书只能评论一次，不能评论自己的书
bookid  书籍标识
commentator 评论人
score     评分0~5分(-2,-1,0,1,2)
content   评论内容
publishedtime 发表时间


//Tags标签
tagname 标签名称


//BookTag标签
bookid  书籍标识
tagname 标签名称


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
是，则直接下载，不扣分也不加分

不是，则判断是否以前下载过
    是，则直接下载，不扣分也不加分
    不是，则判断当前人是否有充足的分可以扣
        是，则扣除当前人的分，并给上传人加分
        不是，则返回无法下载







//二期管理后台功能
//manager管理员
name  登录名
password   密码


//level级别
levelnumber  级别数值
levelname    级别名称


//Category类别
categoryid   类别编号
categoryname 类别名称
SuperiorID   上级类别编号（ObjID）
ShowLevel    可阅级别(0-255)


//examinelog 审核日志
bookid  书籍标识
managername  管理员
exametime  审核时间
point  审核给予积分(1~5分)
result  审核结果(0拒绝，1通过)






//三期扩展功能

//VIPSetting vip设置
name 用户名
viptype  VIP类型 0时间类，1次数类
begindate  有效期开始日期
enddate    有效期结束日期
remaintimes  剩余次数（类型1有效）

*/
