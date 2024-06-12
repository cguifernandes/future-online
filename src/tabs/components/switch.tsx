import clsx from "clsx";
import React, { useEffect, useState, type ChangeEvent } from "react";
import { useController, type UseControllerProps } from "react-hook-form";

interface Props extends Partial<UseControllerProps> {
	label?: string;
	className?: string;
	onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
	defaultChecked?: boolean;
}

const Switch = ({
	label,
	className,
	onChange,
	control,
	name,
	defaultChecked,
}: Props) => {
	const [checked, setChecked] = useState(defaultChecked || false);

	useEffect(() => {
		if (defaultChecked !== undefined) {
			setChecked(defaultChecked);
		}
	}, [defaultChecked]);

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setChecked(event.target.checked);
		if (onChange) {
			onChange(event);
		}
	};

	let fieldProps = {};

	if (control && name) {
		const { field } = useController({
			name,
			control,
			defaultValue: defaultChecked,
		});
		fieldProps = {
			...field,
			checked: field.value,
			onChange: (event: ChangeEvent<HTMLInputElement>) => {
				field.onChange(event);
				handleChange(event);
			},
		};
	} else {
		fieldProps = { checked, onChange: handleChange };
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
			<span className="text-white">{label}</span>
		</label>
	);
};

export default Switch;
