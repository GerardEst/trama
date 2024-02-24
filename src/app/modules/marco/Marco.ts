import { playerHasAnswerRequirements, getJoinRandom, normalizeLink, capitalize } from './utilities'
import { basic_style } from './styles/basic_style'
import { initial_parameters, config, guidebook, answer_event, node, node_answer, player, condition, stat, join, externalEvent, link } from './interfaces'

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

    console.log("guidebook(story):", this.guidebook)
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
      if (!node.conditions) return console.warn('Distributor node with no conditions')
      for (let distributorCondition of node.conditions) {
        const distributorConditionType = distributorCondition.ref.split('_')[0]
        if (distributorConditionType === 'stat') {
          // If it's a stat, we find this stat in the player object
          const playerStat = this.player.stats.find(stat => stat.id === distributorCondition.ref)
          // If the player doesn't have the stat, the amount is 0
          const playerStatAmount = playerStat ? playerStat.amount : 0
          // Then we check the comparator, if it's correct we can go to next node
          if ((distributorCondition.comparator === 'equalto' && playerStatAmount === parseInt(distributorCondition.value))
            || (distributorCondition.comparator === 'lessthan' && playerStatAmount < parseInt(distributorCondition.value))
            || (distributorCondition.comparator === 'morethan' && playerStatAmount > parseInt(distributorCondition.value))) {
              const destiniyNode = this.findAnswerDestinationNode(distributorCondition.join)
              if (destiniyNode) return this.decideNode(destiniyNode)
          }
        }
        if (distributorConditionType === 'condition') {
          // If it's a condition, we find this condition in the player object
          const playerCondition = this.player.conditions.find(condition => condition.id === distributorCondition.ref)
          // We check the comparator
          // If the player has the condition and the requirement is 1, we can go to next node
          // If the player doesn't have the condition and the requirement is 0, we can go to next node too
          if ((parseInt(distributorCondition.value) === 1 && playerCondition)
            || (parseInt(distributorCondition.value) === 0 && !playerCondition)) {
              const destiniyNode = this.findAnswerDestinationNode(distributorCondition.join)
              if (destiniyNode) return this.decideNode(destiniyNode)
          }
        }
      }

      // If reached this point, no condition was met, we use the fallback condition
      if (!node.fallbackCondition) return console.warn('Distributor node with no fallback condition')
      if (node.fallbackCondition.join) {
        console.log("Using fallback join")
        const destiniyNode = this.findAnswerDestinationNode(node.fallbackCondition.join)
        if (destiniyNode) return this.decideNode(destiniyNode)
      }

      console.warn("No join possible")
      return
    }
  }

  private drawNode(node: node, isTheFirstNode = false) {
    if (!node) return console.warn('Nothing to draw, empty path')

    if (this.config.cumulativeView) {
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
  private createDOMNode(node: node) {

    const DOMNode = document.createElement('div')
    DOMNode.className = 'node'
    DOMNode.id = node.id
    const DOMNodeText = document.createElement('div')
    DOMNodeText.className = "node__text"
    const DOMText = document.createElement('p')
    DOMText.textContent = node.text ? this.getTextWithFinalParameters(node.text) : ''
    DOMNodeText.appendChild(DOMText)
    DOMNode.appendChild(DOMNodeText)

    const DOMAnswers = document.createElement('div')
    DOMAnswers.className = 'node__answers'

    if (node.answers) {
      for (let answer of node.answers) DOMAnswers.appendChild(this.drawAnswer(answer))
      DOMNode.appendChild(DOMAnswers)
    }
    if (node.links) {
      for (let link of node.links) DOMAnswers.appendChild(this.createDOMLink(link))
      DOMNode.appendChild(DOMAnswers)
    }

    if (node.type === 'end' && this.config.sharing) {
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
    button.textContent = 'Compartir el resultat';
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
    const withInlineReplacements = text.replace(
      /#([a-zA-Z0-9_]+)/g,
      (match: string, p1: string) => {
        // if the prop is not in player, we search in stats
        let value = this.player[p1]
        if (!value) {
          value = this.player.stats.find(stat => stat.id === p1)?.amount
        }
        return value || '-'
      }
    )

    const withBlockReplacements = withInlineReplacements.replace(
      /\[([a-zA-Z0-9_]+)\]/g,
      (match: string, p1: string) => {
        let refsWithCategory = Object.keys(this.guidebook.refs).filter((key: any) => {
          return this.guidebook.refs[key].category === p1
        })

        let string = ' '
        for (let refWithCategory of refsWithCategory) {
          const playerStat = this.player.stats.find(stat => stat.id === refWithCategory)
          if (playerStat) {
            string = string + '\n' + capitalize(this.guidebook.refs[playerStat.id].name) + ': ' + playerStat.amount
          }
        }
        for (let refWithCategory of refsWithCategory) {
          const playerCondition = this.player.conditions.find(condition => condition.id === refWithCategory)
          if (playerCondition) {
            string = string + '\n' + capitalize(this.guidebook.refs[playerCondition.id].name)
          }
        }

        return string
      })

    return withBlockReplacements
  }

  private createDOMAnswer(id: string, text: string) {
    const DOMAnswer = document.createElement('div')
    const DOMText = document.createElement('p')
    DOMAnswer.className = 'answer'
    DOMAnswer.id = id
    DOMText.textContent = text
    DOMAnswer.appendChild(DOMText)

    return DOMAnswer
  }

  private createDOMLink(link: link) {
    const DOMLink = document.createElement('a')
    DOMLink.className = 'answer'
    DOMLink.target = '_blank'
    DOMLink.href = normalizeLink(link.url)
    DOMLink.textContent = link.name

    return DOMLink
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

  private findAnswerDestinationNode(answerJoin: any) {
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
