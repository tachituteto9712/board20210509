var express = require('express');
var router = express.Router();

var pg = require('pg');
var conf = require('../config/config.json');
const pool = new pg.Pool({
    user: conf.db.user,
    host: conf.db.host,
    database: conf.db.database,
    password: conf.db.password,
    ssl: {
        sslmode: Boolean(Number(conf.db.ssl)) ? 'require' : false,
        rejectUnauthorized: Boolean(Number(conf.db.ssl)) ? false : true
    },
    port: conf.db.port
});

require('date-utils');

const crypto = require('crypto');
// crypto.randomBytes()で生成するときのバイト数
const nBytes = 4;
// nBytesの整数の最大値
const maxValue = 4294967295

// [0.0, 1.0]区間でセキュアな乱数を生成
function secureRandom() {
    // nBytesバイトのランダムなバッファを生成
    const randomBytes = crypto.randomBytes(nBytes);
    //ランダムなバッファを整数値に変換
    const r = randomBytes.readUIntBE(0, nBytes);

    return Math.floor(r / maxValue * 4);
}


/* GET home page. */
router.get('/', function (req, res, next) {
    var datas = [];
    if (!req.session.userCd) {
        res.redirect("/login");
        return;
    } else {
    }
    pool.connect(async (err, client) => {
        if (err) {
            console.log(err);
        } else {

            //同期っぽい処理
            try {
                var result = await client.query(
                    "select *"
                    + ", m1.カテゴリcd as カテゴリcd"
                    + ", m1.名前 as カテゴリー名"
                    + ", to_char(m1.作成日付, 'yyyy/mm/dd hh24:mi:ss') as カテゴリ作成日付"
                    + ", m2.名前 as ユーザー名 "
                    + ", to_char(t1.作成日付, 'yyyy/mm/dd hh24:mi:ss') as 最新更新日付"
                    + ", m3.名前 as 最新更新者"
                    + " from " + conf.db.schema + "m_komoku m1"
                    + " left join " + conf.db.schema + "m_user m2 on m1.作成者cd = m2.ユーザーcd"
                    + " left join " + conf.db.schema + "t_comment t1 on t1.カテゴリcd = m1.カテゴリcd"
                    + "  and t1.作成日付 = (select max(t2.作成日付) from " + conf.db.schema + "t_comment t2"
                    + "     where t2.カテゴリcd = m1.カテゴリcd)"
                    + " left join " + conf.db.schema + "m_user m3 on t1.作成者cd = m3.ユーザーcd"
                    + " order by 最新更新日付 desc"
                );
                if (result !== undefined) {
                    if (result.rowCount == 0) {
                        //ret["result"] = "NG";
                        //ret["msg_face"] = "(# ﾟДﾟ) ﾊﾞｶﾒｯ!";
                    } else {
                        //ret["result"] = "OK";
                        for (lc = 0; lc < result.rowCount; lc++) {
                            var data = {
                                cd: result.rows[lc]["カテゴリcd"]
                                , name: result.rows[lc]["カテゴリー名"]
                                , date: result.rows[lc]["カテゴリ作成日付"]
                                , user: result.rows[lc]["ユーザー名"]
                                , maxDate: result.rows[lc]["最新更新日付"]
                                , lastUser: result.rows[lc]["最新更新者"]
                            };
                            datas.push(JSON.stringify(data));
                        }
                    }
                    var pics = ["eri.jpg", "eri2.jpg", "eri3.jpg", "eri4.jpeg"];
                    var random = secureRandom();
                    var picPath;

                    for (var i = 0; i <= pics.length; i++) {
                        if (i <= random && i + 1 > random) {
                            picPath = pics[i];
                        }
                    }

                    res.render('categoryList', { title: 'お は な し', data: datas, picPath: picPath});
                }
            } catch (err) {
                console.log(err.stack);
            } finally {
                client.release();
            }

            //非同期処理
            //try {
            //var result = client.query("select * from m_user");
            //console.log(result.rows);
            //} catch (err) {
            //console.log(err.stack);
            //}
        }
    });


});



router.post('/', function (req, res) {
    var ret = {};
    ret["result"] = "OK";
    if (req.body.mode == "updateCategory") {
        pool.connect(async (err, client) => {
            //同期っぽい処理
            try {
                pool.connect(async (err, client) => {
                    if (err) {
                        console.log(err);
                    } else {
                        //同期っぽい処理
                        try {
                            await client.query("BEGIN");
                            var result = await client.query("select max(カテゴリcd) as seq from " + conf.db.schema + "m_komoku;"
                            );
                            if (result !== undefined) {
                                var seq = 1;
                                if (result.rowCount == 0) {
                                    ret["result"] = "NG";
                                    ret["msg_face"] = "(# ﾟДﾟ) ﾊﾞｶﾒｯ!";
                                } else {
                                    ret["result"] = "OK";
                                    for (lc = 0; lc < result.rowCount; lc++) {
                                        seq = Number(result.rows[0]["seq"]) + 1;
                                        console.log(seq);
                                    }
                                }
                                var dt = new Date();
                                var formatted = dt.toFormat("YYYY-MM-DD HH24:MI:SS");

                                await client.query("INSERT INTO " + conf.db.schema + "m_komoku"
                                    + " (カテゴリcd, 名前, 作成者cd, 作成日付 ,更新者cd, 更新日付)"
                                    + " VALUES($1, $2, $3, $4, $5, $6); "
                                    , [seq, req.body.naiyo, req.session.userCd, formatted, req.session.userCd, formatted]);
                                await client.query("COMMIT");
                                ret["result"] = "OK";
                            }
                        } catch (err) {
                            await client.query("ROLLBACK");
                            console.log(err.stack);
                        } finally {
                            client.release();
                            return res.json(ret);
                        }

                        //非同期処理
                        //try {
                        //var result = client.query("select * from m_user");
                        //console.log(result.rows);
                        //} catch (err) {
                        //console.log(err.stack);
                        //}
                    }
                });
            } catch (err) {
                console.log(err.stack);

            }

        });
    }
});
module.exports = router;
