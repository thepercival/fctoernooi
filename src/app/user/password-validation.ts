import { AbstractControl } from '@angular/forms';

export class PasswordValidation {

    static MatchPassword(AC: AbstractControl) {
        const passwordField = AC.get('password');
        const confirmPasswordField = AC.get('passwordRepeat');
        if (passwordField !== null && confirmPasswordField !== null && passwordField.value !== confirmPasswordField.value) {
            AC.get('passwordRepeat').setErrors({ MatchPassword: true });
        }
    }
}
