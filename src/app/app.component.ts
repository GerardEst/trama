import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BoardComponent } from './components/board/board.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BoardComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit {
  tree: any = {}

  ngOnInit(): void {
    this.init_tree()
  }

  init_tree() {
    if (localStorage.getItem('polo')) {
      //@ts-ignore
      const storedTree = JSON.parse(localStorage.getItem('polo'))
      this.tree = storedTree

      return
    }

    this.tree = {
      name: 'Predefined',
      nodes: [
        {
          id: 'node_0',
          text: 'Start',
          left: '100px',
          top: '100px',
        },
      ],
    }
  }
}
