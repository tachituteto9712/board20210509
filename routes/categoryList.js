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
    pool.connect(async (err, client) => {
        if (err) {
            console.log(err);
        } else {

            //同期っぽい処理
            try {
                var result = await client.query(
                    "select * from m_category;");
                if (result !== undefined) {
                    if (result.rowCount == 0) {
                        //ret["result"] = "NG";
                        //ret["msg_face"] = "(# ﾟДﾟ) ﾊﾞｶﾒｯ!";
                    } else {
                        //ret["result"] = "OK";
                        for (lc = 0; lc < result.rowCount; lc++) {
                            var data = { cd: result.rows[lc]["カテゴリーcd"], name: result.rows[lc]["名前"] };
                            datas.push(JSON.stringify(data));
                            console.log(result.rows[lc]["名前"]);
                        }
                    }
                    res.render('categoryList', { title: 'Category List', data: datas });
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
    var data = [JSON.stringify({ apple: 'リン', banana: 'バナ' })];
    var ret = {};
    ret["result"] = "OK";
});
module.exports = router;
