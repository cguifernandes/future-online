import { forwardRef, useState, InputHTMLAttributes, ReactNode } from "react";
import Input from "./input";
import { Eye, EyeOff } from "lucide-react";
import { VariantProps } from "tailwind-variants";

interface Props {
	error?: string;
	label?: string;
	labelClassName?: string;
	patternClassName?: string;
	addOn?: ReactNode;
}

const PasswordInput = forwardRef<
	HTMLInputElement,
	InputHTMLAttributes<HTMLInputElement> & VariantProps<typeof Input> & Props
>(
	(
		{
			theme,
			className,
			label = "Senha",
			error,
			patternClassName,
			labelClassName,
			addOn,
			...rest
		},
		ref,
	) => {
		const [visiblePassword, setVisiblePassword] = useState(false);

		return (
			<div className="relative">
				<Input
					ref={ref}
					type={visiblePassword ? "text" : "password"}
					className={className}
					label={label}
					error={error}
					addOn={
						<button
							onClick={() => setVisiblePassword(!visiblePassword)}
							className="absolute top-1/2 right-4 mt-3 -translate-y-1/2"
							type="button"
						>
							{visiblePassword ? (
								<Eye size={18} color="#fff" />
							) : (
								<EyeOff size={18} color="#fff" />
							)}
						</button>
					}
					{...rest}
				/>
			</div>
		);
	},
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
