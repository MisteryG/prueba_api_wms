const express = require('express')
const http = require('http')
const asyncify = require('express-asyncify')
var bodyParser = require('body-parser')
const socketIO = require('socket.io')
const app = asyncify(express())
const server = http.createServer(app)
const axios = require ('axios')

var users = {}

//uso del socket
//para kevin
const io = socketIO(server)
io.on('connection', socket => {

    setInterval(function () {
            socket.emit('messages', 'holi')
    }, 1000); 

    var idConnect
    socket.on('connected', datos => {
        idConnect= datos.Usuario
        console.log(`Usuario intenta conexión ${idConnect}`)
        if(Object.entries(users).length != 0){
            if(Object.values(users).indexOf(idConnect) >-1){
                console.log("Error el usuario ya esta conectado")
                const obj ={
                    id:idConnect,
                    error: '00x100'
                }
                io.to(socket.id).emit("messages", obj)
            }else{
                users[socket.id]= datos.usuario
                console.log(`Usuario conectado ${idConnect}`)
            }
        } else {
            console.log(`Usuario conectado ${idConnect}`)
            users[socket.id]= datos.TerminalId
        }
        socket.on('disconnect', function() {
            delete users[socket.id]
            console.log(`Usuario desconectado ${idConnect}`)
        })

        socket.on('response', resp => {
            console.log('response -> ',resp)
            //verifica que el action sea de tipo respuesta
            if(resp.Action ==='ticket'){  
                impTicket(resp) 
            }              
        })
    })
})

// para logueo e impresion
// de ticket
function impTicket (ticket) {
    console.log("Funcion para imprimir ticket")
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', (req, res) => {
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
    }
});

async function aPeticion(user, pass){
    let prueba;
    try {
        prueba = await axios.post('http://192.168.1.99:3100/logueo', {user:user,pass:pass});
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