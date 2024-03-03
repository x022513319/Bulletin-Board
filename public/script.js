var dialog, write, cls, post, list, content, post_btn;
var hasClickedOnce = false;
write = document.getElementById("write");
dialog = document.getElementById("full-screen");
var sign_up = document.getElementById("sign-up");
var sign_up_full_screen = document.getElementById("sign-up-full-screen");
var log_in = document.getElementById('log-in');
var log_out = document.getElementById('log-out');
var log_in_full_screen = document.getElementById('log-in-full-screen');

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

post = document.getElementById("post");
list = document.getElementById("list");
content = document.getElementById("content");
post_btn = document.getElementById("post-btn");
post_text = document.getElementById("post-text");

sign_up_btn = document.getElementById('sign-up-btn');
sign_up_text = document.getElementById('sign-up-text');

write.addEventListener("click", function(){    
    dialog.style.display = "flex";
    dialog.style.zIndex = "15";
    document.body.classList.add('disableScrollbar');
});

function handleSignup(){
    sign_up_full_screen.style.display = "flex";
    sign_up_full_screen.style.zIndex = "15";
}

function handleLogin(){
    log_in_full_screen.style.display = 'flex';
    log_in_full_screen.style.zIndex = '15';
}

function handleLogout(){
    fetch('/logout', {
        method: 'GET',
        credentials: 'same-origin' // 設置 credentials 屬性為 same-origin，以便在同一域名下發送 cookie
    })
    .then(response => {
        if (response.ok) {
            console.log('登出成功！');
            // 重新導向到登出後的頁面或其他操作
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
        
        //將textarea中的'/n'替換成'<br>'，如此在textarea中輸入enter才會真的換行
        content.value = content.value.replace(/\n/g, '<br>');

        var dataForm = {
            content: content.value
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
            }
        })
        .catch(error => {
            console.error('發生錯誤：', error);
        });

        document.body.classList.add('disableScrollbar');

    }

})

sign_up_btn.addEventListener('click', function(){
    email = document.getElementById('sign-up-email').value;
    password = document.getElementById('sign-up-password').value;
    if(email.trim() === '' || password.trim() === '')
        alert('請完整填寫電子郵件或密碼');
    else{
        var sign_up_time = new Date();

        //  向後端發送POST

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
                    alert('註冊成功');
                    window.location.reload();
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
    }
});

var log_in_btn = document.getElementById('log-in-btn');
log_in_btn.addEventListener('click', function(){

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
                window.location.reload();
            }
        }
    };
    xhr.send(JSON.stringify(formData));
});

function emojiFunc(){
    
    var picker;
    if(!hasClickedOnce){
        var emojiSelect = '';
        const pickerOptions = {
            onEmojiSelect: function(emoji){
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
    }
    else{
        emojiContainer.style.display = 'block';
    }

    document.addEventListener('click', function(event){
        //檢查click位置有沒有在Emoji Picker內
        if(!emojiContainer.contains(event.target) && event.target !== document.getElementById('emoji')){
            emojiContainer.style.display = 'none';
        }
    });
}


function postBtnFunc(){
    var contentValue = content.value.trim(); //頭尾去掉空白
    if(contentValue !== ''){
        if(post_btn.classList.contains('disable-link'))
            post_btn.classList.remove('disable-link');

        post_btn.style.backgroundColor = "rgb(72, 64, 219)";
        post_text.style.color = "#fff";
    }
    else{
        if(!post_btn.classList.contains('disable-link'))
            post_btn.classList.add('disable-link');

        post_btn.style.backgroundColor = "#333";
        post_text.style.color = "#999";
    }
};
