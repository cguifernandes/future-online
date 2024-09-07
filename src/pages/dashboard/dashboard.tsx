import { useEffect, useState, type ReactNode } from "react";
import Item from "../components/item";
import Messages from "../layout/messages";
import Midias from "../layout/midias";
import Funis from "../layout/funis";
import clsx from "clsx";
import { Bot, Filter, Image, Mail, Mic, Rocket } from "lucide-react";
import Gatilhos from "../layout/gatilhos";
import Audios from "../layout/audios";
import Trigger from "../layout/trigger";
import { StorageData } from "../../type/type";
import { ErrorMessage } from "../components/errorMessage";
import { checkIfAccountExists } from "../../utils/utils";
import Spinner from "../components/spinner";

type Props = {
	account: StorageData["account"];
};

const Dashboard = ({ account }: Props) => {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<{
		message: string;
		subMessage: string;
	} | null>(null);
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
			title: "Áudios",
			icon: <Mic size={24} strokeWidth={1.5} />,
			content: <Audios />,
			color: "bg-blue-800/90",
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
		{
			title: "Disparo em massa",
			icon: <Rocket size={24} strokeWidth={1.5} />,
			content: <Trigger />,
			color: "bg-pink-800/90",
		},
	];

	useEffect(() => {
		const verifyAccount = async () => {
			try {
				if (account.licenseDate) {
					const licenseDate = new Date(account.licenseDate);
					const today = new Date();

					if (licenseDate < today) {
						setError({
							message: "A data de licença já expirou.",
							subMessage: "Chame nosso suporte ou contrate um novo plano!",
						});
						return;
					}
				}

				if (!account.isLogin) {
					setError({
						message: "Você precisa fazer login para acessar o site.",
						subMessage: "Faça login e então acesse essa página",
					});
					return;
				} else {
					const exists = await checkIfAccountExists(account.email);
					if (!exists) {
						await chrome.storage.sync.clear();

						setError({
							message: "Você não possui uma conta válida.",
							subMessage:
								"Entre em contato com nosso suporte para mais informações.",
						});
						return;
					} else {
						setError(null);
					}
				}
			} catch (err) {
				console.log(err);
				setError({
					message: "Ocorreu um erro ao verificar sua conta.",
					subMessage: "Tente novamente mais tarde.",
				});
			} finally {
				setIsLoading(false);
			}
		};

		verifyAccount();

		const intervalId = setInterval(() => {
			verifyAccount();
		}, 2000);

		return () => clearInterval(intervalId);
	}, [account]);

	if (isLoading) {
		return (
			<main className="min-h-[calc(100vh_-_96px)] max-w-7xl w-full mx-auto px-8">
				<Spinner
					patternClassName="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
					className="!text-gray-500 m-auto dark:fill-gray-800 h-56 w-56"
				/>
			</main>
		);
	}

	if (error) {
		return (
			<ErrorMessage message={error.message} subMessage={error.subMessage} />
		);
	}

	return (
		<main className="min-h-[calc(100vh_-_96px)] max-w-7xl w-full mx-auto px-8">
			<div className="flex flex-col gap-y-px py-6">
				<h1 className="text-2xl font-bold">
					Bem vindo(a) ao Painel de Controle
				</h1>
				<span className="text-base">
					O que você deseja adicionar ou gerenciar?
				</span>
			</div>
			<div className="w-full flex gap-1 h-full">
				<ul className="flex flex-col gap-y-1 max-w-[256px] w-full">
					{itens.map((item, index) => (
						<Item
							key={index}
							color={item.color}
							isNotSelectColor="bg-gray-800"
							className={clsx("w-full rounded-lg transition-all group")}
							classNameButton="px-4 py-3 w-full flex items-center gap-x-3"
							setContent={setContentDashboard}
							contentDashboard={contentDashboard}
							content={item.content}
							icon={item.icon}
							title={item.title}
							index={index}
						/>
					))}
				</ul>
				<div className="flex-1 flex h-[404px]">{contentDashboard.content}</div>
			</div>
		</main>
	);
};

export default Dashboard;
