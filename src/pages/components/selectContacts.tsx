import clsx from "clsx";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { Contact } from "../../type/type";

interface Props {
	label?: string;
	error?: string;
	name?: string;
	defaultValue?: string[] | string;
	setValue?: UseFormSetValue<any>;
	className?: string;
	zIndex?: number;
}

const SelectContacts = ({
	className,
	defaultValue,
	error,
	label,
	name,
	setValue,
	zIndex,
}: Props) => {
	const [selectedValues, setSelectedValues] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [visibleDropdown, setVisibleDropdown] = useState(false);
	const [options, setOptions] = useState<Contact[] | null>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setIsLoading(true);

		chrome.storage.local.get("contacts", (result: { contacts: Contact[] }) => {
			if (chrome.runtime.lastError) {
				console.error(chrome.runtime.lastError.message);
				setIsLoading(false);
				return;
			}

			if (result.contacts) {
				const updatedContacts = result.contacts
					.filter((contact) => contact.phone.endsWith("@c.us"))
					.map((contact) => ({
						...contact,
						phone: contact.phone.replace("@c.us", ""),
					}));

				setOptions(updatedContacts);
			} else {
				setOptions(null);
			}

			setIsLoading(false);
		});
	}, []);

	useEffect(() => {
		if (defaultValue && defaultValue instanceof Array) {
			setSelectedValues(defaultValue);
		} else {
			setSelectedValues([]);
		}
	}, [defaultValue]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setVisibleDropdown(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleSelect = (contact: string) => {
		if (selectedValues.some((item) => item === contact)) {
			const updatedValues = selectedValues.filter((item) => item !== contact);
			setSelectedValues(updatedValues);
			if (setValue && name) {
				setValue(
					name,
					updatedValues.map((item) => item),
				);
			}
		} else {
			const updatedValues = [...selectedValues, contact];
			setSelectedValues(updatedValues);
			if (setValue && name) {
				setValue(
					name,
					updatedValues.map((item) => item),
				);
			}
		}
	};

	const handleRemoveSelected = (contact: string) => {
		const updatedValues = selectedValues.filter((item) => item !== contact);
		setSelectedValues(updatedValues);
		if (setValue && name) {
			setValue(
				name,
				updatedValues.map((item) => item),
			);
		}
	};

	return (
		<div className="flex flex-col gap-y-1">
			<div className={clsx("relative", className)} ref={dropdownRef}>
				{label && <label className={clsx("text-white text-sm")}>{label}</label>}
				<div
					onClick={() => setVisibleDropdown(!visibleDropdown)}
					className="relative flex items-center text-sm justify-between bg-gray-900 rounded-lg cursor-pointer"
				>
					<div className="flex items-center flex-wrap gap-1 min-h-11 px-3 py-2 pr-[32px] w-full">
						{selectedValues.length > 0 ? (
							<>
								{selectedValues.slice(0, 6).map((contact, index) => (
									<span
										key={index}
										className="flex items-center gap-x-1 bg-gray-700  px-2 py-1 rounded-md"
									>
										<span className="w-full text-white truncate">
											{contact}
										</span>
										<X
											className="cursor-pointer"
											size={16}
											color="#fff"
											onClick={(e) => {
												e.stopPropagation();
												handleRemoveSelected(contact);
											}}
										/>
									</span>
								))}
								{selectedValues.length > 6 && (
									<span className="text-white px-2 py-1 rounded-md">
										+{selectedValues.length - 6}
									</span>
								)}
							</>
						) : (
							<span className="text-gray-500">Selecione um ou mais itens</span>
						)}
					</div>
					<ChevronDown
						className={clsx("absolute top-1/2 right-3 -translate-y-1/2")}
						size={20}
						color="#fff"
					/>
				</div>
				{visibleDropdown && (
					<ul
						style={{ zIndex }}
						className="absolute max-h-60 overflow-y-auto top-full flex flex-col gap-y-2 mt-2 w-full p-3 select-none rounded-lg bg-gray-900 shadow-md"
					>
						{isLoading ? (
							<span className="text-white text-sm">Carregando...</span>
						) : options?.length === 0 || !options ? (
							<span className="text-white text-sm">
								Entre no WhatsApp Web e recarregue a página para que a extensão
								capture os contatos.
							</span>
						) : (
							options?.map((option, index) => (
								<li
									key={index}
									className={clsx(
										"cursor-pointer text-white py-2 px-3 rounded-lg transition-all hover:bg-gray-800",
										selectedValues.some(
											(selected) => selected === option.phone,
										) && "bg-gray-700",
									)}
									onClick={() => handleSelect(option.phone)}
								>
									<button
										className="w-full flex items-center gap-x-2 text-base text-left"
										type="button"
									>
										<img
											className="rounded-full size-7"
											alt="Imagem de perfil"
											src={option.pfp}
										/>
										{option.name}
									</button>
								</li>
							))
						)}
					</ul>
				)}
			</div>
			{error && <span className="text-red-600 text-sm">{error}</span>}
		</div>
	);
};

export default SelectContacts;
