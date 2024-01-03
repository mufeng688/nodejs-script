const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const rss = require('rss');

const app = express();
const port = 3000;

app.get(`/:type/:page`, async (req, res) => {
    var type = req.params.type;
    var page = req.params.page;
    let url = `https://www.bdys10.com/s/all/${page}?type=${type}`;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        let arr1 = [];

        await Promise.all($('.row-cards .card').map(async (index, element) => {
            // 链接
            const cardUrl = 'https://www.bdys10.com' + $(element).find('.card-link a').attr('href');

            try {
                const response = await axios.get(cardUrl);
                const $ = cheerio.load(response.data);
                const arr2 = [];

                function getName(torrentName) {
                    const match = torrentName.match(/EP\d+(-\d+)?/);

                    if (type == '0') {
                        return match ? match[0] : '';
                    } else if (type == '1') {
                        return match ? match[0] : '完结';
                    }
                }

                let tit = $('.card-body:first').find('h2').text();
                let description = $('#synopsis').find('.card-body').text();
                let img = $('.card-body:first').find('img').attr('src');

                await Promise.all($('#torrent-list li').map(async (index, element) => {
                    // 时间格式化
                    function formatDate(inputDate) {
                        // 将 "2024-01-01 23:10:26" 解析为 Date 对象
                        const dateParts = inputDate.split(' ');
                        const date = dateParts[0];
                        const time = dateParts[1];

                        const [year, month, day] = date.split('-');
                        const [hour, minute, second] = time.split(':');

                        const formattedDate = new Date(year, month - 1, day, hour, minute, second).toUTCString();
                        return formattedDate;
                    }
                    // 判断是否完结
                    arr2[index] = {
                        title: tit + '(' + getName($(element).find('a').text()) + ')',
                        description,
                        pubDate: formatDate($(element).find('.text-muted:last').text()),
                        img,
                        url: 'https://www.bdys10.com' + $(element).find('a').attr('href')
                    };
                }));

                arr1 = arr1.concat(arr2);


            } catch (error) {
                console.log(error);
            }
        }));

        const feed = new rss({
            title: 'BT下载',
            description: 'BT下载',
            feed_url: 'https://rss.xymhh.xyz',
            site_url: 'https://www.bdys10.com',
        })

        arr1.forEach(item => {
            feed.item(item);
        })
        console.log(arr1[0]);
        res.set('Content-Type', 'text/xml');
        res.send(feed.xml());
        // res.send(JSON.stringify(arr1))

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
