import type { TextareaHTMLAttributes } from "react";
import React from "react";
import { type VariantProps, tv } from "tailwind-variants";

const textarea = tv({
	base: "text-white bg-black/30 text-base px-4 rounded-lg transition-all py-3 ring-transparent ring-2",
	variants: {
		theme: {
			purple: "focus:ring-purple-500",
		},
	},
});

const Textarea = ({
	theme,
	className,
	...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> &
	VariantProps<typeof textarea>) => {
	return (
		<textarea
			className={textarea({
				theme,
				className,
			})}
			{...rest}
		/>
	);
};

export default Textarea;
