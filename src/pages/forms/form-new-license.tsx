import { useForm } from "react-hook-form";
import Button from "../components/button";
import Input from "../components/input";
import Mask from "../components/mask";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { url } from "../../utils/utils";
import toast from "react-hot-toast";

const Form = () => {
	const [isLoading, setIsLoading] = useState(false);

	const schema = z.object({
		name: z
			.string()
			.nullable()
			.transform((value) => (value === "" ? null : value)),
		email: z
			.string()
			.min(1, "Este campo é obrigatório")
			.email("E-mail inválido, por favor digite um e-mail válido"),
		phone: z
			.string()
			.min(1, "Este campo é obrigatório")
			.min(14, "Campo de telefone inválido"),
		date: z.preprocess(
			(arg) => {
				if (typeof arg === "string" || arg instanceof Date) {
					const date = new Date(arg);
					return isNaN(date.getTime()) ? null : date;
				}
				return null;
			},
			z
				.date()
				.nullable()
				.refine((date) => date !== null, {
					message: "Este campo é obrigatório",
				})
				.refine((date) => date?.getFullYear() <= 9999, "Data inválida"),
		),
	});

	const {
		handleSubmit,
		register,
		control,
		formState: { errors },
	} = useForm<z.infer<typeof schema>>({
		reValidateMode: "onSubmit",
		resolver: zodResolver(schema),
		defaultValues: {
			name: null,
		},
	});

	const handlerSubmitNewLicense = async (formData: z.infer<typeof schema>) => {
		try {
			setIsLoading(true);
			const response = await fetch(`${url}/api/client`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (response.status >= 400 && response.status < 600) {
				toast.error(data.message, {
					position: "bottom-right",
					className: "text-base ring-2 ring-[#1F2937]",
					duration: 5000,
				});
				return;
			}

			toast.success(data.message, {
				position: "bottom-right",
				className: "text-base ring-2 ring-[#1F2937]",
				duration: 5000,
			});

			setTimeout(() => {
				chrome.runtime.sendMessage({
					target: "current",
					url: "/pages/panel.html",
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
			onSubmit={handleSubmit(handlerSubmitNewLicense)}
			className="flex flex-col space-y-3"
		>
			<Input
				error={errors?.name?.message}
				theme="dark-blue"
				maxLength={48}
				label="Nome"
				labelClassName="!text-black"
				placeholder="Digite o nome do cliente"
				{...register("name")}
			/>
			<Input
				error={errors?.email?.message}
				theme="dark-blue"
				label="E-mail *"
				labelClassName="!text-black"
				placeholder="Digite o e-mail do cliente"
				{...register("email")}
			/>
			<Mask
				error={errors?.phone?.message}
				label="Telefone Whatsapp *"
				labelClassName="!text-black"
				control={control}
				name="phone"
			/>
			<Input
				labelClassName="!text-black"
				error={errors?.date?.message}
				type="date"
				theme="dark-blue"
				label="Data final da licença *"
				{...register("date", {
					valueAsDate: true,
				})}
			/>
			<Button isLoading={isLoading} theme="solid" type="submit">
				Enviar formulário
			</Button>
		</form>
	);
};

export default Form;
