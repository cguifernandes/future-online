// biome-ignore lint/style/useImportType: <explanation>
import React from "react";
import type { FormEvent } from "react";
import Input from "../components/input";
import Button from "../components/button";
import File from "../components/file";
import Textarea from "../components/textarea";
import { supabase } from "../../lib/supabase";

interface Props {
	setData: React.Dispatch<
		React.SetStateAction<{
			itens: {
				title: string;
				image: {
					url: string;
					subtitle: string;
				};
				id: string;
			}[];
		}>
	>;
	dataItem: {
		title: string;
		image: {
			url: string;
			subtitle: string;
		};
	};
	setDataItem: React.Dispatch<
		React.SetStateAction<{
			title: string;
			image: {
				url: string;
				subtitle: string;
			};
		}>
	>;
	setContentItem: React.Dispatch<
		React.SetStateAction<{
			title: string;
			image: {
				url: string;
				subtitle: string;
			};
			id: string;
		}>
	>;
	contentItem: {
		title: string;
		image: {
			url: string;
			subtitle: string;
		};
		id: string;
	};
}

const Form = ({
	dataItem,
	setContentItem,
	setDataItem,
	setData,
	contentItem,
}: Props) => {
	const handlerSubmit = async (e: FormEvent) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const title = formData.get("title") as string;
		const subtitle = formData.get("subtitle") as string;
		const file = formData.get("file") as File;

		if (contentItem && file.name !== "") {
			const fileName = `${new Date().getTime()}${file.name}`;

			try {
				const upload = await supabase.storage
					.from("future-online")
					.upload(fileName, file);
				if (upload.error) {
					console.log(upload.error);
				}

				const url = await supabase.storage
					.from("future-online")
					.createSignedUrl(upload.data.path, 30 * 24 * 60 * 60);

				const updatedItem = {
					...contentItem,
					title,
					image: { subtitle, url: url.data.signedUrl },
				};

				chrome.storage.sync.get("midias", (result) => {
					const updatedItems = result.midias.map((item) =>
						item.id === contentItem.id ? updatedItem : item,
					);

					chrome.storage.sync.set({ midias: updatedItems }, () => {
						setData({ itens: updatedItems });
						setContentItem(updatedItem);
					});
				});
			} catch (error) {
				console.log(error);
			} finally {
				console.log("finally");
			}
		}
	};

	const handlerRemoveItem = (id: string) => {
		chrome.storage.sync.get("midias", (result) => {
			const updatedItems = result.midias.filter(
				(item: { title: string; content: string; id: string }) =>
					item.id !== id,
			);

			chrome.storage.sync.set({ midias: updatedItems }, () => {
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
			<div className="flex gap-x-3 w-full flex-1">
				<File dataItem={dataItem} setDataItem={setDataItem} />
				<Textarea
					name="subtitle"
					theme="green"
					className="resize-none"
					placeholder="Insira uma legenda para a mídia (Opcional)"
					value={dataItem.image.subtitle}
					onChange={(e) =>
						setDataItem((prev) => ({
							...prev,
							image: { ...prev.image, subtitle: e.target.value },
						}))
					}
				/>
			</div>
			<div className="flex items-center gap-x-3 justify-end w-full">
				<Button theme="green-light" className="hover:bg-green-600 w-28">
					Salvar
				</Button>
				<Button
					onClick={() => setContentItem(undefined)}
					theme="danger"
					className="w-28"
				>
					Cancelar
				</Button>
			</div>
		</form>
	);
};

export default Form;
