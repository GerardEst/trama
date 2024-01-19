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
    this.player = { stats: [], conditions: [], ...options.player }
    this.config = options.config
  }

  start() {
    this.drawNode(this.guidebook.nodes[0], true)

    const style = document.createElement('style');
    style.innerHTML = `

      .adventure p{
        font-family: "Baskerville";
        font-size: 1.1rem;
        line-height: 1.9rem;
      }
      .adventure .node{
        display: flex;
        flex-direction: column;
        margin-top: 3rem;
        transition: 2s;
        opacity: 0;
      }
      .adventure .node.node--show{
        opacity: 1;
      }
      .adventure .node.node--unplayable{
        pointer-events: none;
        opacity: 0.5;
      }
      .adventure .node__answers{
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 3rem;
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
        border: 2px solid rgb(112 110 107);
        border-radius: 0.4rem;
      }
      .adventure .answer.answer--selected{
        animation: flicker 700ms;
        animation-fill-mode: forwards;
      }
      .adventure .answer:hover{
        background-color: var(--medium-gray);
      }
      .adventure .answer--notAvailable{
        opacity: 0.2;
      }
      .adventure .answer--notAvailable--hidden{
        display: none;
      }

      @keyframes flicker {
        0% {
          background-color: var(--dark-gray);
        }
        20%{
          background-color: var(--dark-gray);
        }
        21%{
          background-color: unset;
        }
        40%{
          background-color: unset;
        }
        41%{
          background-color: var(--dark-gray);
        }
        60%{
          background-color: var(--dark-gray);
        }
        61% {
          background-color: unset;
        }
        80% {
          background-color: unset;
        }
        81%{
        	background-color: var(--dark-gray);
        }
        100%{
          background-color: var(--dark-gray);
        }
      }
    `;
    document.head.appendChild(style);
  }

  alterStat(event) {
    // console.log('alter stat: ', event)
    if (!this.player.stats) {
      if (event.amount > 0) {
        this.player.stats = []
      } else {
        return
      }
    }

    let statIndex = this.player.stats.findIndex(
      (element) => element.id === event.target
    )
    let stat = this.player.stats[statIndex]

    if (stat) {
      stat.amount += parseInt(event.amount)
      if (stat.amount <= 0) this.player.stats.splice(statIndex, 1)
    } else {
      if (event.amount <= 0) return
      this.player.stats.push({
        id: event.target,
        amount: parseInt(event.amount),
      })
    }

    if (this.onAlterStat) this.onAlterStat(event)
  }

  alterCondition(event) {
    // console.log('alter condition: ', event)
    if (event.amount) {
      if (!this.player.conditions) this.player.conditions = []
    } else {
      if (!this.player.conditions) return
    }

    if (event.amount) {
      let condition = this.player.conditions.find(
        (element) => element.id === event.target
      )

      if (!condition) this.player.conditions.push({ id: event.target })
    } else {
      let condition = this.player.conditions.findIndex(
        (condition) => condition.id === event.target
      )

      this.player.conditions.splice(condition, 1)
    }

    if (this.onAlterCondition) this.onAlterCondition(event)
  }

  win(event) {
    if (this.onWin) this.onWin(event)
  }

  end(event) {
    if (this.onEnd) this.onEnd(event)
  }

  drawNode(node, first = false) {
    if (!node) {
      console.error('Nothing to draw, empty path')
      return
    }

    // TODO -> Afegir una opció per activar o desactivar això
    // document.querySelector('.node')?.remove()

    const nodes = document.querySelectorAll('.node')
    for (let node of nodes) {
      // Remove eventlisteners
      node.classList.add('node--unplayable')
    }

    /* the text can have <data> that has to be replaced */
    const textWithParams = node.text?.replace(
      /<([a-zA-Z0-9]+)>/g,
      (match, p1) => this.player[p1]
    )

    let nodeLayout = document.createElement('div')
    nodeLayout.className = 'node'
    nodeLayout.id = node.id
    nodeLayout.dataset.join = node.join
    nodeLayout.innerHTML = `<div class="node__text"><p>${textWithParams}</p></div>`

    //Animate the opacity
    let nodeAnswers = document.createElement('div')
    nodeAnswers.className = 'node__answers'

    nodeLayout.appendChild(nodeAnswers)

    if (node.answers) {
      for (let answer of node.answers)
        nodeAnswers.appendChild(this.drawAnswer(answer))
    }

    document.querySelector(this.domPlace).appendChild(nodeLayout)

    if (!first) {
      setTimeout(() => {
        nodeLayout.scrollIntoView({behavior: "smooth"});
      },1000)
    }

    setTimeout(() => {
      nodeLayout.classList.add('node--show')
    },1000)

    if (this.onDrawNode) this.onDrawNode(node)
  }

  drawAnswer(answer) {
    /* the text can have <data> that has to be replaced */
    const textWithParams = answer.text?.replace(
      /<([a-zA-Z0-9]+)>/g,
      (match, p1) => this.player[p1]
    )

    let answerLayout = document.createElement('div')
    answerLayout.className = 'answer'
    answerLayout.id = answer.id
    answerLayout.dataset.join = answer.join
    answerLayout.innerHTML = `<p>${textWithParams}</p>`

    // Check if answer is available based on requirements vs player stats
    let availableAnswer = hasRequirements(
      this.player,
      answer.requirements
    )

    // Return unavailable answer if not cumplen the requirements
    if (!availableAnswer) {
      answerLayout.classList.add(
        this.config.showLockedAnswers
          ? 'answer--notAvailable'
          : 'answer--notAvailable--hidden'
      )

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
    if (!answer.join || answer.join.length === 0) return answerLayout

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
    answerLayout.addEventListener('click', () => this.selectAnswerAnimation(answerLayout))
    answerLayout.addEventListener('click', () => this.drawNode(node))

    return answerLayout
  }

  selectAnswerAnimation(answerLayout) {
    console.log(answerLayout)
    answerLayout.classList.add('answer--selected')
  }

  getAllStats() {
    return this.player
  }
}
