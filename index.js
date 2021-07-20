const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require('./models/User');

const {
  User
} = require('./models/User');

//application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: true }));

//application/json 
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => console.log('MongoDBG Connected...')).catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello World! -반가워요-'));

app.post('/api/users/register', (req, res) => {

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

app.post('/api/users/login', (req, res) => {

  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {

    // console.log('user', user)
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
    //요청된 이메일이 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
      return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })
    
      //비밀번호까지 맞다면 토큰을 생성한다.
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        //토큰을 저장한다. 어디에? 쿠키, 로컬스토리지 등...
        res.cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id })
      })
    })
  })
})


// role 1 어드민    role 2 특정 부서 어드민 
// role 0 -> 일반유저   role 0이 아니면  관리자 
app.get('/api/users/auth', auth, (req, res) => {
  //여기 까지 미들웨어를 통과해 왔다는 얘기는  Authentication 이 True 라는 말.
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})




const port = 5000;

app.listen(port, () => console.log(`Example app listening on port ${port}!`));