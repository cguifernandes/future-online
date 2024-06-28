import { useState } from "react";
import Button from "../components/button";
import Input from "../components/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

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

	const handlerSubmitLogin = async (data: z.infer<typeof schema>) => {
		try {
			setIsLoading(true);

			if (
				data.email === process.env.ADMIN_EMAIL &&
				data.password === process.env.ADMIN_PASSWORD
			) {
				chrome.storage.sync.get(null, (result) => {
					const updatedItems = { ...result, isAdmin: true };

					if (!result.isAdmin) {
						chrome.storage.sync.set({ ...updatedItems });
					}

					toast.success(
						"Você será redirecionado para a tela de controle de acesso",
						{
							position: "bottom-right",
							className: "text-base ring-2 ring-[#1F2937]",
							duration: 5000,
						},
					);
					chrome.runtime.sendMessage({
						target: "current",
						url: "/panel.html",
					});
				});
			}
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
			className="flex flex-col gap-y-2 w-[520px] h-[280px]"
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
