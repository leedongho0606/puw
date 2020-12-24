let lastupdate;
function webhook(msg) {
    httpsreq({
        hostname: "discord.com",
        path: "/api/webhooks/" + process.env.webhook,
        method: "POST",
        header: { "Content-Type": "application/json" },
        send: JSON.stringify(msg)
    }).then(r => {
        if (r.res.statusCode !== 204 && r.data) return console.log("[WEBHOOK]", "SEND FAIL:", r.res.statusode, r.data.toString());
        console.log("[WEBHOOK]", "SEND SUCCESS");
    });
}
function getupdateinfo() {
    httpsreq({
        hostname: 'neurowhai.tistory.com',
        path: '/395'
    }).then(r => {
        if (r.res.statusCode !== 200 || !r.data) return;
        r = r.data.toString();
        const cheerio = require("cheerio"), $ = cheerio.load(r);
        let content = $(".moreless-content").children("p")[0];
        const newupdate = $(content).text();
        $(content).each((index, list) => {
            const target = $(list).find('br');
            if (target.length) target.replaceWith('\n');
        });
        if (lastupdate !== newupdate) {
            if (!lastupdate) return lastupdate = newupdate;
            console.log("데이터 다름");
            $(content).each((index, list) => {
                const target = $(list).find('a');
                if (target.length) target.replaceWith(`[${target.text()}](${target.attr("href")})`);
            });
            lastupdate = newupdate;
            content = $(content).text().split("\n");
            content = "```" + content[0] + "```" + content.join("\n").replace(content[0], "");
            webhook({
                "embeds": [{
                    "color": 16739842,
                    "author": {
                        "name": "PEWS Client 업데이트 알림",
                        "icon_url": "https://cdn.discordapp.com/avatars/" + process.env.appavatar + "?size=512"
                    },
                    "description": content,
                    "fields": [{
                        "name": "다운로드",
                        "value": "[**Google Drive 다운로드**](https://drive.google.com/uc?id=" + process.env.gdid + "&export=download)\n[**Google Drive 페이지**](https://drive.google.com/open?id=" + process.env.gdid + ")",
                        "inline": true
                    }, {
                        "name": "자세한 정보",
                        "value": "[**블로그**](" + process.env.blogurl + ")",
                        "inline": true
                    }],
                    "footer": {
                        "icon_url": "https://cdn.discordapp.com/avatars/" + process.env.devavatar + "?size=512",
                        "text": "개발자: NeuroWhAI"
                    }
                }]
            });
        } else {
            lastupdate = newupdate;
            console.log("데이터 같음");
        }
        //console.log(r.split('<div class="moreless-content">')[1].split("</p>")[0].replace(/<br \/>/g, "\n").replace("<p>", "").trim());
    });
}
function httpsreq(obj) {
    return new Promise((resolve, reject) => {
        let chunk = Buffer.alloc(0);
        const req = require("https").request({
            hostname: obj.hostname,
            path: obj.path,
            port: !obj.port ? 443 : obj.port,
            method: !obj.method ? "GET" : obj.method,
            headers: obj.header,
            timeout: 1000
        }, res => {
            res.on("data", data => {
                chunk = Buffer.concat([chunk, data], chunk.byteLength + Buffer.from(data).byteLength);
            });
            res.on("close", () => {
                resolve({ data: chunk, res: res });
            });
        });
        if (obj.method === "POST" && obj.send) req.write(obj.send);
        req.on("error", (e) => {
            console.log("[HTTPS] Request Error:", e);
            reject();
        });
        req.end();
    });
}
setInterval(getupdateinfo, 5000);
getupdateinfo();
console.log("puw 시작.");