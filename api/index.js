const express = require('express');
const http = require('http');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const authRoutes = require('./routes/authRoutes');
const dotenv = require('dotenv');
const chaRoutes = require('./routes/chatRoutes')
const socketIo = require('socket.io');
const cors = require('cors')

const app = express();
const server = http.createServer(app);
app.use(cors());

dotenv.config()
const mongoDBUrl = process.env.MONGO_URL;
mongoose.connect(mongoDBUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB conennection error'));
db.once('open', () =>{
  console.log('connected to MongoDB');
});


app.use(
  session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

app.use('/auth', authRoutes);

app.use('/chat', chaRoutes);


app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.send('The backend server')
});

const PORT = 3330 ||  process.env.PORT
const io = socketIo(server,{
  cors:{
    origin: "http://localhost:3331",
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on("chat", (payload) => {
    console.log("Information here", payload)
    on.emit("chat", payload);
  });

  socket.on('disconnect', () => {
    console('A user disconnected', socket.id)
  });
});


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});
