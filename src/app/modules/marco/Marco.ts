import { playerHasAnswerRequirements, getJoinRandom } from './utilities'
import { basic_style } from './styles/basic_style'
import { initial_parameters, config, guidebook, answer_event, node, node_answer, player, condition, stat, join, externalEvent } from './interfaces'

export class Marco {
  guidebook: guidebook
  domPlace: string
  config: config
  player: player
  timings: number
  externalEvents: Array<externalEvent>

  onAlterStat: ((event: answer_event) => void) | undefined
  onAlterCondition: ((event: answer_event) => void) | undefined
  onEnd: (() => void) | undefined
  onDrawNode: ((node: node) => void) | undefined
  onSelectAnswer: ((answer: node_answer) => void) | undefined
  onExternalEvent: ((externalEvent: externalEvent) => void) | undefined

  DOMNodes: Array<HTMLElement> = []

  constructor(options: initial_parameters) {
    if (!options.guidebook) console.warn('You must pass a guidebook')
    if (!options.domPlace) console.warn('You must define a DOM element')

    this.guidebook = options.guidebook
    this.domPlace = options.domPlace
    this.player = { stats: [], conditions: [], ...options.player }
    this.config = options.config

    this.externalEvents = []
    // move this to config when ready
    this.timings = 1000
  }

  public start() {
    this.appendGlobalStyle()
    this.drawNode(this.guidebook.nodes[0], true)
  }

  private appendGlobalStyle() {
    const style = document.createElement('style');
    style.innerHTML = basic_style(this.timings)
    document.head.appendChild(style);
  }

  private decideNode(node: node, isTheFirstNode = false) {
    if (node.type === 'distributor') {
      this.distributeNode(node)
      return
    }
    this.drawNode(node, isTheFirstNode)
  }

  private distributeNode(node: node) {
    if (node.type === 'distributor') {
      console.log('distribute!', node)
      if(!node.conditions) return console.warn('Distributor node with no conditions')
      for (let distributorCondition of node.conditions) {
        const stat = this.player.stats.find(stat => stat.id === distributorCondition.ref)
        console.log(stat)
        if (stat) {
          if (distributorCondition.comparator === 'equalto') {
            if (parseInt(distributorCondition.value) === stat.amount) {
              const destiniyNode = this.findAnswerDestinationNode(distributorCondition.join)
              if (destiniyNode) this.decideNode(destiniyNode)
              break
            }
          }
          if (distributorCondition.comparator === 'lessthan') {
            if (stat.amount < parseInt(distributorCondition.value)) {
              const destiniyNode = this.findAnswerDestinationNode(distributorCondition.join)
              if (destiniyNode) this.decideNode(destiniyNode)
              break
            }
          }
          if (distributorCondition.comparator === 'morethan') {
            if (stat.amount > parseInt(distributorCondition.value)) {
              const destiniyNode = this.findAnswerDestinationNode(distributorCondition.join)
              if (destiniyNode) this.decideNode(destiniyNode)
              break
            }
          }
        }
        const condition = this.player.conditions.find(condition => condition.id === distributorCondition.ref)
        if (condition) {
          if (parseInt(distributorCondition.value) === 1) {
            const destiniyNode = this.findAnswerDestinationNode(distributorCondition.join)
            if (destiniyNode) this.decideNode(destiniyNode)
            break
          }
        } else {
          if (parseInt(distributorCondition.value) === 0) {
            const destiniyNode = this.findAnswerDestinationNode(distributorCondition.join)
            if (destiniyNode) this.decideNode(destiniyNode)
            break
          }
        }
      }
      return
    }
  }

  private drawNode(node: node, isTheFirstNode = false) {
    if (!node) return console.warn('Nothing to draw, empty path')

    if (this.config.view === 'book') {
      this.blockExistentDOMNodes()
    } else {
      const lastNode = this.DOMNodes.at(-1)
      this.fadeOutNode(lastNode, this.timings)
    }

    let nodeLayout = this.createDOMNode(node)
    this.DOMNodes.push(nodeLayout)
    this.addNodeToDOM(nodeLayout)
    this.centerNodeToView(nodeLayout, isTheFirstNode, this.timings)
    this.fadeInNodeAfterMiliseconds(nodeLayout,isTheFirstNode ? 0 : this.timings)

    if (this.onDrawNode) this.onDrawNode(node)
    if (this.onEnd && node.type === 'end') this.onEnd()
  }

  private drawAnswer(answer: node_answer) {

    const answerLayout = this.createDOMAnswer(answer.id, answer.text ? this.getTextWithFinalParameters(answer.text) : '')
    const answerIsAvailable = playerHasAnswerRequirements(this.player, answer.requirements)

    if (!answerIsAvailable) {
      this.hideUnavailableAnswer(answerLayout)
      return answerLayout
    }

    this.registerAnswerEvents(answer.events, answerLayout)
    const destiniyNode = this.findAnswerDestinationNode(answer.join)

    if (destiniyNode) {
      answerLayout.addEventListener('click', () => this.selectAnswerAnimation(answerLayout))
      answerLayout.addEventListener('click', () => this.decideNode(destiniyNode))
      answerLayout.addEventListener('click', () => {
        if (this.onSelectAnswer) this.onSelectAnswer(answer)
      })
    }
    return answerLayout
  }

  private blockExistentDOMNodes() {
      for (let node of this.DOMNodes) {
        // TODO -> Remove eventlisteners
        node.classList.add('node--unplayable');
      }
  }

  private centerNodeToView(nodeElement: HTMLElement, isTheFirstNode: boolean, timing:number) {
    if (!isTheFirstNode) {
      setTimeout(() => {
        nodeElement.scrollIntoView({ behavior: "smooth" });
      }, timing)
    }
  }

  // Create all the node, calls the creation of answers of node too
  private createDOMNode(node:node) {
    node.id, node.text ? this.getTextWithFinalParameters(node.text) : '', node.answers, node.type

    let DOMNode = document.createElement('div')
    DOMNode.className = 'node'
    DOMNode.id = node.id
    DOMNode.innerHTML = `<div class="node__text"><p>${node.text}</p></div>`

    let DOMAnswers = document.createElement('div')
    DOMAnswers.className = 'node__answers'

    if (node.answers) {
      for (let answer of node.answers) DOMAnswers.appendChild(this.drawAnswer(answer))
      DOMNode.appendChild(DOMAnswers)
    }

    if (node.type === 'end') {
      let shares = this.crateDOMShares(node)
      DOMNode.appendChild(shares)
    }

    return DOMNode
  }

  private crateDOMShares(node:node) {
    let shares = document.createElement('div')
    shares.className = 'shares'

    const message = node.share?.sharedText && node.share.sharedText.length > 0 ?
      `${this.config.title}\n\n${node.share.sharedText}\n\n` :
      `${this.config.title}\n\n${node.text}\n\n`


    let button = document.createElement('button');
    button.innerHTML = 'Compartir el resultat';
    button.onclick = function () {
      console.log('waiting share context')
        if (navigator.share) {
            navigator.share({
              text: message,
              url: window.location.href,
            })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
        } else {
            console.log('Web Share API is not supported in your browser.');
        }
    };

    shares.appendChild(button);

    return shares
  }

  private addNodeToDOM(node: HTMLElement) {
    document.querySelector(this.domPlace)?.appendChild(node)
  }

  private fadeInNodeAfterMiliseconds(node: HTMLElement, timing: number) {
    setTimeout(() => {
      node.classList.add('node--show')
    }, timing)
  }

  private fadeOutNode(node: HTMLElement | undefined, timing: number) {
    if (!node) return

    node.classList.remove('node--show');
    setTimeout(() => {
      node.remove();
    }, timing);
  }

  private getTextWithFinalParameters(text: string) {
    // the text can have <data> that has to be replaced
    return text.replace(
      /<([a-zA-Z0-9]+)>/g,
      (match:string, p1:string) => this.player[p1]
    )
  }

  private createDOMAnswer(id: string, text: string) {
    const DOMAnswer = document.createElement('div')
    DOMAnswer.className = 'answer'
    DOMAnswer.id = id
    DOMAnswer.innerHTML = `<p>${text}</p>`

    return DOMAnswer
  }

  private hideUnavailableAnswer(answer: HTMLElement) {
    answer.classList.add(
        this.config.showLockedAnswers
          ? 'answer--notAvailable'
          : 'answer--notAvailable--hidden'
      )
  }

  private registerAnswerEvents(answerEvents: Array<answer_event> = [], DOMAnswer: HTMLElement) {
      const alters = answerEvents.filter((event:answer_event) => event.action === 'alterStat' || event.action === 'alterCondition')
      for (let event of alters) {
        DOMAnswer.addEventListener('click', () => this[event.action](event))
      }
  }

  private findAnswerDestinationNode(answerJoin: Array<join>) {
    if (!answerJoin || answerJoin.length === 0) return undefined

    const destiny = getJoinRandom(answerJoin)
    const node = this.guidebook.nodes.find((node) => node.id === destiny.node)

    return node
  }

  private selectAnswerAnimation(answerLayout:HTMLElement) {
    answerLayout.classList.add('answer--selected')
  }

  // Events
  private alterStat(event: answer_event) {
    const amount = parseInt(event.amount)

    let statIndex = this.player.stats?.findIndex(
      (element: stat) => element.id === event.target
    )
    let stat = this.player.stats?.[statIndex]

    if (stat) {
      stat.amount += amount
      if (stat.amount <= 0) this.player.stats?.splice(statIndex, 1)
    } else {
      if (amount <= 0) return
      this.player.stats?.push({
        id: event.target,
        amount,
      })
    }

    if (this.onAlterStat) this.onAlterStat(event)
  }

  private alterCondition(event: answer_event) {
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

  // Public methods to use with Marco instance
  public getAllStats() {
    return this.player
  }
}
