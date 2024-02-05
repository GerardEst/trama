import { Component } from '@angular/core'
import { NodeComponent } from '../node/node.component'

@Component({
  selector: 'polo-node-distributor',
  standalone: true,
  imports: [],
  templateUrl: './node-distributor.component.html',
  styleUrl: './node-distributor.component.sass',
})
export class NodeDistributorComponent extends NodeComponent {
  conditions?: Array<any>
}
