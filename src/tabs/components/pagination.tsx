import { ChevronUp } from "lucide-react";
import type { Dispatch } from "react";

interface Props {
	setPage: Dispatch<React.SetStateAction<number>>;
	page: number;
	totalPages: number;
	notFoundPages?: boolean;
}

const Pagination = ({ page, notFoundPages, setPage, totalPages }: Props) => {
	return (
		<div className="text-sm gap-x-2 flex items-center font-medium text-white">
			<button
				type="button"
				disabled={!notFoundPages ?? page === 1}
				onClick={() => setPage(page - 1)}
				className="flex items-center justify-center size-5 disabled:opacity-30 disabled:cursor-not-allowed"
			>
				<ChevronUp className="-rotate-90" />
			</button>
			{page}
			<button
				disabled={!notFoundPages ?? page === totalPages}
				type="button"
				onClick={() => setPage(page + 1)}
				className="flex items-center justify-center size-5 disabled:opacity-30 disabled:cursor-not-allowed"
			>
				<ChevronUp className="rotate-90" />
			</button>
		</div>
	);
};

export default Pagination;
