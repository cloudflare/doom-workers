export default {
  async fetch(request, env) {
    let url = new URL(request.url)
    let route = url.pathname.slice(1).split('/')[0]

    switch (route) {
      case 'api':
        return handleApiRequest(url.pathname, request, env)
      default:
        return new Response('notfound ' + route, { status: 404 })
    }
  },
}

async function checkRoom(perma, env) {
  try {
    const parts = perma.split('-')
    const digest = await crypto.subtle.digest(
      { name: 'SHA-256' },
      new TextEncoder().encode(parts[0] + env.DOOM_KEY),
    )
    const hash = Array.from(new Uint8Array(digest))
    const hex = hash
      .slice(0, 4)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return parts[1] == hex ? parts[0] : false
  } catch (e) {
    return false
  }
}

async function createRoom(env) {
  const room = env.router.newUniqueId().toString()
  const digest = await crypto.subtle.digest(
    { name: 'SHA-256' },
    new TextEncoder().encode(room + env.DOOM_KEY),
  )
  const hash = Array.from(new Uint8Array(digest))
  const hex = hash
    .slice(0, 4)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return `${room}-${hex}`
}

async function jsonReply(json, status) {
  return new Response(JSON.stringify(json), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
    status: status,
  })
}

async function handleApiRequest(path, request, env) {
  let parts = path.slice(1).split('/')
  let room = false

  switch (parts[1]) {
    case 'ws':
    case 'room':
      room = await checkRoom(parts[2], env)
      if (room) {
        // in the future this will be our game id
        let id = env.router.idFromString(room)
        let routerObject = env.router.get(id)
        return routerObject.fetch(path, request)
      } else {
        return jsonReply({ reason: 'invalid room' }, 404)
      }

    case 'newroom':
      room = await createRoom(env)
      return jsonReply({ room: room }, 200)

    default:
      return jsonReply({ reason: 'api not found' }, 404)
  }
}

export class Router {
  constructor(controller, env) {
    this.storage = controller.storage
    this.env = env
    this.sessions = []
    this.gameStarted = false
  }

  async fetch(request) {
    let url = new URL(request.url)
    let up = url.pathname.slice(1).split('/')

    switch (up[1]) {
      case 'room':
        var room = await checkRoom(up[2], this.env)
        if (room) {
          if (up[3] == 'started') {
            this.gameStarted = true
          }
          return jsonReply(
            {
              room: room,
              gameStarted: this.gameStarted,
            },
            200,
          )
        } else {
          return jsonReply({ reason: 'invalid room' }, 404)
        }

      case 'ws':
        if (request.headers.get('Upgrade') != 'websocket') {
          return new Response('expected websocket', { status: 400 })
        }

        // Get the client's IP address for use with the rate limiter.
        // let ip = request.headers.get('CF-Connecting-IP')

        const [client, server] = Object.values(new WebSocketPair())

        await this.handleSession(server)
        return new Response(null, { status: 101, webSocket: client })
    }
  }

  async handleSession(webSocket) {
    webSocket.accept()

    webSocket.addEventListener('message', async msg => {
      try {
        let data = msg.data
        let from = new Uint32Array(data.slice(4, 8))[0]
        let to = new Uint32Array(data.slice(0, 4))[0]
        let i

        if (from == 1 && to == 0) {
          // initial packet from doom server, let's restart
          this.sessions.forEach(s => {
            s.ws.close(1011, 'closing')
          })
          this.sessions = []
        }

        // if it's a new client, add it to the table of clients
        if (this.sessions.map(c => c.from).indexOf(from) == -1) {
          let session = { ws: webSocket, from: from }
          this.sessions.push(session)
        }

        // send this packet to the corresponding client
        i = this.sessions.map(c => c.from).indexOf(to)
        if (i != -1) {
          this.sessions[i].ws.send(data.slice(4))
        }
      } catch (err) {
        webSocket.send(err.stack)
      }
    })

    // On "close" and "error" events, remove the WebSocket from the clients list
    let closeOrErrorHandler = async () => {
      i = this.sessions.map(e => e.ws).indexOf(webSocket)
      if (i != -1) {
        this.sessions.splice(i, 1)
      }
    }
    webSocket.addEventListener('close', closeOrErrorHandler)
    webSocket.addEventListener('error', closeOrErrorHandler)
  }
}
