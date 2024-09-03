import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { UseFormSetValue } from "react-hook-form";
import clsx from "clsx";

interface Props {
	options: {
		title: string;
		[key: string]: any;
	}[];
	label?: string;
	setVisibleDropdown?: React.Dispatch<React.SetStateAction<boolean>>;
	visibleDropdown?: boolean;
	error?: string;
	isLoading?: boolean;
	name?: string;
	defaultValue?: string;
	setValue?: UseFormSetValue<any>;
	handleOnClick?: (option: any) => void;
	handleOnClickClear?: () => void;
	className?: string;
	zIndex?: number;
	contentClassName?: string;
}

const Select = ({
	options,
	label,
	setVisibleDropdown,
	handleOnClickClear,
	visibleDropdown,
	name,
	setValue,
	error,
	isLoading,
	defaultValue,
	className,
	contentClassName,
	handleOnClick,
	zIndex = 40,
}: Props) => {
	const [selectedValue, setSelectedValue] = useState("");
	const [localVisibleDropdown, setLocalVisibleDropdown] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (defaultValue) {
			setSelectedValue(defaultValue);
		}
	}, [defaultValue]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setLocalVisibleDropdown(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div
			ref={dropdownRef}
			className={clsx("relative flex flex-col gap-y-1", className)}
		>
			{label && <label className={clsx("text-white text-sm")}>{label}</label>}
			<div
				onClick={() => {
					if (setVisibleDropdown) {
						setVisibleDropdown(true);
					}

					setLocalVisibleDropdown(!localVisibleDropdown);
				}}
				className={clsx(
					"relative flex items-center px-3 py-2 pr-[32px] min-h-11 text-sm justify-between bg-gray-900 rounded-lg cursor-pointer",
					contentClassName,
				)}
			>
				<input
					placeholder="Selecione um item"
					readOnly
					className={clsx(
						"w-full text-white text-sm bg-transparent h-full cursor-pointer",
					)}
					value={selectedValue}
				/>
				<ChevronDown
					className={clsx("absolute right-3 top-1/2 -translate-y-1/2")}
					size={20}
					color="#fff"
				/>
			</div>
			{(visibleDropdown || localVisibleDropdown) && (
				<ul
					style={{ zIndex }}
					className="absolute max-h-60 overflow-y-auto top-full flex flex-col gap-y-2 mt-2 w-full p-3 select-none rounded-lg bg-gray-900 shadow-md"
				>
					{isLoading ? (
						<span className={clsx("text-white text-sm")}>Carregando...</span>
					) : !options || (options && options.length === 0) ? (
						<span className={clsx("text-white text-sm")}>
							Não há nenhum item
						</span>
					) : (
						<>
							{options.map((option, index) => (
								<li
									key={index}
									className={clsx(
										"cursor-pointer text-white rounded-lg py-2 px-3 transition-all hover:bg-gray-800",
									)}
								>
									<button
										className={clsx("w-full text-sm text-left")}
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
							))}
							<div className="w-full h-px bg-gray-700" />
							<li
								className={clsx(
									"cursor-pointer text-white rounded-lg py-2 px-3 transition-all bg-gray-700",
								)}
							>
								<button
									className={clsx("w-full text-sm text-left")}
									type="button"
									onClick={() => {
										setSelectedValue("");
										setLocalVisibleDropdown(false);

										handleOnClickClear();
									}}
								>
									Esvaziar seleção
								</button>
							</li>
						</>
					)}
				</ul>
			)}
			{error && <span className="text-red-600 text-sm">{error}</span>}
		</div>
	);
};

export default Select;
