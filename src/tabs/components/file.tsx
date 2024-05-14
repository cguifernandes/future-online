import React from "react";

const File = () => {
	return (
		<div className="flex flex-col flex-1 justify-center border-dashed border-2 border-green-600 p-3 rounded-lg w-3/5 gap-y-2">
			<div className="flex flex-col text-center text-white gap-y-1">
				{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="64"
					height="64"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="lucide lucide-images mx-auto"
				>
					<path d="M18 22H4a2 2 0 0 1-2-2V6" />
					<path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" />
					<circle cx="12" cy="8" r="2" />
					<rect width="16" height="16" x="6" y="2" rx="2" />
				</svg>
				<label className="text-base font-semibold">
					Clique aqui ou arraste o arquivo a ser salvo
				</label>
			</div>
			<input id="input-file" type="file" className="hidden" />
			<label htmlFor="input-file" className="text-white text-center">
				Formatos aceitos: <br />
				Fotos: '.jpg', '.jpeg', '.png', '.svg' <br />
				Vídeos: '.m4v', '.mp4'
			</label>
		</div>
	);
};

export default File;
