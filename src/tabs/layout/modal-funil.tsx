import Form from "../forms/form-item-funil";
import type { Funil } from "../../type/type";

interface Props {
	setVisibleModal: React.Dispatch<React.SetStateAction<boolean>>;
	content: Funil;
	setData: React.Dispatch<
		React.SetStateAction<{
			itens: Funil[];
		}>
	>;
	setContentItem: React.Dispatch<React.SetStateAction<Funil>>;
}

const Modal = ({
	setVisibleModal,
	content,
	setContentItem,
	setData,
}: Props) => {
	return (
		<div className="bg-[#4C4C4C] p-6 rounded-lg w-full max-w-5xl min-h-min absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
			<Form
				setContentItem={setContentItem}
				setData={setData}
				content={content}
				setVisibleModal={setVisibleModal}
			/>
		</div>
	);
};

export default Modal;
