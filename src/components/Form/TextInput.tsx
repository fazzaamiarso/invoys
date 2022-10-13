import { FieldValues, Path, UseFormRegister } from 'react-hook-form';

type InputProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  type?: 'tel' | 'number' | 'text' | 'date';
  required?: boolean;
};

const TextInput = <T extends FieldValues>({
  label,
  register,
  name,
  type,
  required = true,
}: InputProps<T>) => (
  <div className="flex flex-col gap-2 mb-2 w-full">
    <label htmlFor={name} className="text-sm text-gray-500 font-semibold">
      {label}
    </label>
    <input
      type={type ?? 'text'}
      autoComplete="off"
      {...register(name, { required })}
      id={name}
      name={name}
      className="rounded-sm text-sm text-gray-700 border-gray-300"
    />
  </div>
);

export default TextInput;
