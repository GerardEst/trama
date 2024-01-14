import {
  hasRequirements,
  getJoinFromProbabilities,
  getJoinRandom,
  checkErrorsInProbabilities,
} from './utilities.js'

export class Marco {
  constructor(options) {
    if (!options.guidebook) console.warn('You must pass a guidebook')
    if (!options.domPlace) console.warn('You must define a DOM element')

    this.guidebook = options.guidebook
    this.domPlace = options.domPlace
    this.character = options.character
    this.config = options.config
  }

  start() {
    this.drawNode(this.guidebook.nodes[0])

    const style = document.createElement('style');
    style.innerHTML = `

      .adventure p{
        font-size: 1rem;
        line-height: 150%;
      }
      .adventure .node{
        display: flex;
        flex-direction: column;
      }
      .adventure .node__answers{
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 3rem;
      }
      .adventure .answer{
        cursor: pointer;
        padding: 0.8rem 1rem;
        background-color: #eeeeee;
      }
      .adventure .answer:hover{

      }
      .adventure .answer--notAvailable{
        opacity: 0.2;
      }
      .adventure .answer--notAvailable--hidden{
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  alterStat(event) {
    // console.log('alter stat: ', event)
    if (!this.character.stats) {
      if (event.amount > 0) {
        this.character.stats = []
      } else {
        return
      }
    }

    let statIndex = this.character.stats.findIndex(
      (element) => element.id === event.target
    )
    let stat = this.character.stats[statIndex]

    if (stat) {
      stat.amount += parseInt(event.amount)
      if (stat.amount <= 0) this.character.stats.splice(statIndex, 1)
    } else {
      if (event.amount <= 0) return
      this.character.stats.push({
        id: event.target,
        amount: parseInt(event.amount),
      })
    }

    if (this.onAlterStat) this.onAlterStat(event)
  }

  alterCondition(event) {
    // console.log('alter condition: ', event)
    if (event.amount) {
      if (!this.character.conditions) this.character.conditions = []
    } else {
      if (!this.character.conditions) return
    }

    if (event.amount) {
      let condition = this.character.conditions.find(
        (element) => element.id === event.target
      )

      if (!condition) this.character.conditions.push({ id: event.target })
    } else {
      let condition = this.character.conditions.findIndex(
        (condition) => condition.id === event.target
      )

      this.character.conditions.splice(condition, 1)
    }

    if (this.onAlterCondition) this.onAlterCondition(event)
  }

  win(event) {
    if (this.onWin) this.onWin(event)
  }

  end(event) {
    if (this.onEnd) this.onEnd(event)
  }

  drawNode(node) {
    if (!node) {
      console.error('Nothing to draw, empty path')
      return
    }

    document.querySelector('.node')?.remove()

    /* the text can have <data> that has to be replaced */
    const textWithParams = node.text.replace(
      /<([a-zA-Z0-9]+)>/g,
      (match, p1) => this.character[p1]
    )

    let nodeLayout = document.createElement('div')
    nodeLayout.className = 'node'
    nodeLayout.id = node.id
    nodeLayout.dataset.join = node.join
    nodeLayout.innerHTML = `<div class="node__text"><p>${textWithParams}</p></div>`

    let nodeAnswers = document.createElement('div')
    nodeAnswers.className = 'node__answers'

    nodeLayout.appendChild(nodeAnswers)

    if (node.answers) {
      for (let answer of node.answers)
        nodeAnswers.appendChild(this.drawAnswer(answer))
    }

    document.querySelector(this.domPlace).appendChild(nodeLayout)

    if (this.onDrawNode) this.onDrawNode(node)
  }

  drawAnswer(answer) {
    /* the text can have <data> that has to be replaced */
    const textWithParams = answer.text.replace(
      /<([a-zA-Z0-9]+)>/g,
      (match, p1) => this.character[p1]
    )

    let answerLayout = document.createElement('div')
    answerLayout.className = 'answer'
    answerLayout.id = answer.id
    answerLayout.dataset.join = answer.join
    answerLayout.innerHTML = `<p>${textWithParams}</p>`

    // Check if answer is available based on requirements vs character stats
    let { availableAnswer, checkedRequirements } = hasRequirements(
      this.character,
      answer.requirements
    )

    // Return unavailable answer if not cumplen the requirements
    if (!availableAnswer) {
      answerLayout.classList.add(
        this.config.showLockedAnswers
          ? 'answer--notAvailable'
          : 'answer--notAvailable--hidden'
      )
      if (this.onFailedRequirements)
        this.onFailedRequirements(checkedRequirements, answer.id)
      return answerLayout
    }

    // Register every event
    if (answer.events) {
      // We must launch the alterations first, and then the ends, for answers that ends the history but also do some last modification
      const alters = answer.events.filter(event => event.action === 'alterStat' || event.action === 'alterCondition')
      const ends = answer.events.filter(event => event.action === 'win' || event.action === 'end')
      for (let event of alters) {
        answerLayout.addEventListener('click', () => this[event.action](event))
      }
      for (let event of ends) {
        answerLayout.addEventListener('click', () => this[event.action](event))
      }
    }

    // It there is no node to join, go on (the click will activate the events and journal, but will stay on the same node without updating)
    if (!answer.join) return answerLayout

    let destiny = getJoinRandom(answer.join)

    const customProbabilities = answer.join.filter((join) => join.probability)
    if (
      customProbabilities.length > 0 &&
      checkErrorsInProbabilities(customProbabilities)
    ) {
      const destinyNode = getJoinFromProbabilities(customProbabilities)
      destiny = answer.join.find((answer) => answer.node === destinyNode)
    }

    const node = this.guidebook.nodes.find((node) => node.id === destiny.node)
    answerLayout.addEventListener('click', () => this.drawNode(node))

    return answerLayout
  }

  getAllStats() {
    return this.character
  }
}
