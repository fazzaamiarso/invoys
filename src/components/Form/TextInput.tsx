import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { ErrorMessage } from '@hookform/error-message';
import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from 'react-hook-form';

type InputProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  type?: 'tel' | 'number' | 'text' | 'date';
  required?: boolean;
  disabled?: boolean;
  errors?: FieldErrors;
};

const TextInput = <T extends FieldValues>({
  label,
  register,
  name,
  type,
  required = true,
  disabled,
  errors,
}: InputProps<T>) => (
  <div className="flex flex-col gap-2 mb-2 w-full">
    <label htmlFor={name} className="text-sm text-gray-500 font-semibold">
      {label}
    </label>
    <input
      type={type ?? 'text'}
      autoComplete="off"
      {...register(name, {
        required: required ? 'required' : false,
        disabled,
      })}
      id={name}
      name={name}
      className="rounded-sm text-sm text-gray-700 border-gray-300 w-full"
    />
    {errors && (
      <ErrorMessage
        name={name}
        errors={errors}
        render={error => (
          <p className="text-sm text-red-400 flex items-center gap-1">
            <ExclamationCircleIcon className="aspect-square h-4" />
            <span className="text-xs">{error.message}</span>
          </p>
        )}
      />
    )}
  </div>
);

export default TextInput;
