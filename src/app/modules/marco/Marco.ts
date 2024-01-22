import { hasRequirements, getJoinRandom } from './utilities'
import { basic_style } from './styles/basic_style'
import { initial_parameters, config, guidebook, answer_event, node, node_answer, player, condition, stat } from './interfaces'

export class Marco {
  guidebook: guidebook
  domPlace: string
  config: config
  player: player

  onAlterStat: any
  onAlterCondition: any
  onWin: any
  onEnd: any
  onDrawNode: any

  constructor(options: initial_parameters) {
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
    style.innerHTML = basic_style
    document.head.appendChild(style);
  }

  alterStat(event: answer_event) {
    const amount = parseInt(event.amount)

    let statIndex = this.player.stats?.findIndex(
      (element:stat) => element.id === event.target
    )
    let stat = statIndex && this.player.stats?.[statIndex]

    if (stat && statIndex) {
      stat.amount += amount
      if (stat.amount <= 0) this.player.stats?.splice(statIndex, 1)
    } else {
      if (amount <= 0) return
      this.player.stats?.push({
        id: event.target,
        amount: amount,
      })
    }

    if (this.onAlterStat) this.onAlterStat(event)
  }

  alterCondition(event: answer_event) {
    if (event.amount) {
      let condition = this.player.conditions?.find(
        (element:condition) => element.id === event.target
      )

      if (!condition) this.player.conditions?.push({ id: event.target })
    } else {
      let condition = this.player.conditions?.findIndex(
        (condition:condition) => condition.id === event.target
      )

      if(condition) this.player.conditions?.splice(condition, 1)
    }

    if (this.onAlterCondition) this.onAlterCondition(event)
  }

  win(event:answer_event) {
    if (this.onWin) this.onWin(event)
  }

  end(event:answer_event) {
    if (this.onEnd) this.onEnd(event)
  }

  drawNode(node:node, first = false) {
    if (!node) return console.error('Nothing to draw, empty path')

    if (this.config.view === 'book') {
      const nodes = Array.from(document.querySelectorAll('.node'));
      for (let node of nodes) {
        // TODO -> Remove eventlisteners
        node.classList.add('node--unplayable');
      }
    } else {
      const previousNode = document.querySelector('.node');
      previousNode?.classList.remove('node--show');
      setTimeout(() => {
        previousNode?.remove();
      },2000);
    }

    /* the text can have <data> that has to be replaced */
    const textWithParams = node.text?.replace(
      /<([a-zA-Z0-9]+)>/g,
      (match:string, p1:string) => this.player[p1]
    )

    let nodeLayout = document.createElement('div')
    nodeLayout.className = 'node'
    nodeLayout.id = node.id
    nodeLayout.innerHTML = `<div class="node__text"><p>${textWithParams}</p></div>`

    let nodeAnswers = document.createElement('div')
    nodeAnswers.className = 'node__answers'

    nodeLayout.appendChild(nodeAnswers)

    if (node.answers) {
      for (let answer of node.answers)
        nodeAnswers.appendChild(this.drawAnswer(answer))
    }

    document.querySelector(this.domPlace)?.appendChild(nodeLayout)

    if (this.config.view === 'book') {
      if (!first) {
        setTimeout(() => {
          nodeLayout.scrollIntoView({ behavior: "smooth" });
        }, 2000)
      }
    }

    setTimeout(() => {
      nodeLayout.classList.add('node--show')
    },2000)

    if (this.onDrawNode) this.onDrawNode(node)
  }

  drawAnswer(answer:node_answer) {
    /* the text can have <data> that has to be replaced */
    const textWithParams = answer.text?.replace(
      /<([a-zA-Z0-9]+)>/g,
      (match:string, p1:string) => this.player[p1]
    )

    let answerLayout = document.createElement('div')
    answerLayout.className = 'answer'
    answerLayout.id = answer.id
    answerLayout.dataset['join'] = answer.join
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
      const alters = answer.events.filter((event:answer_event) => event.action === 'alterStat' || event.action === 'alterCondition')
      const ends = answer.events.filter((event:answer_event) => event.action === 'win' || event.action === 'end')
      for (let event of alters) {
        //@ts-ignore
        answerLayout.addEventListener('click', () => this[event.action](event))
      }
      for (let event of ends) {
        //@ts-ignore
        answerLayout.addEventListener('click', () => this[event.action](event))
      }
    }

    // It there is no node to join, go on (the click will activate the events, but will stay on the same node without updating)
    if (!answer.join || answer.join.length === 0) return answerLayout

    let destiny = getJoinRandom(answer.join)

    const node = this.guidebook.nodes.find((node) => node.id === destiny.node)
    if (node) {
      answerLayout.addEventListener('click', () => this.selectAnswerAnimation(answerLayout))
      answerLayout.addEventListener('click', () => this.drawNode(node))
    }

    return answerLayout
  }

  selectAnswerAnimation(answerLayout:HTMLElement) {
    console.log(answerLayout)
    answerLayout.classList.add('answer--selected')
  }

  getAllStats() {
    return this.player
  }
}
