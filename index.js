const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');

const config = require('./config/key');

const {
  User
} = require('./models/User');

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));

//application/json
app.use(bodyParser.json());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => console.log('MongoDBG Connected...')).catch(err => console.log(err))





app.get('/', (req, res) => res.send('Hello World! -반가워요-'));

app.post('/register', (req, res) => {

  //회원 가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
  const user = new User(req.body) //client 정보들을 DB에 넣기 위해. req.body 안에 id, password가 들어있다

  user.save((err, userInfo) => { //정보들이 user모델에 저장이 되는 것
    if (err) return res.json({
      success: false,
      err
    }) //저장을 할 때 에러가 있으면, client에 전달을 해줘야함
    //json 형식으로 저장. 성공하지 못했다고 전달 & 에러 메세지도 함께 전달
    return res.status(200).json({
      success: true //성공하면 success: true 뜨게
    })
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));