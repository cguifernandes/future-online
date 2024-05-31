// biome-ignore lint/style/useImportType: <explanation>
import React from "react";
import Form from "../forms/form-item-funil";

const Modal = ({
	setVisibleModal,
}: { setVisibleModal: React.Dispatch<React.SetStateAction<boolean>> }) => {
	return (
		<div className="bg-[#4C4C4C] p-6 rounded-lg w-full max-w-5xl min-h-min absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
			<Form setVisibleModal={setVisibleModal} />
		</div>
	);
};

export default Modal;
