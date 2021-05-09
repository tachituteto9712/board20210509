var express = require('express');
var router = express.Router();

var pg = require('pg');
const pool = new pg.Pool({
    user: 'udrtsgeubiqkmo',
    host: 'ec2-23-22-191-232.compute-1.amazonaws.com',
    database: 'd50agr4mtf5jma',
    password: '7d051d0ec1dd225a10efa8b6e33e494f4174fbdd5914d9e03db1c36cc4ffcd7b',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

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
                    "select * from t_knowledge t1"
                    + " inner join m_user m1 on t1.作成者cd = m1.ユーザーcd"
                    + " where t1.カテゴリcd = ($1) order by t1.seq;"
                    , [req.query.ccd]);
                if (result !== undefined) {
                    if (result.rowCount == 0) {
                        //ret["result"] = "NG";
                        //ret["msg_face"] = "(# ﾟДﾟ) ﾊﾞｶﾒｯ!";
                    } else {
                        //ret["result"] = "OK";
                        for (lc = 0; lc < result.rowCount; lc++) {
                            var data = { name: result.rows[lc]["名前"], naiyo: result.rows[lc]["内容"] };
                            datas.push(JSON.stringify(data));
                        }
                    }
                    res.render('board', { title: 'Express', data: datas, categoryCd: req.query.ccd});
                }
            } catch (err) {
                console.log(err.stack);
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
                    //同期っぽい処理
                    try {
                        await client.query("BEGIN");
                        var result = await client.query("select max(seq) as seq from t_knowledge where カテゴリcd = ($1);"
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

                            await client.query("INSERT INTO T_KNOWLEDGE"
                                + " (カテゴリcd, seq, 内容, 作成者cd, 更新者cd)"
                                + " VALUES($1, $2, $3, $4, $5); "
                                , [req.body.categoryCd, seq, req.body.naiyo, req.session.userCd, req.session.userCd]);
                            await client.query("COMMIT");
                            ret["result"] = "OK";
                        }
                    } catch (err) {
                        await client.query("ROLLBACK");
                        console.log(err.stack);
                    } finally {
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
});
module.exports = router;
