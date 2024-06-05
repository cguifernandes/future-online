import React, { useState, type ReactNode } from "react";
import Item from "../components/item";
import Messages from "../layout/messages";
import Midias from "../layout/midias";
import Funis from "../layout/funis";
import clsx from "clsx";
import { Bot, Filter, Image, Mail } from "lucide-react";
import Gatilhos from "../layout/gatilhos";

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
			icon: <Mail size={24} strokeWidth={1.5} />,
			content: <Messages />,
			color: "bg-purple-900/90",
		},
		{
			title: "Mídias",
			icon: <Image size={24} strokeWidth={1.5} />,
			content: <Midias />,
			color: "bg-green-800/90",
		},
		{
			title: "Funis",
			icon: <Filter size={24} strokeWidth={1.5} />,
			content: <Funis />,
			color: "bg-yellow-800/90",
		},
		{
			title: "Gatilhos",
			icon: <Bot size={24} strokeWidth={1.5} />,
			content: <Gatilhos />,
			color: "bg-orange-800/90",
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
								color={item.color}
								className={clsx("w-full rounded-lg transition-all group")}
								classNameButton="px-4 py-3 w-full flex items-center gap-x-3"
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
