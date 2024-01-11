export class Journal {
  data: Array<any> = []

  constructor() {
    this.data = []
  }

  registerJournal(event) {
    this.data.push(event)
  }
}
