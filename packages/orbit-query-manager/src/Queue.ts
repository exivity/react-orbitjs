class Queue {
  _afterQueryQueue: Function[]

  addTask (task: Function) {
    this._afterQueryQueue.push(task)
  }

  runTasks () {
    while (this._afterQueryQueue.length > 0) {
      const task = this._afterQueryQueue.pop()
      task()
    }
  }
}