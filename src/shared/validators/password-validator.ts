import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
	ValidationArguments,
	ValidationOptions,
	registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidPassword', async: false })
class IsValidPasswordConstraint implements ValidatorConstraintInterface {
	validate(password: string, args: ValidationArguments): boolean {
		// Проверка минимальной длины
		if (password.length < 8) {
			return false;
		}

		// Проверка на наличие заглавной буквы
		if (!/[A-Z]/.test(password)) {
			return false;
		}

		// Проверка на наличие строчной буквы
		if (!/[a-z]/.test(password)) {
			return false;
		}

		// Проверка на наличие цифры
		if (!/[0-9]/.test(password)) {
			return false;
		}

		// Проверка на наличие специального символа
		if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
			return false;
		}

		return true;
	}

	defaultMessage(args: ValidationArguments): string {
		return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
	}
}

export function IsValidPassword(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'isValidPassword',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: IsValidPasswordConstraint,
		});
	};
}
