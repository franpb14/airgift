export default class Dialogue {
  constructor(texts, npc, onfinish = null) {
    this.element = find('#dialogue')
    this.texts = texts
    this.onfinish = onfinish
    this.npc = npc
    this.timers = []
  }

  show() {
    this.writeText()
    find('#dialogue-parent').style.opacity = '1'
    find('#npc').src = find(`.${this.npc}-js`).src
    find('#npc-name').innerHTML = this.npc.charAt(0).toUpperCase() + this.npc.slice(1)
    find('#next-dialogue').onclick = () => {
      this.next()
    }
  }

  hide() {
    find('#dialogue-parent').style.opacity = '0'
  }

  next() {
    this.texts.shift()
    this.texts.length > 0 ? this.writeText() : this.onFinishAction()
  }

  writeText() {
    this.timers.forEach(timer => clearTimeout(timer))
    this.element.innerHTML = ''
    Array.from(this.texts[0]).forEach((letter, index) => {
      this.timers.push(
        setTimeout(() => {
          this.element.innerHTML += letter
        }, index * 30)
      )
    })
  }
  
  onFinishAction() {
    this.timers.forEach(timer => clearTimeout(timer))
    this.hide()
    this.onfinish()
  }
}