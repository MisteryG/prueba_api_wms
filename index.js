const express = require('express')
const http = require('http')
const asyncify = require('express-asyncify')
var bodyParser = require('body-parser')
const socketIO = require('socket.io')
const app = asyncify(express())
const server = http.createServer(app)
const axios = require ('axios')
const cors = require('cors')

var users = []

const io = socketIO(server)

io.on('connection', socket => {

  var idConnect
  socket.on('connected', datos => {
    try{
        idConnect= datos.DeviceId
        if(users.length != 0){
          const resultado = users.find( data => 
            (data.DeviceId === datos.DeviceId) && (data.UserId === datos.UserId))
          if(!resultado){
            console.log(`[user connected] ${idConnect}`)
            datos.socketID=socket.id
            users.push(datos)
            const obj ={
              action: 'login',
              response: 'success'
            }
            // console.log(JSON.stringify(datos))
            io.to(socket.id).emit("messages", obj)

          }else{
            const obj = {
              action: 'login',
              response: 'error',
              error: '00x100'
            }
            io.to(socket.id).emit("messages", obj)
          }
        }else{
          console.log(`[user connected] ${idConnect}`)
          // console.log(JSON.stringify(datos))
          datos.socketID=socket.id
          users.push(datos)
          const obj ={
            action: 'login',
            response: 'success'
          }
          io.to(socket.id).emit("messages", obj)
          // console.log(`[users]` , users)
        }
    }catch(e){
      console.log('| ocurrio un error |', e)
    }
    
  })

  socket.on('disconnect', function() {
      let finded = users.findIndex((data)=>data.socketID == socket.id)
      if(finded != -1){
        users.splice(finded,1)
        console.log('[usuario desconectado]', idConnect)
      }
  })
})

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/ticket', (req, res) => {
    let verificacion = req.body
    if (verificacion.hasOwnProperty('action')&&verificacion.hasOwnProperty('UserId')&&verificacion.hasOwnProperty('DeviceId')&&verificacion.hasOwnProperty('LP')) {
        verificacion.LP=verificacion.LP.toUpperCase()
        if (verificacion.action==='imprimir') {
            io.emit("messages", verificacion);
            res.send('Ticket enviado '+JSON.stringify(verificacion))
        } else {
            io.emit("messages", verificacion);
            res.send('No es para nadie '+JSON.stringify(verificacion))
        }
    } else {
        io.emit("messages", verificacion);
        res.send('El objeto no contiene propiedades validas '+JSON.stringify(verificacion))
    }
});

server.listen(8080,()=>{
    console.log('Node app is running on port 8080')
});