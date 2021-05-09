var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


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

//var { Client } = require('pg');
//var client = new Client({
//    user: 'sxcfvhmctyqrpr',
//    host: 'ec2-3-215-57-87.compute-1.amazonaws.com',
//    database: 'd7ct6eqb6kkr5j',
//    password: 'e0a878b7ffa7b91b27624f39b9d5d8e7b62e3e44608e1f2e98558af7916359bb',
//    port: 5432,
//    ssl: {
//        rejectUnauthorized: false
//    }
//})


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


/* GET users listing. */
router.get('/', function (req, res, next) {
    console.log("login!");
    res.render('login');
});

router.post('/', function (req, res) {
    var ret = {};
    ret["result"] = "NG";
    if (req.body.mode == "loginCheck") {
        console.log("login_check...");
        pool.connect(async (err, client) => {
            if (err) {
                console.log(err);
                return;
            } else {
                
                //同期っぽい処理
                try {
                    console.log("console");
                    var result = await client.query("select * from m_user where id = ($1) and パスワード = ($2)"
                        , [req.body.id, req.body.pass]);
                    if (result !== undefined) {
                        if (result.rowCount == 0) {
                            ret["result"] = "NG";
                            ret["msg_face"] = "(# ﾟДﾟ) ﾊﾞｶﾒｯ!";
                            console.log("login_error");
                        } else {
                            ret["result"] = "OK";
                            req.session.userCd = result.rows[0]["ユーザーcd"];
                            for (lc = 0; lc < result.rowCount; lc++) {
                            }
                            ret["msg_face"] = "(*´ω｀) ﾖｳｺｿ";
                            console.log("login_sucsess");
                        }
                    }
                } catch (err) {
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
        
        //res.render('login', { title: 'Login' });
    }
});

module.exports = router;
