// biome-ignore lint/style/useImportType: <explanation>
import React, { type FormEvent } from "react";
import Input from "../components/input";

interface Props {
	contentItem: {
		title: string;
		item: {
			selectedId: string;
			delay: {
				minutes: number;
				seconds: number;
			};
		};
		id: string;
	};
	setContentItem: React.Dispatch<
		React.SetStateAction<{
			title: string;
			item: {
				selectedId: string;
				delay: {
					minutes: number;
					seconds: number;
				};
			};
			id: string;
		}>
	>;
	setData: React.Dispatch<
		React.SetStateAction<{
			itens: {
				title: string;
				item: {
					selectedId: string;
					delay: {
						minutes: number;
						seconds: number;
					};
				};
				id: string;
			}[];
		}>
	>;
	dataItem: {
		title: string;
		item: {
			selectedId: string;
			delay: {
				minutes: number;
				seconds: number;
			};
		};
	};
	setDataItem: React.Dispatch<
		React.SetStateAction<{
			title: string;
			item: {
				selectedId: string;
				delay: {
					minutes: number;
					seconds: number;
				};
			};
		}>
	>;
}

const Form = ({
	contentItem,
	dataItem,
	setDataItem,
	setContentItem,
	setData,
}: Props) => {
	const handlerSubmit = (e: FormEvent) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const title = formData.get("title") as string;
		const content = formData.get("content") as string;

		if (contentItem) {
			const updatedItem = { ...contentItem, title, content };

			chrome.storage.sync.get("messages", (result) => {
				const messages = result.messages || [];
				const updatedItems = messages.map((item) =>
					item.id === contentItem.id ? updatedItem : item,
				);

				chrome.storage.sync.set({ messages: updatedItems }, () => {
					setData({ itens: updatedItems });
					setContentItem(updatedItem);
				});
			});
		}
	};

	const handlerRemoveItem = (id: string) => {
		chrome.storage.sync.get("funis", (result) => {
			const updatedItems = result.funis.filter(
				(item: {
					title: string;
					item: {
						selectedId: string;
						delay: {
							minutes: number;
							seconds: number;
						};
					};
					id: string;
				}) => item.id !== id,
			);

			chrome.storage.sync.set({ funis: updatedItems }, () => {
				setData({ itens: updatedItems });
				setContentItem(undefined);
			});
		});
	};

	return (
		<form
			onSubmit={handlerSubmit}
			className="flex flex-col gap-y-3 items-center justify-center p-4 h-full"
		>
			<div className="flex gap-x-3 w-full">
				<Input
					placeholder="Título do item"
					className="w-full"
					name="title"
					value={dataItem.title}
					onChange={(e) => {
						setDataItem((prev) => ({ ...prev, title: e.target.value }));
					}}
					theme="green"
				/>
				<button
					type="button"
					onClick={() => handlerRemoveItem(contentItem.id)}
					className="p-2 flex items-center justify-center w-12 h-12 rounded-lg transition-all bg-red-600 hover:bg-red-700"
				>
					{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
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
						className="text-white"
					>
						<path d="M3 6h18" />
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
						<line x1="10" x2="10" y1="11" y2="17" />
						<line x1="14" x2="14" y1="11" y2="17" />
					</svg>
				</button>
			</div>
		</form>
	);
};

export default Form;
