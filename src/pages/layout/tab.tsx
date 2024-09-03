import { Dispatch, DragEvent, useState } from "react";
import { Contact, Tabs } from "../../type/type";
import { Trash2 } from "lucide-react";

interface Props {
	draggedContact: Contact;
	tab: Tabs;
	allTabs: Tabs[];
	setTabs: Dispatch<React.SetStateAction<Tabs[]>>;
}

const Tab = ({ draggedContact, setTabs, tab, allTabs }: Props) => {
	const [isDragOver, setIsDragOver] = useState<boolean>(false);

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = () => {
		setIsDragOver(false);
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>, selectedTab: Tabs) => {
		e.preventDefault();

		if (!draggedContact) return;

		if (
			selectedTab.contacts.some(
				(contact) => contact.phone === draggedContact.phone,
			)
		) {
			setIsDragOver(false);
			return;
		}

		const updatedTabs = allTabs?.map((t) => {
			if (t.name === tab.name) {
				return { ...t, contacts: [...t.contacts, draggedContact] };
			}

			return t;
		});

		if (updatedTabs) {
			setTabs(updatedTabs);

			chrome.storage.sync.set({ tabs: updatedTabs });
		}

		setIsDragOver(false);
	};

	const handlerRemoveTab = (tabToRemove: Tabs) => {
		const updatedTabs = allTabs.filter((t) => t.name !== tabToRemove.name);

		chrome.storage.sync.set({ tabs: updatedTabs }, () => {
			setTabs(updatedTabs);
		});
	};

	const handlerRemoveContact = (contactToRemove: Contact) => {
		const updatedTabs = allTabs.map((t) => {
			if (t.name === tab.name) {
				return {
					...t,
					contacts: t.contacts.filter(
						(contact) => contact.phone !== contactToRemove.phone,
					),
				};
			}
			return t;
		});

		chrome.storage.sync.set({ tabs: updatedTabs }, () => {
			setTabs(updatedTabs);
		});
	};

	return (
		<div
			className="flex-1 flex flex-col max-w-72 min-w-64 h-full"
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={(e) => handleDrop(e, tab)}
		>
			<div className="bg-gray-800 flex items-center h-14 justify-between w-full rounded-t-md px-3 py-2">
				<h1 className="text-2xl font-bold text-white">{tab.name}</h1>
				<button
					type="button"
					onClick={() => handlerRemoveTab(tab)}
					className="flex items-center justify-center p-2.5 transition-all text-white hover:bg-gray-700 rounded-full border border-gray-700"
				>
					<Trash2 size={18} />
				</button>
			</div>
			<div className="p-1 flex flex-col bg-gray-700 gap-y-2 rounded-b-md border border-t-0 border-neutral-400 min-h-[182px] max-h-[544px] overflow-y-auto custom-scrollbar">
				{tab?.contacts.length > 0 &&
					tab.contacts.map((contact, index) => (
						<div
							key={index}
							className="cursor-pointer bg-gray-800 h-14 hover:bg-gray-700 hover:border-gray-700 transition-all gap-x-2 flex p-2 rounded-lg items-center"
						>
							<img
								src={contact.pfp}
								alt="Imagem profile"
								className="size-8 rounded-full select-none"
							/>
							<div className="flex items-center w-full justify-between">
								<span className="text-base text-white max-w-[154px] truncate select-none">
									{contact.name}
								</span>
								<button
									type="button"
									onClick={() => handlerRemoveContact(contact)}
									className="flex items-center justify-center p-2 transition-all hover:bg-gray-800 rounded-full border border-gray-700"
								>
									<Trash2 color="#fff" size={16} />
								</button>
							</div>
						</div>
					))}
				<div
					style={{
						opacity: isDragOver ? 1 : 0,
					}}
					className="border border-neutral-400 h-14 transition-all bg-gray-200 gap-x-2 flex p-2 rounded-lg items-center"
				/>
			</div>
		</div>
	);
};

export default Tab;
