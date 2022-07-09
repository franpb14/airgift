export default class Checkpoint {
  constructor(from, to, dialogue) {
    this.from = from
    this.to = to
    this.dialogue = dialogue
  }

  isInZone(lat, lng) {
    return lat <= this.from.latitude && lng >= this.from.longitude && lat >= this.to.latitude && lng <= this.to.longitude
  }

  showDialogueInZone(lat, lng) {
    if(this.isInZone(lat, lng)) {
      this.dialogue.show()
      return true
    }
    return false
  }

  showDialogue() {
    this.dialogue.show()
  }
}