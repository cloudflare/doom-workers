#!/usr/bin/env node

/*
 * Simple HTTP and WebSockets server & message router to test doom-wasm locally
 * HTTP at 8000, WebSockets at 8001
 */

const WebSocket = require('ws')
const fs = require('fs')
const url = require('url')
const http = require('http')
const path = require('path')

const server = http.createServer()
const wss = new WebSocket.Server({
  port: 8001,
  noServer: true,
  perMessageDeflate: false,
  clientTracking: true,
  verifyClient: false,
})

const root = __dirname + '/../assets'

clients = []
uids = 0

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    from = data.slice(4, 8).readUInt32LE()
    to = data.slice(0, 4).readUInt32LE()
    console.log(`< ${data.toString('hex')} (from: ${from}, to ${to})`)
    // if it's a new client, add it to the table of clients
    if (clients.map(c => c.from).indexOf(from) == -1) {
      ws.id = uids++
      clients.push({
        from: from,
        id: ws.id,
      })
    }
    // send this packet to the corresponding client
    i = clients.map(c => c.from).indexOf(to)
    if (i != -1) {
      wss.clients.forEach(function each(client) {
        if (
          client.id == clients[i].id &&
          client.readyState === WebSocket.OPEN
        ) {
          console.log(`> ${data.slice(4).toString('hex')} (to: ${to})`)
          client.send(data.slice(4))
        }
      })
    }
  })

  ws.on('close', function close() {
    i = clients.map(e => e.id).indexOf(ws.id)
    if (i != -1) {
      clients.splice(i, 1)
    }
    console.log(`client ${ws.id} disconnected`)
  })
})

wss.on('error', err => {
  console.log('we got an error:\n')
  console.log(err)
})

setInterval(() => {
  console.log(`# clients: ${clients.length}`)
}, 5000)

mimes = {
  html: 'text/html',
  css: 'text/css',
  wad: 'application/binary',
  cfg: 'text/plain',
  ico: 'text/plain',
  js: 'text/javascript',
  wasm: 'application/wasm',
  map: 'text/plain',
  png: 'image/png',
}

function jsonReply(response, json, status) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json;charset=UTF-8')
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.write(JSON.stringify(json))
  response.end()
}

server.on('request', (request, response) => {
  const { method, url, headers } = request

  mockRoom = '12344567890-1234567890'

  if (method === 'GET') {
    switch (url) {
      case `/api/room/${mockRoom}`:
        jsonReply(
          response,
          {
            room: mockRoom,
            gameStarted: false
          },
          200,
        )
        break
      case '/api/newroom':
        jsonReply(
          response,
          {
            room: mockRoom,
          },
          200,
        )
        break
      default:
        var name = url == '/' ? 'index.html' : url
        file = path.join(root, '/', name)
        if (!fs.existsSync(file)) file = path.join(root, '/index.html')
        var ext = file.split('.').slice(-1)[0]
        console.log(`200 ${file} (${mimes[ext]})`)
        response.statusCode = 200
        response.setHeader('Content-Type', mimes[ext])
        response.write(fs.readFileSync(file, null))
        response.end()
        break
    }
  }
})

console.log(`Point your browser to http://0.0.0.0:8000`);
server.listen(8000)
