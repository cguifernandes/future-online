export type Midia = {
	type?: "midias";
	title: string;
	id?: string;
	file: {
		url: string;
		subtitle: string;
		preview: string | undefined;
		type: "Imagem" | "Vídeo" | "Documento" | "";
	};
	delay?: number;
};

export type Audio = {
	type?: "audios";
	title: string;
	id?: string;
	audio: {
		url: string;
		preview: string;
	};
	delay?: number;
};

export type Tabs = {
	name: string;
	contacts: Contact[];
};

export type Contact = {
	name: string;
	pfp: string;
	phone: string;
};

export type Mensagem = {
	type?: "mensagens";
	content: string;
	title: string;
	id?: string;
	delay?: number;
};

export type Funil = {
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
};

export type Gatilho = {
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
};

export type StorageData = {
	mensagens: Mensagem[];
	midias: Midia[];
	funis: Funil[];
	audios: Audio[];
	gatilhos: Gatilho[];
	account: {
		isLogin: boolean;
		licenseDate: string | null;
		email: string | null;
	};
	tabs: Tabs[];
};

export type ClientResponse = {
	data: Client;
	message: string;
	status: number;
	token: string;
};

export type Client = {
	audios?: Audio[];
	date: string;
	email: string;
	funis?: Funil[];
	gatilhos?: Gatilho[];
	id: string;
	mensagens?: Mensagem[];
	midias?: Midia[];
	name: string;
	password: string;
	phone: string;
	role?: "admin" | "user";
};
