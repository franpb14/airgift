const Acceleration = 0.00002
export default class Airplane {
  constructor(map) {
    this.marker = null
    this.map = map
    this.verticalSpeed = 0.00
    this.horizontalSpeed = 0.00
    this.verticalAcc = 0.00
    this.horizontalAcc = 0.00
    this.maxSpeed = 0.003
    this.latitude = 37.386
    this.longitude = -6.2001
    this.canMove = false
    this.checkpoints = []
  }

  takeOff() {
    let airplaneIcon = L.icon({
      iconUrl: 'public/airplane.png',
      iconSize: [58, 58],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
    let latlong = [37.386, -6.2001]
    this.marker = L.marker(latlong, {icon: airplaneIcon})
    this.marker.addTo(this.map)
  }

  move(keys) {
    if (!this.canMove) return
    this.checkAndLimitMaxSpeed()

    if (keys.w) this.verticalAcc = Acceleration
    if (keys.s) this.verticalAcc = -Acceleration
    if (keys.a) this.horizontalAcc = -Acceleration
    if (keys.d) this.horizontalAcc = Acceleration

    this.verticalSpeed += this.verticalAcc
    this.horizontalSpeed += this.horizontalAcc
    this.longitude += this.horizontalSpeed
    this.latitude += this.verticalSpeed
    this.marker.setLatLng([this.latitude, this.longitude])
    this.decelerate(keys)
    if (this.checkpoints.length > 0) this.isCheckpointReached(this.latitude, this.longitude)
  }

  isCheckpointReached(lat, lng) {
    if (this.checkpoints[0].showDialogueInZone(lat, lng)) this.checkpoints.shift()
  }

  checkAndLimitMaxSpeed() {
    if (this.verticalSpeed > this.maxSpeed) this.verticalSpeed = this.maxSpeed
    if (this.verticalSpeed < -this.maxSpeed) this.verticalSpeed = -this.maxSpeed
    if (this.horizontalSpeed > this.maxSpeed) this.horizontalSpeed = this.maxSpeed
    if (this.horizontalSpeed < -this.maxSpeed) this.horizontalSpeed = -this.maxSpeed
  }

  decelerate(keys) {
    const verticalSpeedWasPositive = this.verticalSpeed > 0
    const horizontalSpeedWasPositive = this.horizontalSpeed > 0

    if (this.verticalSpeed < 0 && !keys.s) this.verticalAcc = Acceleration
    if (this.verticalSpeed > 0 && !keys.w) this.verticalAcc = -Acceleration
    if (this.horizontalSpeed < 0 && !keys.a) this.horizontalAcc = Acceleration
    if (this.horizontalSpeed > 0 && !keys.d) this.horizontalAcc = -Acceleration

    this.verticalSpeed += this.verticalAcc
    this.horizontalSpeed += this.horizontalAcc

    if (verticalSpeedWasPositive && this.verticalSpeed < 0 || !verticalSpeedWasPositive && this.verticalSpeed > 0) this.verticalSpeed = 0
    if (horizontalSpeedWasPositive && this.horizontalSpeed < 0 || !horizontalSpeedWasPositive && this.horizontalSpeed > 0) this.horizontalSpeed = 0

    this.longitude += this.horizontalSpeed
    this.latitude += this.verticalSpeed
    this.marker.setLatLng([this.latitude, this.longitude])
    this.resetAcc()
    this.rotate()

    this.map.panTo(this.marker.getLatLng())
  }

  resetAcc() {
    this.verticalAcc = 0
    this.horizontalAcc = 0
  }

  rotate() {
    if (this.canMove) {
      const angle = Math.atan2(this.horizontalSpeed*1000, this.verticalSpeed*1000) * 180 / Math.PI
      const initialPlaneAngle = 45
      this.marker.setRotationAngle(angle-initialPlaneAngle)
    }
  }

  land(checkPoint) {
    this.canMove = false
    if(checkPoint.isInZone(this.latitude, this.longitude)) {
      checkPoint.showDialogue()
    } else {
      this.marker.setRotationAngle(0)
      const icon = find('.leaflet-marker-icon')
      attr(icon, 'src', find('.explosion-js').src)
      icon.rotateZ = '(0deg)'
      setTimeout(() => {
        attr(icon, 'src', find('.fire-js').src)
      }, 1300)
    }
  }
}
