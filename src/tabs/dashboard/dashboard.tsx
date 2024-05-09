import React, { type FormEvent, useEffect, useState } from "react";
import "./dashboard.css";
import Button from "../components/button";
import Input from "../components/input";
import Textarea from "../components/textarea";
import { v4 as uuidv4 } from "uuid";

const Dashboard = () => {
	const [data, setData] = useState<{
		itens: { title: string; content: string; id: string }[];
	}>({ itens: [] });
	const [contentItem, setContentItem] = useState<{
		title: string;
		content: string;
		id: string;
	}>();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");

	useEffect(() => {
		chrome.storage.sync
			.get()
			.then(
				(data: { itens: { title: string; content: string; id: string }[] }) => {
					if (Object.keys(data).length === 0) {
						setData({ itens: [] });
					} else {
						setData(data);
					}
				},
			)
			.catch((error) => {
				console.log(error);
			});
	}, []);

	useEffect(() => {
		setContent(contentItem?.content || "");
		setTitle(contentItem?.title || "");
	}, [contentItem]);

	const handlerAddItem = (newItem: { title: string; content: string }) => {
		const newItemWithId = { ...newItem, id: uuidv4() };
		const newItems = [...data.itens, newItemWithId];

		chrome.storage.sync.set({ itens: newItems }, () => {
			setData({ itens: newItems });
		});
	};

	const handlerRemoveItem = (removeItem: {
		title: string;
		content: string;
		id: string;
	}) => {
		chrome.storage.sync.get("itens", (result) => {
			const updatedItems = result.itens.filter(
				(item: { title: string; content: string; id: string }) =>
					item.id !== removeItem.id,
			);
			chrome.storage.sync.set({ itens: updatedItems }, () => {
				setData({ itens: updatedItems });
				setContentItem(undefined);
			});
		});
	};

	const handlerSubmit = (e: FormEvent) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const title = formData.get("title") as string;
		const content = formData.get("content") as string;

		if (contentItem) {
			const updatedItem = { ...contentItem, title, content };

			chrome.storage.sync.get("itens", (result) => {
				const updatedItems = result.itens.map((item) =>
					item.id === contentItem.id ? updatedItem : item,
				);

				chrome.storage.sync.set({ itens: updatedItems }, () => {
					setData({ itens: updatedItems });
					setContentItem(updatedItem);
				});
			});
		}
	};

	return (
		<>
			<header className="flex justify-center bg-gray-800 h-16 flex-nowrap z-50 w-full">
				<nav className="w-full py-3 px-8 flex items-center justify-between max-w-7xl">
					<div className="bg-white w-24 h-6" />
				</nav>
			</header>
			<main className="min-h-[calc(100vh_-_64px)] max-w-7xl w-full mx-auto px-8">
				<div className="flex flex-col gap-y-px py-6">
					<h1 className="text-xl font-semibold">
						Bem vindo(a) ao Painel de Controle
					</h1>
					<span className="text-base">
						O que você deseja adicionar ou gerenciar?
					</span>
				</div>
				<div className="w-full flex gap-2 h-full">
					<ul className="flex flex-col gap-y-2 max-w-[256px] w-full">
						<li className="w-full rounded-lg transition-all bg-black/70 hover:bg-purple-800/80 group">
							<button
								className="px-4 py-3 w-full flex items-center gap-x-3"
								type="button"
							>
								<div className="p-2 rounded-lg transition-all bg-black/40 text-white group-hover:text-purple-500 group-hover:bg-purple-900/90">
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
									>
										<rect width="20" height="16" x="2" y="4" rx="2" />
										<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
									</svg>
								</div>
								<span className="text-base font-semibold text-white">
									Mensagens
								</span>
							</button>
						</li>
						<li className="w-full rounded-lg transition-all bg-black/70 hover:bg-purple-800/80 group">
							<button
								className="px-4 py-3 w-full flex items-center gap-x-3"
								type="button"
							>
								<div className="p-2 rounded-lg transition-all bg-black/40 text-white group-hover:text-purple-500 group-hover:bg-purple-900/90">
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
									>
										<rect width="20" height="16" x="2" y="4" rx="2" />
										<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
									</svg>
								</div>
								<span className="text-base font-semibold text-white">
									Mensagens
								</span>
							</button>
						</li>
						<li className="w-full rounded-lg transition-all bg-black/70 hover:bg-purple-800/80 group">
							<button
								className="px-4 py-3 w-full flex items-center gap-x-3"
								type="button"
							>
								<div className="p-2 rounded-lg transition-all bg-black/40 text-white group-hover:text-purple-500 group-hover:bg-purple-900/90">
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
									>
										<rect width="20" height="16" x="2" y="4" rx="2" />
										<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
									</svg>
								</div>
								<span className="text-base font-semibold text-white">
									Mensagens
								</span>
							</button>
						</li>
						<li className="w-full rounded-lg transition-all bg-black/70 hover:bg-purple-800/80 group">
							<button
								className="px-4 py-3 w-full flex items-center gap-x-3"
								type="button"
							>
								<div className="p-2 rounded-lg transition-all bg-black/40 text-white group-hover:text-purple-500 group-hover:bg-purple-900/90">
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
									>
										<rect width="20" height="16" x="2" y="4" rx="2" />
										<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
									</svg>
								</div>
								<span className="text-base font-semibold text-white">
									Mensagens
								</span>
							</button>
						</li>
						<li className="w-full rounded-lg transition-all bg-black/70 hover:bg-purple-800/80 group">
							<button
								className="px-4 py-3 w-full flex items-center gap-x-3"
								type="button"
							>
								<div className="p-2 rounded-lg transition-all bg-black/40 text-white group-hover:text-purple-500 group-hover:bg-purple-900/90">
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
									>
										<rect width="20" height="16" x="2" y="4" rx="2" />
										<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
									</svg>
								</div>
								<span className="text-base font-semibold text-white">
									Mensagens
								</span>
							</button>
						</li>
						<li className="w-full rounded-lg transition-all bg-black/70 hover:bg-purple-800/80 group">
							<button
								className="px-4 py-3 w-full flex items-center gap-x-3"
								type="button"
							>
								<div className="p-2 rounded-lg transition-all bg-black/40 text-white group-hover:text-purple-500 group-hover:bg-purple-900/90">
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
									>
										<rect width="20" height="16" x="2" y="4" rx="2" />
										<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
									</svg>
								</div>
								<span className="text-base font-semibold text-white">
									Mensagens
								</span>
							</button>
						</li>
					</ul>
					<div className="flex-1 flex">
						<div className="flex flex-col max-w-sm w-full h-full bg-black/70 rounded-l-lg">
							<h1 className="text-lg font-semibold text-center text-white p-2 w-full bg-purple-500 rounded-tl-lg">
								Gerenciamento de Mensagens
							</h1>
							{data.itens.length > 0 ? (
								<>
									<div className="flex flex-col max-h-60 overflow-y-auto">
										{data.itens.map((item, index) => (
											<Button
												type="button"
												// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
												key={index}
												onClick={() => setContentItem(item)}
												theme="purple-dark"
												className="text-left !rounded-none hover:bg-purple-800"
											>
												{item.title}
											</Button>
										))}
									</div>
									<div className="flex flex-col justify-center items-center flex-1">
										<Button
											type="button"
											theme="purple-dark"
											className="hover:bg-purple-800"
											onClick={() =>
												handlerAddItem({
													content: "Novo item",
													title: "Novo conteúdo",
												})
											}
											icon={
												// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="18"
													height="18"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<path d="M5 12h14" />
													<path d="M12 5v14" />
												</svg>
											}
										>
											Novo item
										</Button>
									</div>
								</>
							) : (
								<div className="h-full w-full flex flex-col justify-center items-center">
									<div className="flex flex-col items-center gap-y-1 px-3">
										<span className="text-base text-white text-center">
											Nenhum item cadastrado ainda, clique no botão abaixo para
											adicionar seu primeiro item
										</span>
										<Button
											type="button"
											theme="purple-dark"
											onClick={() =>
												handlerAddItem({
													content: "Novo item",
													title: "Novo conteúdo",
												})
											}
											icon={
												// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="18"
													height="18"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<path d="M5 12h14" />
													<path d="M12 5v14" />
												</svg>
											}
										>
											Novo item
										</Button>
									</div>
								</div>
							)}
						</div>
						<div className="bg-black/70 rounded-r-lg border-l-2 border-white w-full h-full">
							{contentItem ? (
								<form
									onSubmit={handlerSubmit}
									className="flex flex-col gap-y-3 items-center justify-center p-4 h-full"
								>
									<div className="flex gap-x-3 w-full">
										<Input
											placeholder="Título do item"
											className="w-full"
											name="title"
											value={title}
											onChange={(e) => setTitle(e.target.value)}
											theme="purple"
										/>
										<button
											type="button"
											onClick={() => handlerRemoveItem(contentItem)}
											className="p-2 flex items-center justify-center w-12 h-12 rounded-lg transition-all bg-red-600/50"
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
									<Textarea
										name="content"
										placeholder="Conteúdo do item"
										className="h-full w-full resize-none"
										theme="purple"
										value={content}
										onChange={(e) => setContent(e.target.value)}
									/>
									<div className="flex items-center gap-x-3 justify-end w-full">
										<Button
											theme="purple-light"
											className="hover:bg-purple-600 w-28"
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
							) : (
								<div className="flex items-center justify-center px-4 h-full">
									<h1 className="text-lg text-white text-center">
										Selecione uma mensagem para editar na aba ao lado ou clique
										em "Novo Item" para adicionar uma nova mensagem
									</h1>
								</div>
							)}
						</div>
					</div>
				</div>
			</main>
		</>
	);
};

export default Dashboard;
