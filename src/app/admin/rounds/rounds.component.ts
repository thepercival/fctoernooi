import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { StructureEditor, StructureNameService } from 'ngx-sport';
import { DefaultService } from '../../lib/ngx-sport/defaultService';
import { CSSService } from '../../shared/common/cssservice';
import { SelectableRoundNode } from './selector.component';

@Component({
  selector: 'app-tournament-select-round',
  templateUrl: './rounds.component.html',
  styleUrls: ['./rounds.component.css']
})
export class StructureSelectRoundComponent implements OnInit {
  @Input() selectableRoundNode!: SelectableRoundNode;
  @Input() first!: boolean;
  @Input() hasOwnConfig!: Function;
  @Input() structureNameService!: StructureNameService;
  @Output() checkSomeRoundsSelected = new EventEmitter<void>();
  form: UntypedFormGroup;

  constructor(
    public cssService: CSSService,
    fb: UntypedFormBuilder,
    private structureEditor: StructureEditor,
    private defaultService: DefaultService
  ) {
    this.form = fb.group({
      selected: false
    });
  }

  ngOnInit() {
    const placeRanges = this.defaultService.getPlaceRanges(this.selectableRoundNode.round.getCompetition().getSportVariants())
    this.structureEditor.setPlaceRanges(placeRanges);
    this.form.controls.selected.setValue(this.selectableRoundNode.selected);
  }

  toggleSelection() {
    this.selectableRoundNode.selected = this.form.controls.selected.value;
    this.selectableRoundNode.children = this.setSelectedChildren(this.selectableRoundNode.children, this.selectableRoundNode);
    this.emitRoundsSelected();
  }

  hasOwnConfig2(): boolean {
    return this.hasOwnConfig(this.selectableRoundNode.round);
  }

  emitRoundsSelected() {
    this.checkSomeRoundsSelected.emit();
  }

  get MinPlacesPerPoule(): number {
    return this.structureEditor.getMinPlacesPerPouleSmall();
  }

  protected setSelectedChildren(children: SelectableRoundNode[], parent: SelectableRoundNode): SelectableRoundNode[] {
    return children.map((child: SelectableRoundNode) => {
      const newChild: SelectableRoundNode = {
        parent: parent,
        round: child.round,
        selected: this.selectableRoundNode.selected,
        children: []
      };
      newChild.children = this.setSelectedChildren(child.children, newChild);
      return newChild;
    });
  }

  getCustomSwitchId() {
    return 'customSwitchId' + this.selectableRoundNode.round.getId();
  }

  save(): boolean {
    return false;
  }
}