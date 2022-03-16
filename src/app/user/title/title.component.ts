import { Component, Input } from '@angular/core';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { MyNavigation } from '../../shared/common/navigation';

@Component({
  selector: 'app-user-title',
  templateUrl: './title.component.html'
})
export class UserTitleComponent {

  @Input() title: string = '';
  @Input() icon: IconName | undefined;

  constructor(private myNavigation: MyNavigation) {
  }

  navigateBack() {
    this.myNavigation.back();
  }
}

