import type { ReactNode } from "react";
import clsx from "clsx";
import type { UseFormSetValue } from "react-hook-form";

interface Props {
	title?: string;
	icon?: ReactNode;
	classNameButton?: string;
	setContent?: React.Dispatch<
		React.SetStateAction<{
			content: ReactNode;
			index: number;
			title?: string;
		}>
	>;
	setValue?: UseFormSetValue<any>;
	name?: string;
	content?: ReactNode;
	index: number;
	contentDashboard: {
		content?: ReactNode;
		index: number;
		title?: string;
	};
	className: string;
	color: string;
	isNotSelectColor: string;
	children?: ReactNode;
}

const Item = ({
	title,
	icon,
	content,
	setContent,
	index,
	contentDashboard,
	classNameButton,
	color,
	setValue,
	name,
	className,
	children,
	isNotSelectColor,
}: Props) => {
	const isSelected = contentDashboard.index !== index;

	return (
		<li className={clsx(className, isSelected ? isNotSelectColor : color)}>
			<button
				className={classNameButton}
				type="button"
				onClick={() => {
					if (setValue && name) {
						setValue(name, title);
					}

					setContent({
						content,
						index,
						title,
					});
				}}
			>
				{children ? (
					children
				) : (
					<>
						<div className="p-2 rounded-lg transition-all bg-gray-900/80 text-white">
							{icon}
						</div>
						<span className="text-base font-semibold text-white">{title}</span>
					</>
				)}
			</button>
		</li>
	);
};

export default Item;
