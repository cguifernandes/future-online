import clsx from "clsx";
import { InputHTMLAttributes, forwardRef } from "react";
import { Control } from "react-hook-form";
import InputNumber from "react-phone-number-input/react-hook-form-input";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	labelClassName?: string;
	control: Control<any, any>;
}

const Input = forwardRef<HTMLInputElement, Props>(
	({ label, error, placeholder, ...props }, ref) => {
		return (
			<input
				{...props}
				ref={ref}
				maxLength={15}
				placeholder="Digite o Telefone do cliente"
				className="text-white bg-black/30 text-sm px-4 rounded-lg transition-all ring-transparent py-3 ring-2 focus:ring-dark-blue-600 !bg-dark-blue-500"
			/>
		);
	},
);

const Mask = ({ label, labelClassName, control, name, error }: Props) => {
	return (
		<div className="flex flex-col gap-y-1">
			{label && (
				<label className={clsx("text-sm text-white", labelClassName)}>
					{label}
				</label>
			)}
			<InputNumber
				inputComponent={Input}
				country="BR"
				defaultCountry="BR"
				withCountryCallingCode
				control={control}
				name={name}
			/>
			{error && <span className="text-red-600 text-sm">{error}</span>}
		</div>
	);
};

export default Mask;
