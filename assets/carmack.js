if (window.location.hostname == '0.0.0.0') {
  web = 'http://0.0.0.0:8000'
  base = 'http://0.0.0.0:8000'
  wsbase = 'ws://0.0.0.0:8001'
} else {
  web = 'https://silentspacemarine.com'
  base = 'https://router.silentspacemarine.com'
  wsbase = 'wss://router.silentspacemarine.com'
}

timer = false
room = false

adjectives = [
  'Grumpy',
  'Ecstatic',
  'Surly',
  'Prepared',
  'Crafty',
  'Alert',
  'Sluggish',
  'Testy',
  'Reluctant',
  'Languid',
  'Passive',
  'Pacifist',
  'Aggressive',
  'Hostile',
  'Bubbly',
  'Giggly',
  'Laughing',
  'Crying',
  'Frowning',
  'Torpid',
  'Lethargic',
  'Manic',
  'Patient',
  'Protective',
  'Philosophical',
  'Enquiring',
  'Debating',
  'Furious',
  'Laid-Back',
  'Easy-Going',
  'Cromulent',
  'Excitable',
  'Tired',
  'Exhausted',
  'Ruminating',
  'Redundant',
  'Sporty',
  'Ginger',
  'Scary',
  'Posh',
  'Baby',
]
nouns = [
  'Frad',
  'Cacodemon',
  'Arch-Vile',
  'Cyberdemon',
  'Imp',
  'Demon',
  'Mancubus',
  'Arachnotron',
  'Baron',
  'Knight',
  'Revenant',
  'Ettin',
  'Maulotaur',
  'Centaur',
  'Afrit',
  'Serpent',
  'Disciple',
  'Gargoyle',
  'Golem',
  'Lich',
  'Sentinel',
  'Acolyte',
  'Templar',
  'Reaver',
  'Spectre',
]

$ = (id) => {
  return document.getElementById(id)
}

isMobile = () => {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ]

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem)
  })
}

isTouch = () => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  )
}

write = (msg) => {
  $('text').innerHTML = msg
  $('text').style.display = ''
}

display = (ids, v) => {
  ids.forEach((id) => {
    $(id).style.display = v ? v : ''
  })
}

genPetName = () => {
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${
    nouns[Math.floor(Math.random() * nouns.length)]
  }`
}

deathMatchOr = (next) => {
  var t = '<h1 class="vspace">Chose the type of multiplayer game</h1>'
  t += '<a class="btn secondary" id="deathmatch">Deathmatch</a>'
  t += '<a class="btn primary" id="cooperative">Cooperative</a>'
  write(t)
  onClick('deathmatch', () => {
    commonArgs = commonArgs.concat(['-deathmatch'])
    next()
  })
  onClick('cooperative', () => {
    next()
  })
}

startSolo = () => {
  display(['logo', 'buttons', 'menu'], 'none')
  display(['canvas'])
  typewriter([
    'W,A,S,D OR ARROWS TO MOVE, Q,E,Z|O TO STRAFE, X|P FOR SPEED, C TO OPEN',
    'TAB SHOWS THE MAP, T TO WRITE (MULTIPLAYER), YOU CAN ALSO USE THE MOUSE',
  ])
  callMain(commonArgs)
}

onClick = (id, func) => {
  $(id).onclick = (e) => {
    clickEffect(id, () => {
      func(e)
    })
  }
}

clickEffect = (id, next) => {
  let oc = $(id).className
  $(id).className = 'btn grey'
  setTimeout(() => {
    $(id).className = oc
    if (next) next()
  }, 100)
}

typewriter = (msg) => {
  if (timer) {
    clearTimeout(timer)
    timer = false
  }
  if (Array.isArray(msg)) {
    let i = 0
    w = () => {
      let f = $('footer')
      f.classList.remove('writer')
      f.offsetWidth = f.offsetWidth
      f.classList.add('writer')
      f.innerHTML = msg[i++]
      if (i >= msg.length) i = 0
      timer = setTimeout(w, 10000)
    }
    w()
  } else {
    $('footer').innerHTML = msg
  }
}

mobileInfo = (next) => {
  // show mobile info to hide toolbar
  if (isMobile()) {
    display(['monitor'], 'none')
    display(['mobile'], 'block')
    setTimeout(() => {
      display(['mobile'], 'none')
      display(['monitor'], 'block')
      next()
    }, 5000)
  } else {
    display(['monitor'], 'block')
    next()
  }
}

// virtul gamepad code
virtualGamepads = () => {
  if (isTouch()) {
    var left_joy = nipplejs.create({
      zone: $('joystick1'),
      color: '#7d2300',
      mode: 'static',
      identifier: 1,
      position: { bottom: '50%', left: '50%' },
    })

    var right_joy = nipplejs.create({
      zone: $('joystick2'),
      color: '#7d2300',
      mode: 'static',
      identifier: 2,
      position: { bottom: '50%', right: '50%' },
    })

    const ne = [30, 60]
    const nw = [120, 150]
    const sw = [210, 240]
    const se = [300, 330]

    const left = 37
    const right = 39
    const down = 40
    const up = 38
    const speed = 16
    const fire = 32
    const use = 69
    const enter = 13
    const strafe_left = 65
    const strafe_right = 68

    left_joy
      .on('start end', (evt, data) => {
        switch (evt.type) {
          case 'end':
            sendkey([left, right, down, up, speed], 'keyup')
            break
        }
      })
      .on('move', function (evt, data) {
        if (data.direction) {
          if (data.distance > 20) {
            var press_left = false
            var press_right = false
            var press_down = false
            var press_up = false
            switch (data.direction.angle) {
              case 'left':
                press_left = true
                if (data.angle.degree >= nw[0] && data.angle.degree <= nw[1])
                  press_up = true
                if (data.angle.degree >= sw[0] && data.angle.degree <= sw[1])
                  press_down = true
                break
              case 'right':
                press_right = true
                if (data.angle.degree >= ne[0] && data.angle.degree <= ne[1])
                  press_up = true
                if (data.angle.degree >= se[0] && data.angle.degree <= se[1])
                  press_down = true
                break
              case 'up':
                press_up = true
                if (data.angle.degree >= nw[0] && data.angle.degree <= nw[1])
                  press_left = true
                if (data.angle.degree >= ne[0] && data.angle.degree <= ne[1])
                  press_right = true
                break
              case 'down':
                press_down = true
                if (data.angle.degree >= sw[0] && data.angle.degree <= sw[1])
                  press_left = true
                if (data.angle.degree >= se[0] && data.angle.degree <= se[1])
                  press_right = true
                break
            }
            sendkey([left], press_left ? 'keydown' : 'keyup')
            sendkey([right], press_right ? 'keydown' : 'keyup')
            sendkey([down], press_down ? 'keydown' : 'keyup')
            sendkey([up], press_up ? 'keydown' : 'keyup')
            // this doesn't work well
            // sendkey([speed], data.distance == 50 ? 'keydown' : 'keyup')
          } else {
            sendkey([left, right, down, up, speed], 'keyup')
          }
        }
      })

    right_joy
      .on('start end', (evt, data) => {
        switch (evt.type) {
          case 'start':
            break
          case 'end':
            sendkey([strafe_left, strafe_right, fire, use, enter], 'keyup')
            break
        }
      })
      .on('move', function (evt, data) {
        if (data.direction) {
          if (data.distance > 20) {
            switch (data.direction.angle) {
              case 'left':
                sendkey([strafe_left], 'keydown')
                sendkey([fire, enter], 'keyup')
                break
              case 'right':
                sendkey([strafe_right], 'keydown')
                sendkey([fire, enter], 'keyup')
                break
              case 'up':
                sendkey([use], 'keydown')
                sendkey([fire, enter], 'keyup')
                break
              case 'down':
                sendkey([fire, enter], 'keyup')
                break
            }
          } else {
            sendkey([fire, enter], 'keydown')
            sendkey([strafe_left, strafe_right, use], 'keyup')
          }
        } else {
          sendkey([fire, enter], 'keydown')
        }
      })
  }
}

choosePet = (next) => {
  var t = `<h1 class="vspace">Name your pet here</h1><div class="pinput"><a class="btn tertiary" id="random">&#x21bb;</a><input autocorrect="off" autocomplete="off" type="text" id="petname" maxlength="20" value="${genPetName()}"/><a class="btn secondary" id="mypet">Go</a></div>`
  write(t)
  mp = $('petname')
  mp.oninput = () => {
    mp.value = mp.value.replace(/[^0-9a-z\ \-\!]/gi, '')
    $('mypet').className = mp.value.length ? 'btn secondary' : 'btn grey'
  }
  $('mypet').onclick = (e) => {
    if (mp.value.length) {
      clickEffect('mypet', () => {
        commonArgs = commonArgs.concat(['-pet', mp.value])
        next()
      })
    }
  }
  onClick('random', () => {
    mp.value = genPetName()
    $('mypet').className = 'btn secondary'
  })
}

startMultiplayer = () => {
  console.log(display)
  display(['buttons', 'text'], 'none')
  fetch(`${base}/api/newroom`)
    .then((response) => response.json())
    .then((data) => {
      choosePet(() => {
        deathMatchOr(() => {
          display(['logo'], 'none')
          room = data.room
          var t = '<h1 class="vspace">Doom Multiplayer is about to start</h1>'
          t += '<h1 class="vspace">Share this permalink with your friends:</h1>'
          t += `<h1><a class="perma h" data-clipboard-text="${web}/${room}">${web}/${room.slice(
            0,
            8,
          )}...${room.slice(-8)}</a></h1>`
          t +=
            '<h1 class="vspace">Your friends can join until you start the game</h1>'
          t += '<h1>Move to next the screen, wait for them, and</h1>'
          t += '<h1>then hit space to start the game</h1><h1/>'
          t += '<div class="vspace">'
          t += `<a id="clip" class="btn tertiary perma" data-clipboard-text="${web}/${room}" data-room="${room}">Copy Permalink</a>`
          t += `<a class="btn secondary" id="start" data-room="${room}">Next</a>`
          t += '</div>'
          write(t)
          const clp = new ClipboardJS('.perma')
          clp.on('success', () => {
            clickEffect('clip')
          })
          onClick('start', (e) => {
            display(['menu'], 'none')
            display(['canvas'])
            callMain(
              commonArgs.concat([
                '-server',
                '-privateserver',
                '-dup',
                '1',
                '-wss',
                `${wsbase}/api/ws/${e.target.getAttribute('data-room')}`,
              ]),
            )
          })
        })
      })
    })
}

var commonArgs = [
  '-iwad',
  'doom1.wad',
  '-window',
  '-nogui',
  '-nomusic',
  '-config',
  'default.cfg',
  '-servername',
  'doomflare',
  '-nodes',
  '4',
]

var keyboard = (e, type) => {
  var ce = new Event(type, { bubbles: true })
  ce.code = e.target.dataset.key
  ce.key = e.target.dataset.key
  ce.keyCode = e.target.dataset.which
  ce.which = e.target.dataset.which
  Module.canvas.dispatchEvent(ce)
}

var sendkey = (keys, type) => {
  keys.forEach((key) => {
    var ce = new Event(type, { bubbles: true })
    ce.keyCode = key
    ce.which = key
    Module.canvas.dispatchEvent(ce)
  })
}

var Module = {
  onRuntimeInitialized: () => {
    room = window.location.pathname.slice(1)
    if (room.match(/[a-z0-9]+-[a-z0-9]+/g)) {
      fetch(`${base}/api/room/${room}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.room) {
            if (data.gameStarted == true) {
              write(
                '<h1 class="vspace">Too late, this game has already started ;(</h1><h1>Redirecting you back...</h1>',
              )
              setTimeout(() => {
                window.location.replace('/')
              }, 7000)
            } else {
              setTimeout(() => {
                choosePet(() => {
                  display(['menu'], 'none')
                  display(['canvas'])
                  typewriter([
                    'Connecting to master server. Please wait.',
                    'Still trying. Is the master server for this room running?',
                  ])
                  callMain(
                    commonArgs.concat([
                      '-connect',
                      '1',
                      '-dup',
                      '1',
                      '-wss',
                      `${wsbase}/api/ws/${room}`,
                    ]),
                  )
                })
              }, 3000)
            }
          } else {
            display(['logo', 'buttons'], 'none')
            write('<h1>Invalid room. Redirecting.</h1>')
            setTimeout(() => {
              window.location.replace('/')
            }, 3000)
          }
        })
    } else {
      $('solo').className = 'btn primary'
      $('multiplayer').className = 'btn secondary'
      onClick('solo', startSolo)
      onClick('multiplayer', startMultiplayer)
    }
  },
  noInitialRun: true,
  preRun: () => {
    Module.FS.createPreloadedFile('', 'doom1.wad', 'doom1.wad', true, true)
    Module.FS.createPreloadedFile('', 'default.cfg', 'default.cfg', true, true)
  },
  printErr: (text) => {
    if (arguments.length > 1)
      text = Array.prototype.slice.call(arguments).join(' ')
    console.error(text)
  },
  postRun: () => {
    Array.from(document.querySelectorAll('.controls')).forEach(function (
      control,
    ) {
      if ('ontouchstart' in document.documentElement) {
        // Mobile:
        control.addEventListener('touchstart', function (event) {
          keyboard(event, 'keydown')
        })
        control.addEventListener('touchend', function (event) {
          keyboard(event, 'keyup')
        })
      } else {
        // Desktop:
        control.addEventListener('click', function (event) {
          keyboard(event, 'keydown')
          window.setTimeout(function () {
            keyboard(event, 'keyup')
          }, 100)
        })
      }
    })
  },
  canvas: (function () {
    var canvas = document.getElementById('canvas')
    canvas.addEventListener(
      'webglcontextlost',
      function (e) {
        alert('WebGL context lost. You will need to reload the page.')
        e.preventDefault()
      },
      false,
    )
    return canvas
  })(),
  print: function (text) {
    if (text.startsWith('doom: ')) {
      ;[id, msg] = text.slice(6).split(',')
      switch (parseInt(id)) {
        case 2:
          msg = [
            'Connected to Cloudflare WebSockets. Waiting for other players',
            'Still here, waiting for the host to start the game',
          ]
          break
        case 9: // connecting to ws failed
          setTimeout(() => {
            window.location.replace('/')
          }, 5000)
          break
        case 10: // game starts
          msg = false
          typewriter([
            'MOVE = MOUSE, WSOP OR ARROWS, SHIFT = RUN, E = USE, AD = STRAFE (OR HOLD C)',
            'TAB = MAP, T = SAY, F = FULLSCREEN, LEFT MOUSE OR SPACE = FIRE',
          ])
          if (room) {
            // multiplayer?
            fetch(`${base}/api/room/${room}/started`)
              .then((response) => response.json())
              .then((data) => {
                console.log(data)
                console.log(`router notified that ${room} has started`)
              })
          }
          break
        case 5:
        case 8:
          msg = false
          break
        default:
          msg = msg.trim()
          break
      }
      if (msg) typewriter(msg)
    }
    console.log(text)
  },
  setStatus: function (text) {
    console.log(text)
  },
  totalDependencies: 0,
  monitorRunDependencies: function (left) {
    this.totalDependencies = Math.max(this.totalDependencies, left)
    Module.setStatus(
      left
        ? 'Preparing... (' +
            (this.totalDependencies - left) +
            '/' +
            this.totalDependencies +
            ')'
        : 'All downloads complete.',
    )
  },
}

window.onerror = function (event) {
  Module.setStatus('Exception thrown, see JavaScript console')
  Module.setStatus = function (text) {
    if (text) Module.printErr('[post-exception status] ' + text)
  }
}

// hack to disable pinch to zoom on mobile
document.addEventListener('gesturestart', function (e) {
  e.preventDefault()
})

mobileInfo(() => {
  display(['logo', 'text'])
  display(['canvas'], 'none')
  virtualGamepads()

  if (window.location.pathname.slice(1).match(/[a-z0-9]+-[a-z0-9]+/g)) {
    write('<h1 class="vspace">Validating room...</h1>')
  } else {
    display(['buttons'])
  }
})
