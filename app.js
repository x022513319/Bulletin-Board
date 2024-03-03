const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const path = require('path');
const session = require("express-session");
const ejs = require('ejs');
const momentTimezone = require('moment-timezone');
const fs = require('fs'); // file system
const app = express();
const portHTTPS = 3002;
const portHTTP = 3000;

const https = require('https');
// 讀取密鑰和證書文件
const options = {
    key: fs.readFileSync('D:/NCNU/side project practice/task2/certificate/key.pem'),
    cert: fs.readFileSync('D:/NCNU/side project practice/task2/certificate/cert.pem')
};

const server = https.createServer(options, app);

app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

//設定express-session middleware
app.use(session({
    secret: 'my-secret-key',
    resave: 'true',
    saveUninitialized: 'false'
}));


// password: enter your password
// database: enter your database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your-password',
    database: 'your-database',
    charset: 'utf8mb4'
});

db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('Connected to MySQL. PORT');

    //選擇資料庫
    db.query('USE task2', (err, results) => {
        if(err){
            throw err;
        }
        else{
            console.log('正在使用資料庫task2');
        }
    });
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// route
app.get('/', (req, res) => {

    if(req.session.user){
        //用戶身分
        const userEmail = req.session.user.email;

        //找該用戶的發文資料
        var getUserPostsQuery = 'SELECT * FROM `posts` WHERE `user_email` = ? ORDER BY `postTime` DESC';
        
        db.query(getUserPostsQuery, [userEmail], (err, userPosts) => {
            if(err){
                console.error('Error fetching posts:', err);
                return res.status(500).send('Internal server error. 內部伺服器錯誤');
            }

            res.render('index.ejs', {
                loggedIn: true,
                username: userEmail,
                posts: userPosts
            })
        });
    }
    else{
        res.render('index.ejs', {
            loggedIn: req.session.user ? true : false,
            username: req.session.user ? req.session.user.email : null,
            posts: null
        });
    }
});


app.post('/api/register', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    //check if the email exists
    var checkEmailQuery = 'SELECT * FROM `users` WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, results) => {
        if(err){
            console.error('查詢電子郵件是否存在出現錯誤：', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }

        if(results.length > 0){
            //電子郵件已經存在
            res.status(409).json({ error: '該電子郵件已註冊' });
            return;
        }

        //encrypt the password
        bcrypt.hash(password, 10, (err, hashedPassword) =>{
            if(err){
                console.error('密碼加密失敗：', err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }

            //可以使用ORM來改進安全性
            var insertUserQuery = 'INSERT INTO `users` (email, password) VALUES (?, ?)';
            db.query(insertUserQuery, [email, hashedPassword], (err, results) => {
                if(err){
                    console.error('註冊失敗：', err);
                    res.status(500).json({ error: '註冊失敗' });
                }
                else{
                    res.status(200).json({ message: '註冊成功' });
                }
            });
        });
    });
});


app.post('/api/login', (req, res) => {
    const email = req.body.email;
    console.log('email是:', req.body.email);
    const userInputPassword = req.body.password;
    const sql = 'SELECT `password` FROM `users` WHERE email = ?';

    db.query(sql, [email], (err, results) => {
        if(err){
            console.error('請求資料庫發生錯誤：', err);
            return res.status(500).send('Internal server error. 內部伺服器錯誤');
        }

        if(results.length === 0){
            //用戶不存在
            //為了安全，'此用戶不存在'應該改成'登入失敗'以避免被猜到帳密
            return res.status(401).send('登入失敗');
        }

        bcrypt.compare(userInputPassword, results[0].password, (err, isMatch) => {
            if(err){
                console.error('Error comparing passwords:', err);
                return res.status(500).send('Internal server error. 內部伺服器錯誤');
            }

            if(isMatch){
                console.log('密碼正確！');
                req.session.user = {
                    username: email,
                    email: email
                };
                res.status(200).send('成功登入！');
            }
            else{
                console.log('密碼錯誤！');
                return res.status(401).send('登入失敗！');
            }
        });
    });


});


app.get('/logout', (req, res) => {
    // 模擬用戶登出，清除 session 中的用戶信息
    console.log('req.session.user: ' + req.session.user);
    req.session.destroy();
    return res.redirect('/');
});

app.post('/api/post', (req, res) => {
    if(!req.session.user){
        console.log('尚未登入');
        return res.status(401).send('尚未登入');
    }

    const content = req.body.content;
    const postTime = momentTimezone.tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss'); // 將當前時間轉換為台北時區的時間
    const user_email = req.session.user.email;
    console.log("這是你要寫進DATABASE的user_email: ", user_email);
    var insertPostQuery = 'INSERT INTO `posts` (`content`, `postTime`, `user_email`) VALUES (?, ?, ?)';
    db.query(insertPostQuery, [content, postTime, user_email], (err, results) => {
        if(err){
            console.log('Error insert content: ', err);
            return res.status(500).send('Internal server error. 內部伺服器錯誤');
        }

        return res.status(200).send('成功張貼');
    });
});


app.get('/api/getPosts', (req, res) => {
    if(!req.session.user){
        console.log('尚未登入');
        return res.status(401).send('尚未登入');
    }

    //用戶身分
    const userEmail = req.session.user.email;

    //找該用戶的發文資料
    var getUserPostsQuery = 'SELECT * FROM `posts` WHERE `user_email` = ?';
    
    db.query(getUserPostsQuery, [userEmail], (err, results) => {
        if(err){
            console.error('Error fetching posts:', err);
            return res.status(500).send('Internal server error. 內部伺服器錯誤');
        }

        //返回用戶發文資料
        return res.json(results);
    });
});

//listen port

server.listen(portHTTPS, 'localhost', () => {
    console.log(`Server在${portHTTPS}上執行中(HTTPS)！`);
});

app.listen(portHTTP, 'localhost', () => {
    console.log(`server在${portHTTP}上執行中！`);
});
