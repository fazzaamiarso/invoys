import { FieldValues, Path, UseFormRegister } from 'react-hook-form';

type TextAreaProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  required?: boolean;
};

const TextArea = <T extends FieldValues>({
  label,
  register,
  name,
  required = false,
}: TextAreaProps<T>) => (
  <div className="flex flex-col gap-2 mb-2">
    <label htmlFor={name} className="text-sm">
      {label}
    </label>
    <textarea
      autoComplete="off"
      {...register(name, { required })}
      id={name}
      name={name}
      className="rounded-md resize-y text-sm border-gray-400"
    />
  </div>
);

export default TextArea;
