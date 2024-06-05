import type { InputHTMLAttributes } from "react";
import React from "react";
import { type VariantProps, tv } from "tailwind-variants";

const input = tv({
	base: "text-white bg-black/30 text-sm px-4 rounded-lg transition-all ring-transparent py-3 ring-2",
	variants: {
		theme: {
			purple: "focus:ring-purple-500",
			green: "focus:ring-green-500",
			yellow: "focus:ring-yellow-500",
			orange: "focus:ring-orange-500",
		},
	},
});

const Input = React.forwardRef<
	HTMLInputElement,
	InputHTMLAttributes<HTMLInputElement> &
		VariantProps<typeof input> & { error?: string }
>(({ theme, className, error, ...rest }, ref) => {
	if (error) {
		return (
			<div className="flex flex-col gap-y-2">
				<input
					ref={ref}
					className={input({
						theme,
						className,
					})}
					{...rest}
				/>
				{error && <span className="text-red-600 text-sm">{error}</span>}
			</div>
		);
	}

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
