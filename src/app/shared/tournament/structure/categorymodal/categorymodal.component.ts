import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Category, VoetbalRange } from 'ngx-sport';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CategoryProperties } from '../../../../admin/structure/edit.component';
import { CategoryUniqueChecker } from '../../../../lib/ngx-sport/category/uniqueChecker';

@Component({
    selector: 'app-ngbd-modal-category',
    templateUrl: './categorymodal.component.html',
    styleUrls: ['./categorymodal.component.scss']
})
export class CategoryModalComponent implements OnInit {
    @Input() categories: Category[] = [];
    @Input() category: Category|undefined;
    @Input() buttonLabel!: string;
    form: FormGroup;    
    
    public nameRange: VoetbalRange = { min: 3, max: 15 };

    constructor(public activeModal: NgbActiveModal) {
        this.form = new FormGroup({
            name: new FormControl(''),
            abbreviation: new FormControl('')
        });
    }

    getPlaceHolder(): string {
        return 'Jongens 7/8';
    }

    getAbbreviationPlaceHolder(): string {
        return 'J';
    }

    ngOnInit() {
        this.form.get('name')?.setValidators(
            Validators.compose([
                Validators.required,
                Validators.minLength(this.nameRange.min),
                Validators.maxLength(this.nameRange.max)
            ]));
        this.form.get('abbreviation')?.setValidators(
            Validators.compose([
                Validators.required,
                Validators.minLength(0),
                Validators.maxLength(2)
            ]));
        if (this.category) {
            this.form.controls.name.setValue(this.category.getName());
            this.form.controls.abbreviation.setValue(this.category.getAbbreviation());
        }
        this.onNameChange();
    }

    getUpdateAction(): CategoryProperties {
        return {
            newName: this.form.controls.name.value,
            newAbbreviation: this.form.controls.abbreviation.value
        }
    }

    onNameChange(): void {
        this.form.controls.name.valueChanges.subscribe((val: string) => {
            if( this.form.controls.abbreviation.value.length > 0 ) {
                return;
            }
            this.form.controls.abbreviation.setValue(val.substring(0,1));
        });
    }

    sameAbbreviationExists(): boolean {
        return (new CategoryUniqueChecker()).doesAbbreviationExists(
            this.categories, 
            this.form.controls.abbreviation.value,
            this.category);
    }
}
