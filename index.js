const express = require('express')
const http = require('http')
const asyncify = require('express-asyncify')
var bodyParser = require('body-parser')
const socketIO = require('socket.io')
const app = asyncify(express())
const server = http.createServer(app)
const axios = require ('axios')

var users = []

const io = socketIO(server)

io.on('connection', socket => {

  var idConnect
  socket.on('connected', datos => {

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
      datos.socketID=socket.id
      users.push(datos)
      const obj ={
        action: 'login',
        response: 'success'
      }
      io.to(socket.id).emit("messages", obj)
      // console.log(`[users]` , users)
    }
    
  })

  socket.on('disconnect', function() {
      users.findIndex((data, x)=>{
        if(data.socketID === socket.id)
           users.splice(x,1)
      })
      // console.log('______ users ______  ', users)
      // console.log(`Usuario desconectado ${idConnect}`)
  })
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/logueo', (req, res) => {
    if (req.body.action==="logueo") {
        aPeticion(req.body.user,req.body.pass).then(
            function(result) {
                if (result.hasOwnProperty('codigo')){
                    res.send(`${result.texto} ${result.codigo}`)
                } else if (result.data.valor==="Correcto") {
                    res.send('Usuario logueado correctamente')
                } else {
                    res.send(`Error de logueo ${result.data.valor}`)
                }
        });
    } else {
        res.send('Sin palabra clave')
    }
});

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

async function aPeticion(user, pass){
    let prueba;
    try {
        prueba = await axios.post('http://192.168.1.99:3200', {user:user,pass:pass});
        return prueba;
    } catch (error) {
        prueba = {
            codigo:error.code,
            texto:"Error en la conexion con usuarios"
        }
        return prueba;
    }
}

server.listen(3100,()=>{
    console.log('Node app is running on port 3100')
});