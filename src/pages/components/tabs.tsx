import { ReactNode, useEffect, useState } from "react";
import { Trigger } from "../../type/type";

type Props = {
	tabs: string[];
	contents: ReactNode[];
	onChange: (tab: string) => void;
	contentItem?: Trigger;
};

const Tabs = ({ contents, tabs, contentItem, onChange }: Props) => {
	const [activeTab, setActiveTab] = useState(0);

	useEffect(() => {
		if (contentItem) {
			const index = tabs.indexOf(contentItem.trigger?.type);
			if (index !== -1) {
				setActiveTab(index);
			}
		}
	}, [contentItem, tabs]);

	return (
		<div className="flex gap-y-3 flex-col">
			<div className="flex items-center p-3 w-full justify-between gap-x-2 rounded-lg bg-gray-900">
				{tabs.map((tab, index) => (
					<button
						key={index}
						type="button"
						onClick={() => {
							setActiveTab(index);
							onChange(tab);
						}}
						className={`text-sm text-white flex-1 transition-all px-2 py-3 rounded-xl ${
							activeTab === index && "bg-gray-700"
						}`}
					>
						{tab}
					</button>
				))}
			</div>
			{contents[activeTab]}
		</div>
	);
};

export default Tabs;
