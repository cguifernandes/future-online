import type { ButtonHTMLAttributes, ChangeEvent, ReactNode } from "react";
import { type VariantProps, tv } from "tailwind-variants";
import Switch from "./switch";

const button = tv({
	base: "text-white text-base px-4 rounded-lg transition-all py-3",
	variants: {
		theme: {
			"purple-dark": "bg-purple-900/90",
			"purple-light": "bg-purple-500",
			"green-dark": "bg-green-800/90",
			"green-light": "bg-green-500",
			"yellow-dark": "bg-yellow-800/90",
			"yellow-light": "bg-yellow-500",
			"orange-dark": "bg-orange-700/90",
			"orange-light": "bg-orange-500",
			"blue-dark": "bg-blue-800/90",
			"blue-light": "bg-blue-500",
			danger: "bg-red-600 hover:bg-red-700",
			solid: "bg-aqua-100 hover:bg-aqua-200",
		},
	},
});

interface Props
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof button> {
	children: ReactNode;
	icon?: ReactNode;
	isLoading?: boolean;
	inputSwitch?: boolean;
	onSwitchChange?: (event: ChangeEvent<HTMLInputElement>) => void;
	switchDefaultValue?: boolean;
}

const Button = ({
	children,
	icon,
	theme,
	className,
	isLoading,
	onSwitchChange,
	inputSwitch,
	switchDefaultValue,
	...rest
}: Props) => {
	if (inputSwitch) {
		return (
			<div className="relative w-full flex items-center">
				<button
					disabled={isLoading}
					className={button({
						theme,
						className: `${className} w-full`,
					})}
					{...rest}
				>
					{isLoading && "Carregando..."}
					{icon}
					{children}
				</button>
				<Switch
					defaultChecked={switchDefaultValue}
					onChange={onSwitchChange}
					className="absolute right-4 top-1/2 -translate-y-1/2"
				/>
			</div>
		);
	}

	if (icon) {
		return (
			<button
				className={button({
					theme,
					className: `${className} flex items-center justify-center gap-x-3`,
				})}
				{...rest}
			>
				{isLoading && "Carregando..."}
				{icon}
				{children}
			</button>
		);
	}

	return (
		<button
			className={button({
				theme,
				className: `truncate ${className}`,
			})}
			{...rest}
		>
			{isLoading ? "Carregando..." : children}
		</button>
	);
};

export default Button;
