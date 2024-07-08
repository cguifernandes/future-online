import clsx from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";
import { type VariantProps, tv } from "tailwind-variants";

const input = tv({
	base: "text-white bg-black/30 text-sm px-4 rounded-lg transition-all ring-transparent py-3 ring-2",
	variants: {
		theme: {
			purple: "focus:ring-purple-500",
			green: "focus:ring-green-500",
			yellow: "focus:ring-yellow-500",
			orange: "focus:ring-orange-500",
			blue: "focus:ring-blue-500",
			"dark-blue": "focus:ring-dark-blue-600 !bg-dark-blue-500",
		},
	},
});

interface Props {
	error?: string;
	label?: string;
	labelClassName?: string;
	patternClassName?: string;
}

const Input = forwardRef<
	HTMLInputElement,
	InputHTMLAttributes<HTMLInputElement> & VariantProps<typeof input> & Props
>(
	(
		{
			theme,
			className,
			label,
			error,
			patternClassName,
			labelClassName,
			...rest
		},
		ref,
	) => {
		return (
			<div
				className={clsx("flex flex-col", label && "gap-y-1", patternClassName)}
			>
				{label && (
					<label className={clsx("text-sm text-white", labelClassName)}>
						{label}
					</label>
				)}
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
	},
);

export default Input;
