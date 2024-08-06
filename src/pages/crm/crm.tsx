import { useEffect, useState } from "react";
import Form from "../forms/form-crm";
import { Contact, Tabs } from "../../type/type";
import Tab from "../components/tab";

const CRM = () => {
	const [isLoadingConacts, setIsLoadingContacts] = useState(false);
	const [contacts, setContacts] = useState<Contact[] | null>(null);
	const [tabs, setTabs] = useState<Tabs[] | null>(null);
	const [draggedContact, setDraggedContact] = useState<Contact | null>(null);

	useEffect(() => {
		setIsLoadingContacts(true);

		chrome.storage.local.get("contacts", (result: { contacts: Contact[] }) => {
			if (chrome.runtime.lastError) {
				console.error(chrome.runtime.lastError.message);
				setIsLoadingContacts(false);
				return;
			}

			setContacts(result.contacts);
			setIsLoadingContacts(false);
		});

		chrome.storage.sync.get("tabs", (result: { tabs: Tabs[] }) => {
			if (chrome.runtime.lastError) {
				console.error(chrome.runtime.lastError.message);
				setIsLoadingContacts(false);
				return;
			}

			setTabs(result.tabs);
			setIsLoadingContacts(false);
		});
	}, []);

	const handleDragStart = (contact: Contact) => {
		setDraggedContact(contact);
	};

	return (
		<main className="min-h-[calc(100vh_-_96px)] py-6 gap-y-6 flex flex-col max-w-7xl w-full mx-auto px-8">
			<Form setTabs={setTabs} />
			<div className="flex gap-x-4 w-full overflow-x-auto custom-scrollbar">
				<div className="flex-1 flex flex-col max-w-72 min-w-64">
					<div className="bg-aqua-100 rounded-t-md px-3 py-2">
						<h1 className="text-2xl font-bold text-white">
							Inbox
							{contacts?.length > 0 && (
								<span className="text-lg">({contacts?.length})</span>
							)}
						</h1>
					</div>
					<div className="p-1 flex flex-col gap-y-2 rounded-b-md border border-t-0 border-gray-200 min-h-[182px] max-h-[544px] overflow-y-auto custom-scrollbar">
						{isLoadingConacts ? (
							<>
								<div className="bg-gray-200 rounded-lg animate-pulse h-[52px] w-full dark:bg-gray-300" />
								<div className="bg-gray-200 rounded-lg animate-pulse h-[52px] w-full dark:bg-gray-300" />
								<div className="bg-gray-200 rounded-lg animate-pulse h-[52px] w-full dark:bg-gray-300" />
								<div className="bg-gray-200 rounded-lg animate-pulse h-[52px] w-full dark:bg-gray-300" />
								<div className="bg-gray-200 rounded-lg animate-pulse h-[52px] w-full dark:bg-gray-300" />
								<div className="bg-gray-200 rounded-lg animate-pulse h-[52px] w-full dark:bg-gray-300" />
								<div className="bg-gray-200 rounded-lg animate-pulse h-[52px] w-full dark:bg-gray-300" />
								<div className="bg-gray-200 rounded-lg animate-pulse h-[52px] w-full dark:bg-gray-300" />
								<div className="bg-gray-200 rounded-lg animate-pulse h-[52px] w-full dark:bg-gray-300" />
							</>
						) : contacts?.length === 0 || !contacts ? (
							<span className="text-base p-2 text-center my-auto text-black">
								Sem nenhum contanto <br />
								Entre no WhatsApp Web e recarregue a página para que a extensão
								capture os contatos.
							</span>
						) : (
							contacts?.map((contact, index) => (
								<div
									key={index}
									draggable
									onDragStart={() => handleDragStart(contact)}
									className="border border-gray-200 cursor-pointer h-14 hover:bg-gray-200 hover:border-gray-400 transition-all gap-x-2 flex p-2 rounded-lg items-center"
								>
									<img
										src={contact.pfp}
										alt="Imagem profile"
										className="size-8 rounded-full select-none"
									/>
									<span className="text-base truncate select-none">
										{contact.name}
									</span>
								</div>
							))
						)}
					</div>
				</div>
				{tabs?.length > 0 &&
					tabs?.map((tab, index) => (
						<Tab
							setTabs={setTabs}
							allTabs={tabs}
							tab={tab}
							draggedContact={draggedContact}
							key={index}
						/>
					))}
			</div>
		</main>
	);
};

export default CRM;
