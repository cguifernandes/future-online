import React from "react";
import type { FormEvent } from "react";
import Input from "../components/input";
import Button from "../components/button";
import File from "../components/file";
import Textarea from "../components/textarea";
import { generateThumbnail, uploadAndSign } from "../utils/utils";
import type { Midia } from "../../type/type";

interface Props {
	setData: React.Dispatch<
		React.SetStateAction<{
			itens: Midia[];
		}>
	>;
	dataItem: Midia;
	setDataItem: React.Dispatch<React.SetStateAction<Midia>>;
	setContentItem: React.Dispatch<React.SetStateAction<Midia>>;
	contentItem: Midia;
	setError: React.Dispatch<React.SetStateAction<string>>;
	error: string;
}

const Form = ({
	dataItem,
	setContentItem,
	setDataItem,
	setData,
	contentItem,
	error,
	setError,
}: Props) => {
	const [isLoading, setIsLoading] = React.useState(false);

	const handlerSubmit = async (e: FormEvent) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const title = formData.get("title") as string;
		const subtitle = formData.get("subtitle") as string;
		const file = formData.get("file") as File;

		try {
			setIsLoading(true);
			const fileUrl = [];
			const promises = [];

			if (file.type !== "application/octet-stream" && file.name !== "") {
				const fileName = `${new Date().getTime()}${file.name}`;

				if (file.type.includes("video")) {
					const thumbnailBlob = await generateThumbnail(file);

					promises.push(uploadAndSign(`preview-${fileName}`, thumbnailBlob));
				}

				promises.push(uploadAndSign(fileName, file));
			}

			const updatedItem: Midia = {
				...contentItem,
				title,
				image: {
					subtitle,
					url: fileUrl[1] || fileUrl[0],
					preview: fileUrl[0],
					type: file.type.includes("video") ? "Vídeo" : "Imagem",
				},
			};

			chrome.storage.sync.get("midias", (result) => {
				const updatedItems = result.midias.map((item) =>
					item.id === contentItem.id ? updatedItem : item,
				);

				chrome.storage.sync.set({ midias: updatedItems }, () => {
					setData({ itens: updatedItems });
					setDataItem(updatedItem);
					setContentItem(updatedItem);
				});
			});
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
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
				<File
					error={error}
					setError={setError}
					dataItem={dataItem}
					setDataItem={setDataItem}
				/>
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
				<Button
					isLoading={isLoading}
					theme="green-light"
					className="hover:bg-green-600 w-28"
				>
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
