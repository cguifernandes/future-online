export interface Midia {
	type?: "midias";
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
	type?: "mensagens";
	content: string;
	title: string;
	id?: string;
}

export interface Funil {
	type?: "funis";
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

export interface Gatilho {
	type?: "gatilhos";
	title: string;
	active: boolean;
	delay: number;
	saveContacts: boolean;
	sendGroups: boolean;
	ignoreCase: boolean;
	keywords: string[];
	funil?: {
		id?: string;
		name?: string;
	};
	id?: string;
}
