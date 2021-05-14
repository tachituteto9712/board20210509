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


/* GET home page. */
router.get('/', function (req, res, next) {
    var datas = [];
    if (!req.session.userCd) {
        res.redirect("/login");
        return;
    } else {
        console.log(req.session.userCd);
    }
    pool.connect(async (err, client) => {
        if (err) {
            console.log(err);
        } else {

            //同期っぽい処理
            try {
                var result = await client.query(
                    "select *"
                    + ", m1.名前 as カテゴリー名"
                    + ", to_char(m1.作成日付, 'yyyy/mm/dd hh24:mi:ss') as カテゴリ作成日付"
                    + ", m2.名前 as ユーザー名 "
                    + "from " + conf.db.schema + "m_category m1"
                 + " inner join " + conf.db.schema + "m_user m2 on m1.作成者cd = m2.ユーザーcd"
                );
                if (result !== undefined) {
                    if (result.rowCount == 0) {
                        //ret["result"] = "NG";
                        //ret["msg_face"] = "(# ﾟДﾟ) ﾊﾞｶﾒｯ!";
                    } else {
                        //ret["result"] = "OK";
                        for (lc = 0; lc < result.rowCount; lc++) {
                            var data = { cd: result.rows[lc]["カテゴリーcd"], name: result.rows[lc]["カテゴリー名"], date: result.rows[lc]["カテゴリ作成日付"], user: result.rows[lc]["ユーザー名"]};
                            datas.push(JSON.stringify(data));
                            console.log(result.rows[lc]["名前"]);
                        }
                    }
                    res.render('categoryList', { title: 'Category List', data: datas });
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
                            var result = await client.query("select max(カテゴリーcd) as seq from " + conf.db.schema + "m_category;"
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

                                await client.query("INSERT INTO " + conf.db.schema + "m_category"
                                    + " (カテゴリーcd, 名前, 作成者cd, 作成日付 ,更新者cd, 更新日付)"
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
