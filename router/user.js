const express = require('express');

//1.创建路由对象
const router = express.Router();

//引入axios
const axios = require('axios');


//传入图片模块
var bodyParser = require('body-parser'); // 这个模块是获取post请求传过来的数据。
var formidable = require('formidable');
var fs = require('fs');


//数据库模块
//1.导入mysql模块
const mysql = require('mysql')
    //2.建立与MySQL数据库的连接
const db = mysql.createPool({
    // host: '127.0.0.1',
    host: '10.0.224.12',
    user: 'david',
    password: 'David1234',
    database: 'hsdata',
    port: '3306'
})

// 检测mysql模块能否正常工作
db.query('SELECT 1', (err, results) => {
        if (err) return console.log(err.message)
        console.log(results, "数据库正常工作", )
    })
    //测试接口
router.get('/test', (req, res) => {
    console.log("open-id!!!", req.headers['x-wx-openid'])
    console.log("测试数据成功输出!")
    res.send("测试数据成功返回!")
})

//用户登录初始
// router.get('/login_first', (req, res) => {
//         let code = req.query.code
//         let appid = "wxf0c51f4340673571"
//         let secret = "b1a7e7587d5513430d026e0612bcc070"
//         let session_key = ""
//         let openid = ""
//         axios.get('https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + code + '&grant_type=authorization_code')
//             .then(function(response) {
//                 console.log("axios请求成功!", response.data);
//                 // session_key = response.data.session_key
//                 openid = response.data.openid
//                 res.send(openid)
//             })
//             .catch(error => {
//                 console.log(error);
//             });
//     })

//用户登录, 传入openid
router.get('/login', (req, res) => {
    //判断数据库是否有该openid
    let res_data = [];
    db.query('select count(*) as num from user where openid=?', req.headers['x-wx-openid'], (err, results) => {
        res_data.push("1")
        res_data.push(err)
        res_data.push("2")
        res_data.push(results)
        if (err) return console.log("失败了", err.message)
            //表中查找openid,没有则插入新用户
        console.log("成功", results[0].num)
        if (results[0].num == 0) {
            const newuser = { openid: req.headers['x-wx-openid'], status: 0, days: "2022-02-02 10:10:10", times: 0 }
            db.query('INSERT INTO user SET ?', newuser, (err, results) => {
                res_data.push("3")
                res_data.push(err)
                res_data.push("4")
                res_data.push(results)
                if (err) return console.log(err.message) //失败
                if (results.affectedRows === 1) { console.log('插入数据成功') } //成功
            })
        }
        db.query('SELECT * FROM user WHERE openid=?', req.headers['x-wx-openid'], (err, results) => {
            // res_data.push(err)
            // res_data.push(results)                
            res_data.push("5")
            res_data.push(err)
            res_data.push("6")
            res_data.push(results)
            if (err) return console.log(err.message) //失败
                // res.send(results[0])
        })
    })
    res.send(res_data)
});
//转换为管理员
router.get('/change', (req, res) => {
    console.log(req.query.code)
    db.query('UPDATE user SET status=1 WHERE id=?', parseInt(req.query.code), (err, results) => {
        if (err) return console.log(err.message) //失败
        console.log('管理员数据成功!') //成功
    })
});
//返回所有学生数据
router.get('/student', (req, res) => {
    db.query('select * from user', (err, results) => {
        if (err) return console.log("失败了", err.message)
            //表中查找openid,没有则插入新用户
        console.log("成功", results[0])
        res.send(results)
    })
});
//保存名字
router.get('/savename', (req, res) => {
    console.log(req.query.name, req.query.code)
    db.query('UPDATE user SET name=? WHERE id=?', [req.query.name, req.query.code], (err, results) => {
        if (err) {
            res.send(err)
            return console.log("失败了", err.message)
        }
        //表中查找openid,没有则插入新用户
        console.log("成功", results)
        res.send(results)
    })
});
//修改时间
router.get('/change_date', (req, res) => {
    let date = req.query.date + " 00:00:00"
    db.query('UPDATE user SET days=? WHERE id=?', [date, req.query.code], (err, results) => {
        if (err) return console.log("日期更新失败了", err.message)
            //表中查找openid,没有则插入新用户
        console.log("日期更新成功")
        res.send(results)
    })
});

//修改课程数量
router.get('/change_times', (req, res) => {
    db.query('UPDATE user SET times=? WHERE id=?', [req.query.times, req.query.code], (err, results) => {
        if (err) return console.log("次数更新失败了", err.message)
            //表中查找openid,没有则插入新用户
        console.log("次数更新成功")
        res.send(results)
    })
});

//返回所有教练数据
router.get('/master', (req, res) => {
    db.query('select * from master', (err, results) => {
        if (err) return console.log("失败了", err.message)
            //表中查找openid,没有则插入新用户
        console.log("成功", results[0])
        res.send(results)
    })
});
//添加教练数据
router.get('/add_master', (req, res) => {
    db.query('INSERT INTO master SET ?', { name: req.query.name }, (err, results) => {
        if (err) return console.log("失败了", err.message)
        console.log("成功", results)
        res.send(results)
    })
});
//编辑教练数据
router.get('/change_master', (req, res) => {
    console.log(req.query.name, req.query.code)
    db.query('UPDATE master SET name=? WHERE id=?', [req.query.name, req.query.code], (err, results) => {
        if (err) return console.log("教练更新失败了", err.message)
            //表中查找openid,没有则插入新用户
        console.log("教练更新成功")
        res.send(results)
    })
});
//删除教练
router.get('/delete_master', (req, res) => {
    db.query('DELETE FROM master WHERE id=?', req.query.id, (err, results) => {
        if (err) return console.log("教练删除失败", err.message)
            //表中查找openid,没有则插入新用户
        console.log("教练删除成功")
        res.send(results)
    })
});
//获得课程数据
router.get('/course', (req, res) => {
    db.query('select * from course ', (err, results) => {
        if (err) return console.log("课程获取失败", err.message)
        console.log("课程获取成功")
        res.send(results)
    })
});
//按时间筛选课程信息
router.get('/day_course_info', (req, res) => {
    db.query('select * from course where class_date=? ORDER BY start_time', req.query.ymd, (err, results) => {
        if (err) return console.log("课程获取失败", err.message)
        console.log("课程获取成功")
        res.send(results)
    })
});
//获得教练名称生成课程
router.get('/add_course_by_coach', (req, res) => {
    console.log(req.query)
    for (let time = 10; time < 22; time++) {
        let intime = `00:${time}:00`
        db.query('INSERT INTO course (start_time,class_date,master,user_num) VALUES (?,?,?,?)', [intime, req.query.ymd, req.query.coach, 1], (err, results) => {
            if (err) return console.log("课程获取失败", err.message)
            console.log("添加成功")
        })
    }
    return
});
//删除课程
router.get('/delete_class', (req, res) => {
    db.query('DELETE FROM course WHERE classid=?', req.query.classid, (err, results) => {
        if (err) return console.log("课程删除失败", err.message)
            //表中查找openid,没有则插入新用户
        console.log("课程删除成功")
        res.send("成功")
        return
    })
});
//添加单独课程
router.get('/single_add', (req, res) => {
    db.query('INSERT INTO course (start_time,class_date,master,user_num) VALUES (?,?,?,?)', [req.query.time, req.query.ymd, req.query.coach, req.query.num], (err, results) => {
        if (err) return console.log("课程获取失败", err.message)
        console.log("添加成功")
    })
    res.send("成功")
});
//预约课程
router.get('/book_class', (req, res) => {
    db.query('select user1,user2 from course WHERE classid=?', req.query.classid, (err, results) => {
        if (err) return console.log("失败了", err.message)
        if (results[0].user1 == "null") {
            db.query('UPDATE course SET user1=? WHERE classid=?', [req.query.username, req.query.classid], (err, results) => {
                if (err) return console.log("预约失败了", err.message)
                    //表中查找openid,没有则插入新用户
                console.log("预约成功")
                res.send("成功")
            })
        } else if (results[0].user2 == "null") {
            db.query('UPDATE course SET user2=? WHERE classid=?', [req.query.username, req.query.classid], (err, results) => {
                if (err) return console.log("预约失败了", err.message)
                    //表中查找openid,没有则插入新用户
                console.log("预约成功")
                res.send("成功")
            })
        }
        console.log("返回user值", results[0])
    })

});
//返回所有预约课程信息
router.get('/change_book', (req, res) => {
    db.query('select * from course where user1=? or user2=? ORDER BY class_date', [req.query.username, req.query.username], (err, results) => {
        if (err) return console.log("查询失败", err.message)
            //表中查找openid,没有则插入新用户
        console.log("查找预约成功")
        res.send(results)
    })
});

//取消预约user1
router.get('/cancel_user1', (req, res) => {
    db.query('UPDATE course SET user1=? WHERE classid=?', ['null', req.query.classid], (err, results) => {
        if (err) return console.log("取消预约失败了", err.message)
            //表中查找openid,没有则插入新用户
        console.log("取消预约成功")
        res.send("成功")
    })

});
//取消预约user2
router.get('/cancel_user2', (req, res) => {
    db.query('UPDATE course SET user2=? WHERE classid=?', ['null', req.query.classid], (err, results) => {
        if (err) return console.log("取消预约失败了", err.message)
            //表中查找openid,没有则插入新用户
        console.log("取消预约成功")
        res.send("成功")
    })
});
//上传图片
router.post('/add_picture', (req, res) => {
    console.log(req.files[0], "req数据")
    let old = req.files[0].path //获取path:
    fs.renameSync(old, './public/' + req.files[0].fieldname + '.jpg');
    // fs.renameSync(old, './public/' + req.files[0].path + path.parse(req.files[0].originalname).ext)
    console.log("图片存储了没?")
    res.send("结束")
});
// router.get('/active/:id/:name', (req, res) => {
//     res.send(req.params)
//     console.log("2个动态参数已返回", req.params)
// })
// router.post('/post_json', (req, res) => {
//     console.log("post_json被访问了")
//     console.log(res.body)
// })

//3.将路由对象共享出去
module.exports = router