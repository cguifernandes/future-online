// biome-ignore lint/style/useImportType: <explanation>
import React, { useState } from "react";
import type { UseFormSetValue } from "react-hook-form";

interface Props {
	options: {
		title: string;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		[key: string]: any;
	}[];
	label?: string;
	setVisibleDropdown: React.Dispatch<React.SetStateAction<boolean>>;
	visibleDropdown: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	setValue?: UseFormSetValue<any>;
	name?: string;
	error?: string;
	setSelectedValue: React.Dispatch<React.SetStateAction<string>>;
	selectedValue: string;
}

const Select = ({
	options,
	label,
	setVisibleDropdown,
	visibleDropdown,
	setValue,
	name,
	error,
	selectedValue,
	setSelectedValue,
}: Props) => {
	return (
		<div className="relative flex flex-col gap-y-2">
			{label && <label className="text-white text-lg">{label}</label>}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				onClick={() =>
					setVisibleDropdown((prev) => {
						return !prev;
					})
				}
				className="relative h-11 bg-black/30 rounded-lg"
			>
				<input
					placeholder="Selecione um item"
					readOnly
					className="w-full text-white cursor-pointer bg-transparent text-sm px-4 py-3"
					value={selectedValue}
				/>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="lucide absolute text-white top-1/2 -translate-y-1/2 right-3 lucide-chevron-down"
				>
					<title>Chevron Down</title>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</div>
			{visibleDropdown && (
				<ul className="absolute top-full flex flex-col gap-y-2 mt-2 z-30 w-full p-3 select-none rounded-lg bg-[#353535] shadow-md">
					{options.length === 0 ? (
						<span className="text-white text-base">Não há nenhum item</span>
					) : (
						options.map((option, index) => {
							return (
								<li
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={index}
									className="cursor-pointer text-white rounded-lg transition-all text-base hover:bg-[#202020]"
								>
									<button
										className="w-full px-4 py-2 text-left"
										type="button"
										onClick={() => {
											setSelectedValue(option.title);
											setVisibleDropdown(false);

											if (setValue && name) {
												setValue(name, option.id);
											}
										}}
									>
										{option.title}
									</button>
								</li>
							);
						})
					)}
				</ul>
			)}
			{error && <span className="text-red-600 text-sm">{error}</span>}
		</div>
	);
};

export default Select;
