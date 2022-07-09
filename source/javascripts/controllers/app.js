import 'leaflet-rotatedmarker'
import Airplane   from '../components/Airplane'
import Dialogue   from '../components/Dialogue'
import Checkpoint from '../components/Checkpoint'
import initJoy    from '../vendor/joy'

export default class AppCtrl {
  constructor() {
    initJoy()
    let map = L.map('map').setView([37.386, -6.2001], 13)
    L.tileLayer('https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png', {
      maxZoom: 10,
    	attribution: ''
    }).addTo(map)

    const airplane = new Airplane(map)
    airplane.takeOff()

    let keys = {
      w: false,
      d: false,
      s: false,
      a: false
    }
    const breakpointMD = 768
    let interval
    if (window.innerWidth < breakpointMD) {
      const translations = {
        N: ['w'],
        S: ['s'],
        E: ['d'],
        W: ['a'],
        NE: ['w', 'd'],
        NW: ['w', 'a'],
        SE: ['s', 'd'],
        SW: ['s', 'a'],
        C: []
      }
      let joy = new JoyStick('joyDiv')
      setInterval(function(){ 
        const keysArr = translations[joy.GetDir()]
        for(const [key, value] of Object.entries(keys)) {
          if (keysArr.includes(key)) {
            keys[key] = true
          } else {
            keys[key] = false
          }
        }
        airplane.move(keys)
      }, 10)
    }

    const intro_dialogue = [
      `Originally this page was a gift where you had to move on the map with the plane following a series of clues.`
    ]
    const rodri_explanation = [
      `I have shortened the route, if you pass through Cádiz airport and "land" in Mallorca it's enough.`
    ]
    if (window.innerWidth < breakpointMD) {
      rodri_explanation.push(`Just hold the joystick in the direction you want to go and in mallorca press the landing button. be careful not to press the button too early or the plane will literally explode.`)
    } else {
      rodri_explanation.push(`The controls are easy, W to go up, S to go down, A to go left, D to go right and press CTRL to "land". Be careful not to press CTRL too early or the plane will literally explode.`)
    }

    const dialogue_after_intro = new Dialogue(rodri_explanation, 'rodri', () => airplane.canMove = true)
    const dialogue_intro = new Dialogue(intro_dialogue, 'rafa', () => dialogue_after_intro.show())
    dialogue_intro.show()

    map.on('click', function(e) {
      console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
      console.log(airplane.latitude, airplane.longitude)
    })

    const andorraHint = [`Here was the clue to the next site. Go to Mallorca`]

    const onReachCadiz = () => {
      map.setZoom(7)
      airplane.maxSpeed = 0.005
    }

    const cadizCheckpoint = new Checkpoint(
      {latitude: 36.901587303978474, longitude: -6.216888427734376},
      {latitude: 36.61001603394619, longitude: -5.8941650390625},
      new Dialogue(andorraHint, 'hacker', onReachCadiz)
    )
    airplane.checkpoints.push(cadizCheckpoint)

    const dialogueRafaEnd = [`Now it showed the flight ticket which was the real gift.`]
    const rafaEnd = new Dialogue(dialogueRafaEnd, 'rafa', () => {
      airplane.canMove = false
      const tickets = find('.container-ticket')
      removeClass(tickets, 'hidden')
      find('#joyDiv').remove()
      find('.land-js').remove()
      setTimeout(() => {
        tickets.style.opacity = 1
      }, 100)
    })

    const mallorcaCheckPoint = new Checkpoint(
      {latitude: 40.019201307686785, longitude: 2.2631835937500004},
      {latitude: 39.095962936305476, longitude: 3.8891601562500004},
      rafaEnd
    )

    on('.land-js', 'click', () => {
      airplane.land(mallorcaCheckPoint)
    })

    on(document, 'keydown', (event) => {
      if (event.key == 'Control') {
        airplane.land(mallorcaCheckPoint)
      }
      keys[event.key] = true
      clearInterval(interval)
      interval = setInterval(() => {
        airplane.move(keys)
      }, 10)
    })

    on(document, 'keyup', (event) => {
      keys[event.key] = false
      clearInterval(interval)
      airplane.decelerate(keys)
      if (keys.w == true || keys.s == true || keys.a == true || keys.d == true) {
        interval = setInterval(() => {
          airplane.move(keys)
        }, 10)
      }
    })
  }
}
