import type { TextareaHTMLAttributes } from "react";
import React from "react";
import { type VariantProps, tv } from "tailwind-variants";

const textarea = tv({
	base: "text-white bg-black/30 text-sm px-4 rounded-lg transition-all py-3 ring-transparent ring-2",
	variants: {
		theme: {
			purple: "focus:ring-purple-500",
			green: "focus:ring-green-500",
		},
	},
});

const Textarea = React.forwardRef<
	HTMLTextAreaElement,
	TextareaHTMLAttributes<HTMLTextAreaElement> & VariantProps<typeof textarea>
>(({ theme, className, ...rest }, ref) => {
	return (
		<textarea
			ref={ref}
			className={textarea({
				theme,
				className,
			})}
			{...rest}
		/>
	);
});

export default Textarea;
