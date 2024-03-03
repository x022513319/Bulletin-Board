//emoji mart
// import { Picker } from 'emoji-mart'
// new Picker({
//   data: async () => {
//     const response = await fetch(
//       'https://cdn.jsdelivr.net/npm/@emoji-mart/data',
//     )
//     return response.json()
//   }
// });



var dialog, write, cls, post, list, content, post_btn;
var hasClickedOnce = false;
write = document.getElementById("write");
dialog = document.getElementById("full-screen");
var sign_up = document.getElementById("sign-up");
var sign_up_full_screen = document.getElementById("sign-up-full-screen");
var log_in = document.getElementById('log-in');
var log_out = document.getElementById('log-out');
var log_in_full_screen = document.getElementById('log-in-full-screen');
// cls = document.getElementById("box333");
//有多個close button，使用querySelectorAll對所有close button做相同的事情。用data-target來分別控制不同box
var close_btn = document.querySelectorAll('.close-btn');
close_btn.forEach(function(button){
    button.addEventListener('click', function(event){
        event.preventDefault();
        var targetID = button.getAttribute('data-target');
        var targetElement = document.getElementById(targetID);
        targetElement.style.display = "none";

        document.body.classList.remove('disableScrollbar');
    });
});

// cls.addEventListener("click", function(){
//     dialog.style.display = "none";
// });

//  cls.addEventListener("click", function(){
//      sign_up_full_screen.style.display = "none";
//  });

// cls.addEventListener('mousedown', function(event){
//     event.preventDefault();
// });

// cls.addEventListener('mouseover', function(event){
//     event.preventDefault();
// });



post = document.getElementById("post");
list = document.getElementById("list");
content = document.getElementById("content");
post_btn = document.getElementById("post-btn");
post_text = document.getElementById("post-text");

// email = document.getElementById('email');
// password = document.getElementById('password');
sign_up_btn = document.getElementById('sign-up-btn');
sign_up_text = document.getElementById('sign-up-text');


// window.onload = function(){
//     // document.getElementById("post-btn").disabled = true;
// }



write.addEventListener("click", function(){    
    dialog.style.display = "flex";
    dialog.style.zIndex = "15";
    document.body.classList.add('disableScrollbar');
});

// sign_up.addEventListener("click", function(){
//     sign_up_full_screen.style.display = "flex";
//     sign_up_full_screen.style.zIndex = "15";
// });

function handleSignup(){
    sign_up_full_screen.style.display = "flex";
    sign_up_full_screen.style.zIndex = "15";
}

// log_in.addEventListener("click", function(){
//     log_in_full_screen.style.display = 'flex';
//     log_in_full_screen.style.zIndex = '15';
// });

function handleLogin(){
    log_in_full_screen.style.display = 'flex';
    log_in_full_screen.style.zIndex = '15';
}

// <% if(loggedInUser) { %>
// log_out.addEventListener('click', function(){
//     fetch('/logout', {
//         method: 'GET',
//         credentials: 'same-origin' // 設置 credentials 屬性為 same-origin，以便在同一域名下發送 cookie
//     })
//     .then(response => {
//         if (response.ok) {
//             console.log('登出成功！');
//             // 重新導向到登出後的頁面或其他操作
//             window.location.href = '/home'; 
//         } else {
//             console.error('登出失敗！');
//         }
//     })
//     .catch(error => {
//         console.error('發生錯誤：', error);
//     });
// });
// <% } %>


function handleLogout(){
    fetch('/logout', {
        method: 'GET',
        credentials: 'same-origin' // 設置 credentials 屬性為 same-origin，以便在同一域名下發送 cookie
    })
    .then(response => {
        if (response.ok) {
            console.log('登出成功！');
            // 重新導向到登出後的頁面或其他操作
            // window.location.href = '/home'; 
            window.location.reload();
        } else {
            console.error('登出失敗！');
        }
    })
    .catch(error => {
        console.error('發生錯誤：', error);
    });
};


content.addEventListener('input', postBtnFunc);

document.getElementById('get-pic-btn').addEventListener('click', function(){
    var picInput = document.getElementById('picInput');

    //模擬點擊文件輸入框
    picInput.click();
});

post_btn.addEventListener('click', function(){
    if(content.value.trim() === '')
        ;
    else{
        var postTime = new Date();
        // var test_time = new Date('2024-02-21T21:35:00');
        // var time_difference = post_time - test_time;
        // console.log(getTimeAgo(time_difference));

        //將textarea中的'/n'替換成'<br>'，如此在textarea中輸入enter才會真的換行
        content.value = content.value.replace(/\n/g, '<br>');

        var dataForm = {
            content: content.value,
            // postTime: postTime
        };

        fetch('/api/post', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataForm)
        })
        .then(response => {
            if(response.ok){
                console.log('成功發文');
                list.innerHTML = list.innerHTML + 
                `
                <div class="record">
                    <h3>
                        發文時間：${postTime}
                    </h3>
                    <hr>
                    <p>${content.value}</p>
                </div>
                `;
                content.value = '';
                dialog.style.display = 'none';
                post_btn.style.backgroundColor = "#333";
                post_text.style.color = "#999";
                window.location.reload();
            }else{
                throw new Error('發文失敗');
                // console.error('發文失敗');
            }
        })
        .catch(error => {
            console.error('發生錯誤：', error);
        });
// JSON.stringify(posts)

        document.body.classList.add('disableScrollbar');

    }

})

sign_up_btn.addEventListener('click', function(){
    // if(email.value.trim() === '' || password.value.trim() === '')
    //     alert('請完整填寫電子郵件或密碼');
    // else{
        var sign_up_time = new Date();
            
        // 
        //  向後端發送POST
        // 
        email = document.getElementById('sign-up-email').value;
        password = document.getElementById('sign-up-password').value;
        // console.log(email + ' 以及 ' + password);
        var formData = {
            email: email,
            password: password
        };

        //發送 POST 請求
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/register', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function(){
            if (xhr.readyState === XMLHttpRequest.DONE){
                if(xhr.status === 200){
                    // alert('成功註冊啦！');
                }
                else if(xhr.status === 409){
                    alert('帳號已經存在');
                }
                else{
                    alert('註冊失敗');
                }
            }
        };
        xhr.send(JSON.stringify(formData));


        // email.value = '';
        // password.value = '';

        // sign_up_full_screen.style.display = 'none';

        // sign_up_btn.style.backgroundColor = "#333";
        // sign_up_text.style.color = "#999";

    // }

})

var log_in_btn = document.getElementById('log-in-btn');
log_in_btn.addEventListener('click', function(){
    // write.style.display = 'flex';
    var email = document.getElementById('log-in-email').value;
    var password = document.getElementById('log-in-password').value;
    formData = {
        email: email,
        password: password
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/login', true);

    

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
            if(xhr.status === 200){
                //登入成功
                console.log('123123123');
                
                // window.location.href = '/home';
                window.location.reload();
                // write.style.display = 'flex'
            }
        }
    };
    xhr.send(JSON.stringify(formData));
});


// post_btn.addEventListener('mouseover', function(){
//     if(!post_btn.classList.contains('disable-link'))
//         post_btn.style.backgroundColor = "rgb(77, 80, 221)";
//     else
//         post_btn.style.backgroundColor = "transparent";
// })

// function date_standarize(post_time){
//     var year = post_time.getFullYear();
//     var month = ('0' + (post_time.getMonth()+ 1 )).slice(-2);
//     var date = ('0' + post_time.getDate()).slice(-2);
//     var hour = ('0' + post_time.getHours()).slice(-2);
//     var minutes = ('0' + post_time.getMinutes()).slice(-2);
//     var seconds  =('0' + post_time.getSeconds()).slice(-2);
//     return year + '-' + month + '-' + date + 'T' + hour + ':' + minutes + ':' + seconds;
// }

function getTimeAgo(time_difference){
    // time_difference: milliseconds 
    var seconds = Math.floor(time_difference / 1000);
    var minutes = Math.floor(seconds / 60);
    var hour = Math.floor(minutes / 60);
    var days = Math.floor(hour / 24);
    var year = Math.floor(days / 365);
    
    if(year > 0){
        return year + "年前"; 
    }
    else if(days > 0){
        return days + "天前"; 
    }
    else if(hour > 0){
        return hour + "小時前"; 
    }
    else if(minutes > 0){
        return minutes + "分前"; 
    }
    else{
        return "剛剛";
    }
}


// document.addEventListener('DOMContentLoaded', function() {
//     if()
//         var postBtn = document.getElementById('post-btn');
//         if (postBtn) {
//             postBtn.style.display = 'flex';
//         }
// });

// if ('<%= typeof user !== "undefined" ? user : "" %>' !== '') {
//     // 將 post-btn 元素設置為可見
//     // document.getElementById('write').style.display = 'flex';
//     // document.getElementById('log-in').style.display = 'none';
//     // document.getElementById('write').style.backgroundColor = 'red';

// }


// // // 監聽 window 的 load 事件，當頁面完全載入後執行
// window.addEventListener('load', function() {
//     // 獲取服務器發送的重定向 URL
//     const redirectUrl = 'http://localhost:3002/';

//     // 檢查是否需要重定向
//     if (window.location.href !== redirectUrl) {
//         // 如果當前頁面的 URL 不等於重定向 URL，則重定向到重定向 URL
//         window.location.href = redirectUrl;
//     }
// });

function emojiFunc(){
    
    var picker;
    if(!hasClickedOnce){
        var emojiSelect = '';
        const pickerOptions = {
            onEmojiSelect: function(emoji){
                console.log('native:', emoji);
                // content = document.getElementById('content');
                content.value += emoji.native;
                postBtnFunc();
            },
            emojiButtonRadius: '20%',
            previewPosition: 'none',
            perLine: '5'
        };
        picker = new EmojiMart.Picker(pickerOptions);
        emojiContainer = document.getElementById('emojiContainer')

        emojiContainer.appendChild(picker);
        emojiContainer.style.position = 'absolute';
        emojiContainer.style.top = this.offsetTop + 'px';
        emojiContainer.style.left = this.offsetLeft + (-170) + 'px';
        picker.style.zIndex = '20';
        hasClickedOnce = true;
        // const native = picker.native;
        // console.log("這是native:", native);
    }
    else{
        emojiContainer.style.display = 'block';
        // const native = picker.native;

        // console.log("這是native:", native);
    }

    document.addEventListener('click', function(event){
        //檢查click位置有沒有在Emoji Picker內
        if(!emojiContainer.contains(event.target) && event.target !== document.getElementById('emoji')){
            emojiContainer.style.display = 'none';
        }
    });


    // console.log(pickerOptions.onEmojiSelect);
    // var rect = this.getBoundingClientRect();
    // picker.style.height = '40vh';
    // picker.style.position = 'fixed';
    // picker.style.overflow = 'hidden';
    // var xOffset = 0;
    // var yOffset = -40;
    // picker.style.left = rect.left + 'px'
    // picker.style.top = rect.top +'px';
}


function postBtnFunc(){
    var contentValue = content.value.trim(); //頭尾去掉空白
    // var hoverElement = document.querySelector('.dialog .post');
    if(contentValue !== ''){
        if(post_btn.classList.contains('disable-link'))
            post_btn.classList.remove('disable-link');
        // hoverElement.classList.add('hover');

        post_btn.style.backgroundColor = "rgb(72, 64, 219)";
        post_text.style.color = "#fff";
    }
    else{
        // post.backgroundColor = "red";
        if(!post_btn.classList.contains('disable-link'))
            post_btn.classList.add('disable-link');
        // hoverElement.classList.remove('hover');
        post_btn.style.backgroundColor = "#333";
        post_text.style.color = "#999";
    }
};
