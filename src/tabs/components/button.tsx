import type { ButtonHTMLAttributes, ReactNode } from "react";
import React from "react";
import { type VariantProps, tv } from "tailwind-variants";

const button = tv({
	base: "text-white text-base px-4 rounded-lg transition-all py-3",
	variants: {
		theme: {
			"purple-dark": "bg-purple-900/90",
			"purple-light": "bg-purple-500",
			"green-dark": "bg-green-800/90",
			"green-light": "bg-green-500",
			danger: "bg-red-600 hover:bg-red-700",
		},
	},
});

interface Props
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof button> {
	children: ReactNode;
	icon?: ReactNode;
}

const Button = ({ children, icon, theme, className, ...rest }: Props) => {
	if (icon) {
		return (
			<button
				className={button({
					theme,
					className: `${className} flex items-center justify-center gap-x-3`,
				})}
				{...rest}
			>
				{icon}
				{children}
			</button>
		);
	}

	return (
		<button
			className={button({
				theme,
				className,
			})}
			{...rest}
		>
			{children}
		</button>
	);
};

export default Button;
