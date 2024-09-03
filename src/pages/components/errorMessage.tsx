export const ErrorMessage = ({
	message,
	subMessage,
}: { message: string; subMessage?: string }) => {
	return (
		<main className="min-h-[calc(100vh_-_96px)] max-w-7xl w-full mx-auto px-8">
			<div className="flex flex-col gap-y-px py-6">
				<h1 className="text-2xl font-bold">{message}</h1>
				{subMessage && (
					<span className="text-base text-black/7 0">{subMessage}</span>
				)}
			</div>
		</main>
	);
};
