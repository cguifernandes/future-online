import "./popup.css";
import Input from "../pages/components/input";
import { LayoutDashboard, LogOut, SquareKanban } from "lucide-react";
import Button from "../pages/components/button";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Logo from "../pages/components/logo";
import PasswordInput from "../pages/components/password-input";

const Popup = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isLogin, setIsLogin] = useState(false);

	const schema = z.object({
		email: z
			.string()
			.email("E-mail inválido, por favor digite um e-mail válido"),
		password: z
			.string({ required_error: "Este campo é obrigatório" })
			.min(1, "Este campo é obrigatório"),
	});

	const {
		handleSubmit,
		register,
		formState: { errors },
		reset,
	} = useForm<z.infer<typeof schema>>({
		reValidateMode: "onSubmit",
		resolver: zodResolver(schema),
	});

	useEffect(() => {
		chrome.storage.sync.get(null, (result) => {
			if (result.account?.isLogin) {
				setIsLogin(true);
			} else {
				setIsLogin(false);
			}
		});
	}, []);

	const login = async (formData: z.infer<typeof schema>) => {
		try {
			setIsLoading(true);
			const response = await fetch("https://futureonline.com.br/api/extesion", {
				method: "POST",
				body: JSON.stringify({
					email: formData.email,
					password: formData.password,
				}),
			});

			const data = (await response.json()) as {
				message: string;
				data: {
					logo: string | null;
					role: "client" | "whiteLabel";
					id: string;
					email: string;
					licenseDate: string;
				};
			};

			if (!response.ok) {
				setError(data.message ?? "Falha ao enviar formulário");
				return;
			}

			chrome.storage.sync.get(null, (result) => {
				const updatedItem = {
					...result,
					account: {
						...result.account,
						logo: data.data.logo,
						role: data.data.role,
						id: data.data.id,
						isLogin: true,
						email: data.data.email,
						licenseDate: new Date(
							new Date().setDate(new Date().getDate() - 1),
						).toISOString(),
					},
				};

				chrome.storage.sync.set(updatedItem, () => {
					setError("");
					setSuccess("Login efetuado com sucesso");

					setTimeout(() => {
						setIsLogin(true);
					}, 2000);

					chrome.tabs.query({}, (tabs) => {
						const extensionUrl = chrome.runtime.getURL("");

						tabs.forEach((tab) => {
							if (
								(tab.url && tab.url.startsWith(extensionUrl)) ||
								(tab.url && tab.url.startsWith("https://web.whatsapp.com/"))
							) {
								chrome.tabs.remove(tab.id);
							}
						});
					});
				});
			});
		} catch (e) {
			setError("Falha ao enviar formulário");
			console.log(e);
		} finally {
			setIsLoading(false);
			reset();
		}
	};

	const logout = () => {
		chrome.storage.sync.get(null, (result) => {
			const updatedItem = {
				...result,
				account: {
					...result.account,
					logo: null,
					role: null,
					id: null,
					email: null,
					isLogin: false,
				},
			};

			chrome.storage.sync.set(updatedItem, () => {
				setIsLogin(false);

				chrome.tabs.query({}, (tabs) => {
					const extensionUrl = chrome.runtime.getURL("");

					tabs.forEach((tab) => {
						if (
							(tab.url && tab.url.startsWith(extensionUrl)) ||
							(tab.url && tab.url.startsWith("https://web.whatsapp.com/"))
						) {
							chrome.tabs.remove(tab.id);
						}
					});
				});
			});
		});
	};

	return (
		<div className="w-full h-full gap-y-4 flex-col flex items-center justify-center">
			{isLogin ? (
				<>
					<Logo className="h-32 w-60" />
					<Button
						type="button"
						theme="solid"
						className="w-full flex items-center justify-between"
						onClick={() =>
							chrome.runtime.sendMessage({
								target: "new",
								url: "/pages/dashboard.html",
							})
						}
					>
						Abrir painel
						<LayoutDashboard size={22} />
					</Button>
					<Button
						type="button"
						theme="solid"
						className="w-full flex items-center justify-between"
						onClick={() =>
							chrome.runtime.sendMessage({
								target: "new",
								url: "/pages/crm.html",
							})
						}
					>
						CRM
						<SquareKanban size={22} />
					</Button>
					<Button
						type="button"
						theme="outline"
						className="w-full flex items-center justify-between"
						onClick={() => logout()}
					>
						Sair
						<LogOut size={22} />
					</Button>
				</>
			) : (
				<form
					onSubmit={handleSubmit(login)}
					className="flex flex-col gap-y-2 w-full"
				>
					<h1 className="text-white text-lg text-left">Faça Login</h1>
					<Input
						{...register("email")}
						disabled={isLoading}
						className="focus:ring-aqua-200"
						placeholder="E-mail"
						label="E-mail"
						type="email"
						error={errors.email?.message}
					/>
					<PasswordInput
						{...register("password")}
						disabled={isLoading}
						className="focus:ring-aqua-200"
						placeholder="Senha"
						label="Senha"
						error={errors.password?.message}
					/>
					{error && (
						<span className="text-red-600 text-sm text-center">{error}</span>
					)}
					{success && (
						<span className="text-green-600 text-sm text-center">
							{success}
						</span>
					)}
					<Button isLoading={isLoading} type="submit" theme="solid">
						Fazer login
					</Button>
				</form>
			)}
		</div>
	);
};

export default Popup;
