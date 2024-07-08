import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Input from "../components/input";
import Button from "../components/button";
import toast from "react-hot-toast";
import { ChevronLeft } from "lucide-react";
import { url } from "../../utils/utils";

const ConfirmPassword = ({
	setStepperIndex,
	setPassword,
	clientId,
}: {
	setStepperIndex: Dispatch<SetStateAction<number>>;
	setPassword: Dispatch<SetStateAction<string>>;
	clientId: string;
}) => {
	const schema = z
		.object({
			password: z.string().min(1, "Este campo é obrigatório"),
			confirmPassword: z
				.string({ required_error: "Este campo é obrigatório" })
				.min(1, "Este campo é obrigatório"),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "As senhas não correspondem",
			path: ["confirmPassword"],
		});

	const {
		handleSubmit,
		register,
		formState: { errors },
	} = useForm<z.infer<typeof schema>>({
		reValidateMode: "onSubmit",
		resolver: zodResolver(schema),
	});

	const handlerSubmitChangePassword = async (
		formData: z.infer<typeof schema>,
	) => {
		try {
			const response = await fetch(
				`${url}/api/client/authenticate?password=${formData.password}&identifier=${clientId}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			const data = await response.json();

			if (response.status >= 400 && response.status < 600) {
				toast.error(data.message ?? "Ocorreu um erro ao trocar a senha", {
					position: "bottom-right",
					className: "text-base ring-2 ring-[#1F2937]",
					duration: 5000,
				});
				return;
			}

			setStepperIndex(1);
			setPassword(formData.password);
		} catch (error) {
			console.log(error);
			toast.error("Ocorreu um erro ao enviar o formulário", {
				position: "bottom-right",
				className: "text-base ring-2 ring-[#1F2937]",
				duration: 5000,
			});
		}
	};

	return (
		<form
			onSubmit={handleSubmit(handlerSubmitChangePassword)}
			className="flex flex-col gap-y-2 w-[520px] min-h-[280px]"
		>
			<h1 className="text-2xl text-white font-bold">
				Formulário de alteração de senha
			</h1>
			<div className="flex flex-col my-auto gap-y-6">
				<Input
					error={errors?.password?.message}
					{...register("password")}
					type="password"
					label="Senha"
					maxLength={11}
					placeholder="Digite sua senha"
				/>
				<Input
					error={errors?.confirmPassword?.message}
					{...register("confirmPassword")}
					type="password"
					maxLength={11}
					label="Confirme sua senha"
					placeholder="Digite novamente sua senha"
				/>
			</div>
			<Button type="submit" theme="solid">
				Enviar formulário
			</Button>
		</form>
	);
};

const NewPassword = ({
	setStepperIndex,
	password,
	clientId,
}: {
	setStepperIndex: Dispatch<SetStateAction<number>>;
	password: string;
	clientId: string;
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const schema = z.object({
		password: z.string().min(1, "Este campo é obrigatório"),
	});

	const {
		handleSubmit,
		register,
		formState: { errors },
	} = useForm<z.infer<typeof schema>>({
		reValidateMode: "onSubmit",
		resolver: zodResolver(schema),
	});

	const handlerSubmitNewPassword = async (formData: z.infer<typeof schema>) => {
		try {
			setIsLoading(true);

			const response = await fetch(`${url}/api/client?id=${clientId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					password,
					newPassword: formData.password,
				}),
			});

			const data = await response.json();

			if (response.status >= 400 && response.status < 600) {
				toast.error(data.message ?? "Ocorreu um erro ao trocar a senha", {
					position: "bottom-right",
					className: "text-base ring-2 ring-[#1F2937]",
					duration: 5000,
				});
				return;
			}

			toast.success(data.message ?? "Senha alterada com sucesso!", {
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
			onSubmit={handleSubmit(handlerSubmitNewPassword)}
			className="flex flex-col gap-y-2 w-[520px] min-h-[280px]"
		>
			<div className="flex items-center gap-x-2">
				<button onClick={() => setStepperIndex(0)} type="button">
					<ChevronLeft size={22} color="#fff" />
				</button>
				<h1 className="text-2xl text-white font-bold">
					Formulário de alteração de senha
				</h1>
			</div>
			<div className="flex flex-col my-auto gap-y-6">
				<Input
					error={errors?.password?.message}
					{...register("password")}
					type="password"
					label="Nova senha"
					maxLength={11}
					placeholder="Digite sua nova senha"
				/>
			</div>
			<Button isLoading={isLoading} type="submit" theme="solid">
				Enviar formulário
			</Button>
		</form>
	);
};

const Form = ({ clientId }: { clientId: string }) => {
	const [password, setPassword] = useState<string | null>(null);
	const [stepperIndex, setStepperIndex] = useState(0);

	if (stepperIndex === 0) {
		return (
			<ConfirmPassword
				setPassword={setPassword}
				setStepperIndex={setStepperIndex}
				clientId={clientId}
			/>
		);
	}

	return (
		<NewPassword
			clientId={clientId}
			password={password}
			setStepperIndex={setStepperIndex}
		/>
	);
};

export default Form;
