const express = require('express');
const app = express();
const session = require('express-session');

const path = require('path');
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use(
  session({
    secret: 'nothing',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, 
  })
);

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});



function isAuthenticated(req,res,next) {
  if(req.session && req.session.username){
    next();
  }
  else {
    res.redirect('/login');
  }
}



const todolist = require('./models/user');
const userData = require('./models/userData');



app.get('/',(req,res)=>{
  if(req.session && req.session.username){
    return res.redirect(`/list/${req.session.username}`);
  }
  res.render('login', {messagePass : ''});
})

app.get('/register',(req,res)=>{
  if(req.session && req.session.username){
    return res.redirect(`/list/${req.session.username}`);
  }
  res.render('register', {messagePass : ''});
})

app.post('/register',async (req,res)=>{
  const { name, email , username, password } = req.body;
  const userCheck = await todolist.findOne({ $or: [{ username: username }, { email: email }] });
  if(userCheck) {
    return res.render('register',{ messagePass : 'User Already exists!, Login to continue'});
  }
  else {
    const newUser = await todolist.create({
      name,
      email,
      username,
      password
    });
    return res.render('login',{messagePass : 'Registered Successfully!'});
  }
})

app.get('/login',(req,res)=>{
  if(req.session && req.session.username){
    return res.redirect(`/list/${req.session.username}`);
  }
  res.render('login', {messagePass : ''});
});

app.post('/login',async (req,res)=>{
  const { username , password } = req.body;
  const userExist = await todolist.findOne({username: username , password: password});
  if(userExist){
    req.session.username = username;
    return res.redirect(`/list/${username}`);
  }
  else {
    return res.render('login',{messagePass : 'Invalid Credentials!'});
  }
})

app.post('/create/:username',isAuthenticated, async (req, res) => {
  const data1 = req.body.inputData;
  const username = req.params.username;
  if(data1){
    await userData.create({
      username: username,
      description: data1,
    });
    return res.redirect(`/list/${username}`);
  }
  else {
    return res.redirect(`/list/${username}`);
  }
});

app.get('/list/:username',isAuthenticated, async (req, res) => {
  const username = req.params.username;
  const checkUser = await userData.find({ username });
  const data = checkUser.map(user => ({
    description: user.description,
    id : user._id
  }))
  return res.render('index',{data : data , username : username});
});

app.get('/delete/:username/:id',async (req,res)=>{
  const username = req.params.username;
  const id = req.params.id;
  const findUser = await userData.findOneAndDelete({ _id : id})
  return res.redirect(`/list/${username}`);
  console.log(id);
})

app.get('/logout',(req,res)=>{
  req.session.destroy(err =>{
    if(err){
      return res.redirect(`/list/${req.session.username}`);
    }
    return res.redirect('/login');
  })
})

app.listen(3000,()=>{
  console.log('Running on Port : 3000')
});

