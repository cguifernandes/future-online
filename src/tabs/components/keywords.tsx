// biome-ignore lint/style/useImportType: <explanation>
import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import type { Gatilho } from "../../type/type";
import type { UseFormSetValue } from "react-hook-form";

interface Props {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	setValue?: UseFormSetValue<any>;
	name?: string;
	defaultValue?: string[];
}

const Keywords = ({ name, setValue, defaultValue }: Props) => {
	const [visibleInput, setVisibleInput] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [keywords, setKeywords] = useState<string[]>([]);

	const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && inputValue.trim()) {
			setKeywords((prevKeywords) => {
				setValue(name, [...prevKeywords, inputValue.trim()]);
				return [...prevKeywords, inputValue.trim()];
			});
			setInputValue("");
			setVisibleInput(false);
		}
	};

	useEffect(() => {
		if (defaultValue.length > 0) {
			setKeywords(defaultValue);
		} else {
			setKeywords([]);
		}
	}, [defaultValue]);

	if (keywords.length > 0) {
		return (
			<div className="flex items-center h-full overflow-y-auto flex-wrap gap-2">
				{keywords.map((keyword, index) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={index}
						className="bg-black/20 w-fit px-3 flex items-center gap-x-1 py-2 rounded-lg"
					>
						{keyword}
						<button
							type="button"
							onClick={() =>
								setKeywords((prevKeywords) =>
									prevKeywords.filter((kw) => kw !== keyword),
								)
							}
							className="p-1 rounded-full bg-black"
						>
							<X size={12} color="#fff" />
						</button>
					</span>
				))}
				Ou
				{visibleInput ? (
					<input
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						className="text-white max-w-fit bg-black/30 text-sm px-4 rounded-lg transition-all ring-transparent py-3 ring-2"
						type="text"
						maxLength={20}
						onKeyDown={handleAddKeyword}
						placeholder="Digite a palavra-chave"
					/>
				) : (
					<button
						className="text-white flex items-center gap-x-2 max-w-fit bg-black/30 text-sm px-4 rounded-lg transition-all py-3"
						onClick={() => setVisibleInput(true)}
						type="button"
					>
						<Plus color="#fff" size={20} strokeWidth={1.5} />
						Palavra-chave
					</button>
				)}
			</div>
		);
	}

	return (
		<>
			{visibleInput ? (
				<input
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					className="text-white max-w-fit bg-black/30 text-sm px-4 rounded-lg transition-all ring-transparent py-3 ring-2"
					type="text"
					maxLength={20}
					onKeyDown={handleAddKeyword}
					placeholder="Digite a palavra-chave"
				/>
			) : (
				<button
					className="text-white flex items-center gap-x-2 max-w-fit bg-black/30 text-sm px-4 rounded-lg transition-all py-3"
					onClick={() => setVisibleInput(true)}
					type="button"
				>
					<Plus color="#fff" size={20} strokeWidth={1.5} />
					Palavra-chave
				</button>
			)}
		</>
	);
};

export default Keywords;
