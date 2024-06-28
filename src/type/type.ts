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
	delay?: number;
}

export interface Audio {
	type?: "audios";
	title: string;
	id?: string;
	audio: {
		url: string;
		fileName: string;
	};
	delay?: number;
}

export interface Mensagem {
	type?: "mensagens";
	content: string;
	title: string;
	id?: string;
	delay?: number;
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
	keywords?: {
		key?: string[];
		type?: {
			value?: "equals" | "contains" | "startsWith" | "notContains" | "";
			name?:
				| "A mensagem é igual a"
				| "A mensagem contém (alguma)"
				| "A mensagem começa com (alguma)"
				| "A mensagem não contém (nenhuma)"
				| "";
		};
	};
	funil?: {
		id?: string;
		name?: string;
	};
	id?: string;
}

export interface Client {
	id: string;
	name?: string;
	email: string;
	phone: string;
	date: Date;
}
