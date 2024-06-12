// biome-ignore lint/style/useImportType: <explanation>
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { UseFormSetValue } from "react-hook-form";
import { type VariantProps, tv } from "tailwind-variants";
import clsx from "clsx";

const select = tv({
	variants: {
		size: {
			base: "text-base",
			small: "text-sm",
			lg: "text-lg",
			xl: "text-xl",
		},
	},
});

interface Props extends VariantProps<typeof select> {
	options: {
		title: string;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		[key: string]: any;
	}[];
	label?: string;
	setVisibleDropdown?: React.Dispatch<React.SetStateAction<boolean>>;
	visibleDropdown?: boolean;
	error?: string;
	isLoading?: boolean;
	name?: string;
	defaultValue?: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	setValue?: UseFormSetValue<any>;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	handleOnClick?: (option: any) => void;
	className?: string;
	zIndex?: number;
}

const Select = ({
	options,
	label,
	setVisibleDropdown,
	visibleDropdown,
	name,
	setValue,
	error,
	isLoading,
	defaultValue,
	className,
	handleOnClick,
	zIndex = 40,
	size = "base",
}: Props) => {
	const [selectedValue, setSelectedValue] = useState(defaultValue ?? "");
	const [localVisibleDropdown, setLocalVisibleDropdown] = useState(false);
	const sizeClass = select({ size });

	return (
		<>
			<div className={clsx("relative flex flex-col gap-y-2", className)}>
				{label && (
					<label className={clsx("text-white", sizeClass)}>{label}</label>
				)}
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<div
					onClick={() => {
						if (setVisibleDropdown) {
							setVisibleDropdown(true);
						}

						setLocalVisibleDropdown(!localVisibleDropdown);
					}}
					className="relative flex items-center text-sm justify-between h-11 bg-black/30 rounded-lg"
				>
					<input
						placeholder="Selecione um item"
						readOnly
						className={clsx(
							"w-full text-white cursor-pointer bg-transparent",
							size === "small" && "px-3 py-2",
							size === "lg" && "px-5 py-4",
							size === "xl" && "px-6 py-5",
							size === "base" && "px-4 py-3",
						)}
						value={selectedValue}
					/>
					<ChevronDown
						className={clsx(
							"absolute top-1/2 -translate-y-1/2",
							size === "small" && "right-3",
							size === "lg" && "right-5",
							size === "xl" && "right-6",
							size === "base" && "right-4",
						)}
						size={24}
						color="#fff"
					/>
				</div>
				{(visibleDropdown || localVisibleDropdown) && (
					<ul
						style={{ zIndex }}
						className="absolute max-h-60 overflow-y-auto top-full flex flex-col gap-y-2 mt-2 w-full p-3 select-none rounded-lg bg-[#353535] shadow-md"
					>
						{isLoading ? (
							<span className={clsx("text-white", sizeClass)}>
								Carregando...
							</span>
						) : options.length === 0 ? (
							<span className={clsx("text-white", sizeClass)}>
								Não há nenhum item
							</span>
						) : (
							options.map((option, index) => (
								<li
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={index}
									className={clsx(
										"cursor-pointer text-white rounded-lg transition-all hover:bg-[#202020]",
									)}
								>
									<button
										className={clsx(
											"w-full text-left",
											size === "small" && "px-3 py-2",
											size === "lg" && "px-5 py-4",
											size === "xl" && "px-6 py-5",
											size === "base" && "px-4 py-3",
											sizeClass,
										)}
										type="button"
										onClick={() => {
											setSelectedValue(option.title);
											setLocalVisibleDropdown(false);

											if (handleOnClick) {
												handleOnClick(option);
											}

											if (setVisibleDropdown) {
												setVisibleDropdown(false);
											}

											if (setValue && name) {
												setValue(name, option.id);
											}
										}}
									>
										{option.title}
									</button>
								</li>
							))
						)}
					</ul>
				)}
				{error && <span className="text-red-600 text-sm">{error}</span>}
			</div>
			{visibleDropdown ||
				(localVisibleDropdown && (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<div
						onClick={() => {
							if (setVisibleDropdown) {
								setVisibleDropdown(false);
							}

							setLocalVisibleDropdown(false);
						}}
						className="absolute inset-0"
					/>
				))}
		</>
	);
};

export default Select;
