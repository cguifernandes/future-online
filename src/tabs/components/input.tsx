import type { InputHTMLAttributes } from "react";
import React from "react";
import { type VariantProps, tv } from "tailwind-variants";

const input = tv({
	base: "text-white bg-black/30 text-sm px-4 rounded-lg transition-all ring-transparent py-3 ring-2",
	variants: {
		theme: {
			purple: "focus:ring-purple-500",
			green: "focus:ring-green-500",
		},
	},
});

const Input = React.forwardRef<
	HTMLInputElement,
	InputHTMLAttributes<HTMLInputElement> & VariantProps<typeof input>
>(({ theme, className, ...rest }, ref) => {
	return (
		<input
			ref={ref}
			className={input({
				theme,
				className,
			})}
			{...rest}
		/>
	);
});

export default Input;
