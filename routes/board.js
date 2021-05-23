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
                    "select *, to_char(t1.作成日付, 'yyyy/mm/dd hh24:mi:ss') as メッセージ作成日付, m1.名前 as ユーザー名 "
                    + " from " + conf.db.schema + "t_comment t1"
                    + " inner join " + conf.db.schema + "m_user m1 on t1.作成者cd = m1.ユーザーcd"
                        + " where t1.カテゴリcd = ($1) and 内容 like " + "'%" + (req.query.srch === undefined ? "" : req.query.srch) + "%'"
                    + " order by t1.seq desc;"
                    , [req.query.ccd]);
                if (result !== undefined) {
                    if (result.rowCount == 0) {
                        //ret["result"] = "NG";
                        //ret["msg_face"] = "(# ﾟДﾟ) ﾊﾞｶﾒｯ!";
                    } else {
                        //ret["result"] = "OK";
                        for (lc = 0; lc < result.rowCount; lc++) {
                            var data = {
                                name: result.rows[lc]["ユーザー名"]
                                , naiyo: result.rows[lc]["内容"]
                                , date: result.rows[lc]["メッセージ作成日付"]
                                , user: result.rows[lc]["ユーザー名"]
                                , memo_flg: result.rows[lc]["memo_flg"]
                            };
                            datas.push(JSON.stringify(data));
                        }
                    }
                    res.render('board', { title: 'コメントボード', data: datas, categoryCd: req.query.ccd, searchText: req.query.srch });
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
    ret["result"] = "NG";
    
    pool.connect(async (err, client) => {
        //同期っぽい処理
        try {
            pool.connect(async (err, client) => {
                if (err) {
                    console.log(err);
                } else {
                    if (req.body.mode == "update") {
                        //同期っぽい処理
                        try {
                            await client.query("BEGIN");
                            var result = await client.query("select max(seq) as seq from " + conf.db.schema + "t_comment where カテゴリcd = ($1);"
                                , [req.body.categoryCd]);
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

                                var comment = req.body.naiyo.replace(/\n/g, '<br/>');
                                await client.query("INSERT INTO " + conf.db.schema + "t_comment"
                                    + " (カテゴリcd, seq, 内容, 作成者cd, 作成日付, 更新者cd, 更新日付)"
                                    + " VALUES($1, $2, $3, $4, $5, $6, $7); "
                                    , [req.body.categoryCd, seq, comment, req.session.userCd, formatted, req.session.userCd, formatted]);
                                await client.query("COMMIT");
                                ret["result"] = "OK";
                            }
                        } catch (err) {
                            await client.query("ROLLBACK");
                            ret["result"] = "NG";
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
                    } else {
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
                                        "select *, to_char(t1.作成日付, 'yyyy/mm/dd hh24:mi:ss') as メッセージ作成日付, m1.名前 as ユーザー名 "
                                        + " from " + conf.db.schema + "t_comment t1"
                                        + " inner join " + conf.db.schema + "m_user m1 on t1.作成者cd = m1.ユーザーcd"
                                        + " where t1.カテゴリcd = ($1) and 内容 like " + "'%" + (req.body.srch === undefined ? "" : req.body.srch) + "%'"
                                        + " order by t1.seq desc;"
                                        , [req.body.ccd]);
                                    if (result !== undefined) {
                                        if (result.rowCount == 0) {
                                            //ret["result"] = "NG";
                                            //ret["msg_face"] = "(# ﾟДﾟ) ﾊﾞｶﾒｯ!";
                                        } else {
                                            //ret["result"] = "OK";
                                            for (lc = 0; lc < result.rowCount; lc++) {
                                                var data = {
                                                    name: result.rows[lc]["ユーザー名"]
                                                    , naiyo: result.rows[lc]["内容"]
                                                    , date: result.rows[lc]["メッセージ作成日付"]
                                                    , user: result.rows[lc]["ユーザー名"]
                                                    , memo_flg: result.rows[lc]["memo_flg"]
                                                };
                                                datas.push(JSON.stringify(data));
                                            }
                                        }
                                        res.render('board', { title: 'コメントボード', data: datas, categoryCd: req.body.ccd, searchText: req.body.srch });
                                        console.log(req.body.srch);
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
                    }
                }
            });
        } catch (err) {
            console.log(err.stack);
            
        }

    });
});
module.exports = router;
