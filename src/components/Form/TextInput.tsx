import { FieldValues, Path, UseFormRegister } from 'react-hook-form';

type InputProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  type?: 'tel' | 'number' | 'text';
  required?: boolean;
};

const TextInput = <T extends FieldValues>({
  label,
  register,
  name,
  type,
  required = false,
}: InputProps<T>) => (
  <div className="flex flex-col gap-2 mb-2">
    <label htmlFor={name}>{label}</label>
    <input
      type={type ?? 'text'}
      autoComplete="off"
      {...register(name, { required })}
      id={name}
      name={name}
      className="rounded-md"
    />
  </div>
);

export default TextInput;
