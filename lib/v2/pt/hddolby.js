const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
// const fs = require('fs');

module.exports = async (ctx) => {
    const { cookie, passkey, promotion } = ctx.params;

    // console.log('cookie:' + cookie)
    // console.log('passkey:' + passkey)
    // console.log('promotion:' + promotion)

    const { data: response } = await got({
        method: 'get',
        url: 'https://www.hddolby.com/torrents.php',
        headers: {
            Cookie: cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.69',
        },
    });
    // const response = fs.readFileSync('test.html', 'utf8');
    const $ = cheerio.load(response);

    const sizeRegex = /([0-9.]+)([A-Za-z]+)/;

    const items = $('#torrenttable > tbody > tr')
        .toArray()
        .map((item) => {
            item = $(item);
            // console.log(item.html());
            const a = item.find('a[title!=]').first();
            let title = a.text();
            const aLink = a.attr('href');
            if (typeof aLink === 'undefined' || aLink.indexOf('id=') === -1) {
                return null;
            }

            const free2 = item.find('.pro_free2up');
            const free = item.find('.pro_free');
            // console.log(free2)
            if (promotion === '2xfree') {
                if (free2.length === 0) {
                    return null;
                }
            } else if (promotion === 'free') {
                if (free.length === 0 && free2.length === 0) {
                    return null;
                }
            }

            item.find('.tags').map(function () {
                title += ' [' + $(this).text() + ']';
                return null;
            });

            if (item.find('.hitandrun').length > 0) {
                title += ' [H&R]';
            }

            const id = aLink.substring(aLink.indexOf('id=') + 3, aLink.indexOf('&'));
            const sizeText = item.find('> td').eq(-6).text();
            const matches = sizeText.match(sizeRegex);
            let size = 0;
            let unit = 'MB';
            if (matches) {
                size = parseFloat(matches[1]);
                unit = matches[2];
            }
            const sizeBytes = unit === 'GB' ? size * 1024 * 1024 * 1024 : unit === 'TB' ? size * 1024 * 1024 * 1024 * 1024 : size * 1024 * 1024;

            const pubDate = parseDate(item.find('> td').eq(-7).find('span').attr('title'));
            // const pubDate = new Date(item.find('> td').eq(-7).find('span').attr('title')).toUTCString()
            return {
                title,
                description: a.parent().last().text(),
                enclosure_url: `https://www.hddolby.com/download.php?id=${id}&passkey=${passkey}`,
                enclosure_length: sizeBytes,
                enclosure_type: 'application/x-bittorrent',
                pubDate,
            };
        })
        .filter((item) => item !== null);

    ctx.state.data = {
        title: `HDDolby Torrents 共` + items.length + `个种子`,
        link: `https://www.hddolby.com`,
        description: `Latest torrents from HDDolby`,
        item: items,
    };
};
