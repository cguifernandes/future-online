import clsx from "clsx";
import React from "react";
import { useController, type UseControllerProps } from "react-hook-form";

interface Props extends Partial<UseControllerProps> {
	label?: string;
	className?: string;
}

const Switch = ({ label, className, control, name, defaultValue }: Props) => {
	let fieldProps = {};

	if (control && name) {
		const { field } = useController({ name, control, defaultValue });
		fieldProps = { ...field, checked: field.value };
	}

	return (
		<label
			className={clsx(
				"inline-flex gap-x-2 items-center cursor-pointer",
				className,
			)}
		>
			<input type="checkbox" className="sr-only peer" {...fieldProps} />
			<div
				className={clsx(
					"relative w-11 h-6 min-w-[44px] bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full",
					"rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px]",
					"after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600",
				)}
			/>
			{label && <span className="text-white">{label}</span>}
		</label>
	);
};

export default Switch;
