import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StructureNameService } from 'ngx-sport';
import { CSSService } from '../../shared/common/cssservice';
import { ToggleRound } from './selector.component';

@Component({
  selector: 'app-tournament-select-round',
  templateUrl: './rounds.component.html',
  styleUrls: ['./rounds.component.css']
})
export class StructureSelectRoundComponent implements OnInit {
  @Input() toggleRound!: ToggleRound;
  @Input() first!: boolean;
  @Input() hasOwnConfig!: Function;
  @Output() checkRoundsSelected = new EventEmitter<void>();
  form: FormGroup;
  @Input() structureNameService!: StructureNameService;

  constructor(public cssService: CSSService, fb: FormBuilder
  ) {
    this.form = fb.group({
      selected: false
    });
  }

  ngOnInit() {
    this.form.controls.selected.setValue(this.toggleRound.selected);
  }

  toggleSelection() {
    this.toggleRound.selected = this.form.controls.selected.value;
    this.toggleRound.children = this.setSelectedChildren(this.toggleRound.children, this.toggleRound);
    this.emitRoundsSelected();
  }

  hasOwnConfig2(): boolean {
    return this.hasOwnConfig(this.toggleRound.round);
  }

  emitRoundsSelected() {
    this.checkRoundsSelected.emit();
  }

  protected setSelectedChildren(children: ToggleRound[], parent: ToggleRound): ToggleRound[] {
    return children.map((child: ToggleRound) => {
      const newChild: ToggleRound = {
        parent: parent,
        round: child.round,
        selected: this.toggleRound.selected,
        children: []
      };
      newChild.children = this.setSelectedChildren(child.children, newChild);
      return newChild;
    });
  }

  getCustomSwitchId() {
    return 'customSwitchId' + this.toggleRound.round.getId();
  }

  save(): boolean {
    return false;
  }
}