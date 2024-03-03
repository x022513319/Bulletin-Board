const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
var bcrypt = require("bcryptjs");
const path = require('path');
const session = require("express-session");
const ejs = require('ejs');
const momentTimezone = require('moment-timezone');
const fs = require('fs'); // file system
const app = express();
const port = 3002;
// app.use(express.static(path.join(__dirname, 'public')));

const https = require('https');
// 读取密钥和证书文件
const options = {
    key: fs.readFileSync('D:/NCNU/side project practice/task2/certificate/key.pem'),
    cert: fs.readFileSync('D:/NCNU/side project practice/task2/certificate/cert.pem')
};
//
const server = https.createServer(options, app);




app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');

// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

//設定express-session middleware
app.use(session({
    secret: 'my-secret-key',
    resave: 'true',
    saveUninitialized: 'false',
    // cookie: {
    //     httpOnly: true,
    //     secure: false,
    //     sameSite: 'Strict'
    // }
}));




const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'x0970779073',
    database: 'task2',
    charset: 'utf8mb4'
});

db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('Connected to MySQL. PORT:' + port);

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
    console.log('進入/');
    const loginUser = req.session.user !== undefined ? req.session.user.email : '尚未登入';
    console.log('你現在登入的帳號是：' + loginUser);
    // if(req.session.user){
    //     res.redirect('/home');
    //     console.log('歡迎回來');
    //     // res.send(`歡迎回來，${req.session.user}！`)
    // }
    // else{
    //     res.sendFile(path.join(__dirname, 'public', 'index.html'));
    //     //res.send('請登入！');
    //     console.log('請登入');
    // }
    // const loggedInUser = req.session.user;

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
            // console.log("這是找到的email:", results[0].email);
            return;
        }

        //encrypt the password
        bcrypt.hash(password, 10, (err, hashedPassword) =>{
            if(err){
                console.error('密碼加密失敗：', err);
                res.status(500).json({ error: 'Internal Server Error' });
                // res.status(500).send('Internal Server Error');
                return;
            }

            //可以使用ORM來改進安全性
            var insertUserQuery = 'INSERT INTO `users` (email, password) VALUES (?, ?)';
            db.query(insertUserQuery, [email, hashedPassword], (err, results) => {
                if(err){
                    console.error('註冊失敗：', err);
                    // res.status(500).send('註冊失敗');
                    res.status(500).json({ error: '註冊失敗' });
                }
                else{
                    // res.status(200).send('註冊成功');
                    res.status(200).json({ message: '註冊成功' });
                }
            });
        });
    });
});





app.get('/home', (req, res) => {
    console.log('進入/home, req.session.user:', req.session.user);
    if(req.session.user){

        // let modifiedHTML = `
        //     <script>
        //         document.getElementById("write").style.display = "flex";
        //         location.replace("/home");
        //     </script>
        // `;

        // // 发送修改后的HTML文件及脚本修改
        // res.send(modifiedHTML + '<script>location.replace("/home");</script>');
        // return res.sendFile(path.join(__dirname, 'public', 'index.html'));
        console.log("welcome back, " + req.session.user);
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
        
        // res.send('<script>document.getElementById("write").style.display = "flex";</script>')
    }
    else{
        return res.redirect('/');
    }
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
                // req.locals.user = req.session.user;
                // res.json({ loginSuccess: true });
                // return res.redirect('/home');
                // console.log('有沒有重新導向');
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
    console.log("已登出");
    // console.log('req.session.user: ' + req.session.user);
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




// app.use((req, res, next) => {
//     // 檢查用戶是否已經登入，如果是，則重定向至 /home
//     if (req.session.user) {
        
//         res.locals.user = req.session.user;
//         return res.redirect('/home');
//     }
//     // 如果用戶未登入，繼續執行後續的路由處理程序
//     else{
//         return res.redirect('/');
//     }
//     next();
// });



// app.listen(port, () => {
//     console.log(`Server在${port}上執行中！`);
// });



// // 這裡使用虛擬 VPN 的 IP 地址和端口
// const vpnIP = '25.19.45.21'; 
// const vpnPort = 443;

// // ...

// app.listen(vpnPort, vpnIP, () => {
//     console.log(`Server在${vpnIP}:${vpnPort}上執行中！`);
// });

//listen port
server.listen(3002, 'localhost', () => {
    console.log(`Server在${port}上執行中！`);
});
