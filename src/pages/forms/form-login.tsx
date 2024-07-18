import { useState } from "react";
import Button from "../components/button";
import Input from "../components/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { url } from "../../utils/utils";
import { ClientResponse } from "../../type/type";

const Form = () => {
	const [isLoading, setIsLoading] = useState(false);

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
	} = useForm<z.infer<typeof schema>>({
		reValidateMode: "onSubmit",
		resolver: zodResolver(schema),
	});

	const handlerSubmitLogin = async (formData: z.infer<typeof schema>) => {
		try {
			setIsLoading(true);

			const response = await fetch(
				`${url}/api/client/authenticate?password=${formData.password}&identifier=${formData.email}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			const data = (await response.json()) as ClientResponse;

			if (response.status >= 400 && response.status < 600) {
				toast.error(data.message ?? "Ocorreu um erro ao fazer o login", {
					position: "bottom-right",
					className: "text-base ring-2 ring-[#1F2937]",
					duration: 5000,
				});
				return;
			}

			if (data?.data.role === "admin") {
				toast.success(data.message ?? "Login realizado com sucesso", {
					position: "bottom-right",
					className: "text-base ring-2 ring-[#1F2937]",
					duration: 5000,
				});

				localStorage.setItem("token", data.token);

				setTimeout(() => {
					chrome.runtime.sendMessage({
						target: "current",
						url: "/pages/panel.html",
					});
				}, 1000);

				return;
			}

			const addTypeToArray = (items: any[], type: string) => {
				return items ? items.map((item) => ({ ...item, type })) : [];
			};

			const updatedItem = {
				audios: addTypeToArray(data.data.audios, "audios"),
				funis: addTypeToArray(data.data.funis, "funis"),
				gatilhos: addTypeToArray(data.data.gatilhos, "gatilhos"),
				mensagens: addTypeToArray(data.data.mensagens, "mensagens"),
				midias: addTypeToArray(data.data.midias, "midias"),
				account: {
					isLogin: true,
					licenseDate: data.data.date,
					email: data.data.email,
				},
			};

			localStorage.setItem("token", data.token);
			await chrome.storage.sync.set(updatedItem);

			toast.success(data.message ?? "Login realizado com sucesso", {
				position: "bottom-right",
				className: "text-base ring-2 ring-[#1F2937]",
				duration: 5000,
			});

			setTimeout(() => {
				chrome.runtime.sendMessage({
					target: "current",
					url: "/pages/dashboard.html",
				});
			}, 1000);
		} catch (error) {
			console.log(error);
			toast.error("Ocorreu um erro ao enviar o formulário", {
				position: "bottom-right",
				className: "text-base ring-2 ring-[#1F2937]",
				duration: 5000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(handlerSubmitLogin)}
			className="flex flex-col gap-y-2 w-[520px] min-h-[280px]"
		>
			<h1 className="text-2xl text-white font-bold">Formulário de login</h1>
			<div className="flex flex-col my-auto gap-y-6">
				<Input
					error={errors?.email?.message}
					{...register("email")}
					label="E-mail"
					placeholder="Digite o e-mail"
				/>
				<Input
					error={errors?.password?.message}
					{...register("password")}
					type="password"
					maxLength={11}
					label="Senha"
					placeholder="Digite a senha"
				/>
			</div>
			<Button isLoading={isLoading} type="submit" theme="solid">
				Enviar formulário
			</Button>
		</form>
	);
};

export default Form;
