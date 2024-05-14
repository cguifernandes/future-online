// biome-ignore lint/style/useImportType: <explanation>
import React from "react";
import type { ReactNode } from "react";
import clsx from "clsx";

interface Props {
	title: string;
	icon: ReactNode;
	setContent: React.Dispatch<
		React.SetStateAction<{
			content: ReactNode;
			index: number;
		}>
	>;
	content: ReactNode;
	index: number;
	contentDashboard: {
		content: ReactNode;
		index: number;
	};
	className: string;
}

const Item = ({
	title,
	icon,
	content,
	setContent,
	index,
	contentDashboard,
	className,
}: Props) => {
	const isSelected = contentDashboard.index !== index;

	return (
		<li
			className={clsx(
				"w-full rounded-lg transition-all group",
				isSelected ? "bg-black/70" : className,
			)}
		>
			<button
				className="px-4 py-3 w-full flex items-center gap-x-3"
				type="button"
				onClick={() =>
					setContent({
						content,
						index,
					})
				}
			>
				<div className="p-2 rounded-lg transition-all bg-black/40 text-white">
					{icon}
				</div>
				<span className="text-base font-semibold text-white">{title}</span>
			</button>
		</li>
	);
};

export default Item;
