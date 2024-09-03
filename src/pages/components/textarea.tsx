import clsx from "clsx";
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { type VariantProps, tv } from "tailwind-variants";

const textarea = tv({
	base: "text-white bg-gray-900 text-sm px-4 rounded-lg transition-all py-3 ring-transparent ring-2",
	variants: {
		theme: {
			purple: "focus:ring-purple-500",
			green: "focus:ring-green-500",
		},
	},
});

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> &
	VariantProps<typeof textarea> & {
		label?: string;
		labelClassName?: string;
		patternClassName?: string;
		error?: string;
	};

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
	(
		{
			theme,
			className,
			error,
			label,
			labelClassName,
			patternClassName,
			...rest
		},
		ref,
	) => {
		return (
			<div className={clsx("flex flex-col gap-y-1", patternClassName)}>
				{label && (
					<label className={clsx("text-sm text-white", labelClassName)}>
						{label}
					</label>
				)}
				<textarea
					ref={ref}
					className={textarea({
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

export default Textarea;
