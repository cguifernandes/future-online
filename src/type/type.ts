export interface Midia {
	type?: "midias";
	title: string;
	id?: string;
	file: {
		url: string;
		subtitle: string;
		preview: string | undefined;
		type: "Imagem" | "Vídeo" | "";
	};
	delay?: number;
	databaseId?: string;
}

export interface Audio {
	type?: "audios";
	title: string;
	id?: string;
	audio: {
		url: string;
		preview: string;
	};
	delay?: number;
	databaseId?: string;
}

export interface Mensagem {
	type?: "mensagens";
	content: string;
	title: string;
	id?: string;
	delay?: number;
	databaseId?: string;
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
	databaseId?: string;
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
	databaseId?: string;
}

export interface StorageData {
	mensagens: Mensagem[];
	midias: Midia[];
	funis: Funil[];
	audios: Audio[];
	account: {
		isLogin: boolean;
		licenseDate: string | null;
		email: string | null;
	};
}

export interface Client {
	id: string;
	name?: string;
	email: string;
	phone: string;
	date: string;
}
