export interface Midia {
	type?: "midia";
	title: string;
	id?: string;
	image: {
		url: string;
		subtitle: string;
		preview: string;
		type: "Imagem" | "Vídeo" | "";
	};
}

export interface Message {
	type?: "message";
	content: string;
	title: string;
	id?: string;
}
