import { useEffect, useState } from "react";
import SelectContacts from "../components/selectContacts";
import Textarea from "../components/textarea";
import { Mensagem, Trigger } from "../../type/type";
import Select from "../components/select";
import Input from "../components/input";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";

type Props = {
	register: UseFormRegister<any>;
	setValue: UseFormSetValue<any>;
	errors: any;
	contentItem: Trigger;
};

const SaveContacts = ({ register, errors, contentItem, setValue }: Props) => {
	const [options, setOptions] = useState<Mensagem[]>([]);
	const [selectedValue, setSelectedValue] = useState("");
	const [messageText, setMessageText] = useState("");

	useEffect(() => {
		setSelectedValue("");
		if (contentItem.trigger?.message) {
			setMessageText(contentItem.trigger?.message);
		} else {
			setMessageText("");
		}
	}, [contentItem]);

	useEffect(() => {
		chrome.storage.sync.get(
			"mensagens",
			(result: { mensagens: Mensagem[] }) => {
				setOptions(result.mensagens);
			},
		);
	}, []);

	return (
		<div className="flex-1 flex flex-col gap-y-3 h-full">
			{!messageText && (
				<Select
					className="w-full h-fit"
					label="Selecione uma mensagem já criada"
					options={options?.map((option) => ({
						title: option.title,
						id: option.id,
						content: option.content,
					}))}
					handleOnClick={(option) => {
						setSelectedValue(option.title);
						setValue("trigger.message", option.content);
					}}
					handleOnClickClear={() => {
						setSelectedValue("");
						setValue("trigger.message", "");
					}}
					error={
						errors.trigger?.message?.message ||
						errors.trigger?.message?.toString()
					}
				/>
			)}

			{selectedValue === "" && messageText === "" && (
				<span className="border-b border-white text-white text-sm w-full text-center">
					Ou
				</span>
			)}

			{!selectedValue && (
				<Textarea
					placeholder="Escreva a mensagem"
					label="Escreva a mensagem"
					className="w-full h-full min-h-32 max-h-44 flex-1"
					{...register("trigger.message", {
						onChange: (e) => {
							setMessageText(e.target.value);
							setValue("trigger.message", e.target.value);
						},
					})}
					error={
						errors.trigger?.message?.message ||
						errors.trigger?.message?.toString()
					}
				/>
			)}
			<SelectContacts
				className="w-full"
				label="Selecione os contatos"
				setValue={setValue}
				name="trigger.phones"
				defaultValue={contentItem.trigger?.phones}
				error={errors.trigger?.phones?.message}
			/>

			<div className="flex gap-x-2 w-full">
				<Input
					patternClassName="flex-1"
					type="number"
					placeholder="Valor do primeiro delay em segundos"
					label="Delay primeiro valor"
					{...register("trigger.delay.value1", {
						valueAsNumber: true,
					})}
					error={errors.trigger?.delay?.value1?.message}
				/>
				<Input
					patternClassName="flex-1"
					type="number"
					placeholder="Valor do segundo delay em segundos"
					label="Delay segundo valor"
					{...register("trigger.delay.value2", {
						valueAsNumber: true,
					})}
					error={errors.trigger?.delay?.value2?.message}
				/>
			</div>
		</div>
	);
};

export default SaveContacts;
