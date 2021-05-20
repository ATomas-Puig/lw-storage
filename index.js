const express = require('express');
const { v4: uuidv4,} = require('uuid');
const multer = require('multer');
const promise = require('bluebird');
const db = require('pg-promise')({ promiseLib: promise })({ connectionString: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/dbname',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false });

const PORT = process.env.PORT || 5000

db.none("CREATE TABLE IF NOT EXISTS files (name TEXT, type TEXT, data BYTEA)");


express()

  .post("/uploadimage", multer({storage: multer.memoryStorage()}).single('fichero'), async function(req, res) {
      const imgName = uuidv4();
      db.none("INSERT INTO files(name, type, data) VALUES($1, 'image/png', $2)", [imgName, req.file.buffer]);
      res.send({ imgUrl: 'uploads/' + imgName });
  })
  
    .post("/uploadvideo", multer({storage: multer.memoryStorage()}).single('fichero'), async function(req, res) {
      const imgName = uuidv4();
      db.none("INSERT INTO files(name, type, data) VALUES($1, 'video/mp4',$2)", [imgName, req.file.buffer]);
      res.send({ imgUrl: 'uploads/' + imgName });
  })
      .post("/uploadfile", multer({storage: multer.memoryStorage()}).single('fichero'), async function(req, res) {
      const imgName = uuidv4();
      db.none("INSERT INTO files(name, type, data) VALUES($1, 'application/octet-stream',$2)", [imgName, req.file.buffer]);
      res.send({ imgUrl: 'uploads/' + imgName });
  })
    
  .get('/uploads/:upload', async function (req, res){
    const data = await db.any("SELECT type, data FROM files WHERE name = ${name}", { name: req.params.upload });
    const file = Buffer.from(data[0].data, 'binary');

    res.writeHead(200, {'Content-Type': data.type, 'Content-Length': file.length });
    res.end(file);
  })

  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
