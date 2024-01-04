const axios = require('axios');

const signInUrl = 'https://hdhive.org/api/v1/customer/user/daily-check-in';
const loginCookie = '_ga=GA1.1.1918409792.1702026209; _ga_VV14DY375Y=GS1.1.1702026209.1.0.1702026212.0.0.0';
const authorizationToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTcwMjAyNjIxNCwianRpIjoiNmE3NGUzMDgtYTJmMy00MTU2LTllMzAtNDgxZGE1YzRiNGI1IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6NTksIm5iZiI6MTcwMjAyNjIxNCwiZXhwIjoxNzA0NjE4MjE0fQ.XyOUNMnwrEmXmZ2P2f3oa0SNGk3PXyOa7DdXUQe-aZw';  // 请替换为实际的 Authorization Token

const headers = {
    'Content-Type': 'application/json',
    'Cookie': loginCookie,
    'Authorization': `Bearer ${authorizationToken}`
};

// 每天早上8点执行签到
const scheduleSignIn = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    console.log(`当前时间:${hours}:${minutes}`);

    if (hours === 8 && minutes === 0) {
        axios.post(signInUrl, {}, { headers })
            .then(response => {
                console.log('签到成功:', response.data);
            })
            .catch(error => {
                console.error('签到失败:', error.response.data);
            });
    }
};

// 每分钟检查一次是否到了签到时间
setInterval(scheduleSignIn, 60 * 1000);
