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

export interface Mensagem {
	type?: "message";
	content: string;
	title: string;
	id?: string;
}

export interface Funil {
	type?: "funil";
	title: string;
	item: {
		selectedId: string;
		type: "Mensagens" | "Mídias" | "";
		delay: {
			minutes: number;
			seconds: number;
		};
	}[];
	id?: string;
}
