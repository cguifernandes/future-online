import React, { useState, type ReactNode } from "react";
import Item from "../components/item";
import Messages from "../components/messages";
import Midias from "../components/midias";
import Funis from "../components/funis";

const Dashboard = () => {
	const [contentDashboard, setContentDashboard] = useState<{
		content: ReactNode;
		index: number;
	}>({
		content: <Messages />,
		index: 0,
	});

	const itens = [
		{
			title: "Mensagens",
			icon: (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
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
			),
			content: <Messages />,
			color: "bg-purple-900/90",
		},
		{
			title: "Mídias",
			icon: (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
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
					className="lucide lucide-image"
				>
					<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
					<circle cx="9" cy="9" r="2" />
					<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
				</svg>
			),
			content: <Midias />,
			color: "bg-green-800/90",
		},
		{
			title: "Funis",
			icon: (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
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
					className="lucide lucide-filter"
				>
					<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
				</svg>
			),
			content: <Funis />,
			color: "bg-yellow-800/90",
		},
	];

	return (
		<>
			<header className="flex justify-center bg-gray-800 h-24 flex-nowrap z-50 w-full">
				<nav className="w-full py-3 px-8 flex items-center justify-between max-w-7xl">
					<img src="https://i.imgur.com/L43iCAC.png" alt="Logo" />
				</nav>
			</header>
			<main className="min-h-[calc(100vh_-_96px)] max-w-7xl w-full mx-auto px-8">
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
						{itens.map((item, index) => (
							<Item
								className={item.color}
								setContent={setContentDashboard}
								contentDashboard={contentDashboard}
								content={item.content}
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								key={index}
								icon={item.icon}
								title={item.title}
								index={index}
							/>
						))}
					</ul>
					<div className="flex-1 flex h-[400px]">
						{contentDashboard.content}
					</div>
				</div>
			</main>
		</>
	);
};

export default Dashboard;
