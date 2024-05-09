import type { InputHTMLAttributes } from "react";
import React from "react";
import { type VariantProps, tv } from "tailwind-variants";

const input = tv({
	base: "text-white bg-black/30 text-base px-4 rounded-lg transition-all ring-transparent py-3 ring-2",
	variants: {
		theme: {
			purple: "focus:ring-purple-500",
		},
	},
});

const Input = ({
	theme,
	className,
	...rest
}: InputHTMLAttributes<HTMLInputElement> & VariantProps<typeof input>) => {
	return (
		<input
			className={input({
				theme,
				className,
			})}
			{...rest}
		/>
	);
};

export default Input;
