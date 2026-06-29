import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, IconName } from '@fortawesome/fontawesome-svg-core';
import { MyNavigation } from '../../shared/common/navigation';

@Component({
    selector: 'app-user-title',
    templateUrl: './title.component.html',
    standalone: true,
    imports: [FontAwesomeModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserTitleComponent {
  readonly title = input('');
  readonly icon = input.required<IconDefinition>();

  constructor(private myNavigation: MyNavigation) {
  }

  navigateBack() {
    this.myNavigation.back();
  }
}

