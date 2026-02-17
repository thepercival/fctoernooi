import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { MyNavigation } from '../../shared/common/navigation';

@Component({
    selector: 'app-user-title',
    templateUrl: './title.component.html',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserTitleComponent {
  readonly title = input('');
  readonly icon = input<IconName | undefined>(undefined);

  constructor(private myNavigation: MyNavigation) {
  }

  navigateBack() {
    this.myNavigation.back();
  }
}

