var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var router = express.Router();
var conf = require('../config/config.json');
var pg = require('pg');
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

// crypto
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


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


/* GET users listing. */
router.get('/', function (req, res, next) {
    console.log("login!");

    var pics = ["eri.jpg", "eri2.jpg", "eri3.jpg", "eri4.jpeg"];
    var random = secureRandom();
    var picPath;

    for (var i = 0; i <= pics.length; i++) {
        if (i <= random && i + 1 > random){
            picPath = pics[i];
        }
    }

    res.render('login', { picPath: picPath });
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
                    var result = await client.query("select * from " + conf.db.schema +"m_user where id = ($1) and パスワード = ($2)"
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
        
        //res.render('login', { title: 'Login' });
    }
});

module.exports = router;
