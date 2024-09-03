import { Plus } from "lucide-react";
import Input from "../components/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Contact, Tabs } from "../../type/type";
import { Dispatch } from "react";

interface Props {
	setTabs: Dispatch<React.SetStateAction<Tabs[]>>;
}

const Form = ({ setTabs }: Props) => {
	const schema = z.object({
		tabName: z.string().min(1, "Este campo é obrigátorio"),
	});

	const {
		handleSubmit,
		register,
		reset,
		formState: { errors },
	} = useForm<z.infer<typeof schema>>({
		reValidateMode: "onSubmit",
		resolver: zodResolver(schema),
	});

	const handlerSubmit = async (formData: z.infer<typeof schema>) => {
		chrome.storage.sync.get("tabs", (result: { tabs: Tabs[] }) => {
			const existingTabs = result.tabs || [];

			const tabExists = existingTabs.some(
				(tab) => tab.name === formData.tabName,
			);

			if (tabExists) {
				toast.error("Já existe uma aba com este nome", {
					position: "bottom-right",
					className: "text-base ring-2 ring-[#1F2937]",
					duration: 5000,
				});
				return;
			}

			const newTab = {
				name: formData.tabName,
				contacts: [] as Contact[],
			};

			const updatedTabs = [...existingTabs, newTab];

			const updatedItems = { ...result, tabs: updatedTabs };

			chrome.storage.sync.set(updatedItems, () => {
				setTabs(updatedTabs);
				reset();
			});
		});
	};

	return (
		<form
			onSubmit={handleSubmit(handlerSubmit)}
			className="flex gap-x-2 items-end max-w-sm"
		>
			<Input
				labelClassName="!text-black"
				placeholder="Digite o nome de uma nova aba"
				className="!bg-transparent !text-black !ring-2 !ring-gray-800"
				label="Crie uma nova aba"
				patternClassName="flex-1"
				maxLength={32}
				{...register("tabName")}
				error={errors.tabName?.message}
			/>
			<button
				type="submit"
				style={{
					margin: errors.tabName ? "auto 0px" : "",
				}}
				className="transition-all rounded-lg flex items-center justify-center bg-gray-800 size-[46px] hover:bg-gray-700"
			>
				<Plus color="#fff" size={22} />
			</button>
		</form>
	);
};

export default Form;
