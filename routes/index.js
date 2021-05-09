var express = require('express');
var router = express.Router();

var pg = require('pg');
const pool = new pg.Pool({
    user: 'sxcfvhmctyqrpr',
    host: 'ec2-3-215-57-87.compute-1.amazonaws.com',
    database: 'd7ct6eqb6kkr5j',
    password: 'e0a878b7ffa7b91b27624f39b9d5d8e7b62e3e44608e1f2e98558af7916359bb',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

/* GET home page. */
router.get('/', function (req, res, next) {
    if (!req.session.userCd) {
        res.render('login');
    }
    var datas = [];
    pool.connect(async (err, client) => {
        if (err) {
            console.log(err);
        } else {

            //同期っぽい処理
            try {
                    res.render('index', { title: 'Express', data: datas });
                
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
