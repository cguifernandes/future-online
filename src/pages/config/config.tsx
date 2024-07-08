import Form from "../forms/form-change-password";

const Admin = ({ clientId }: { clientId: string }) => {
	return (
		<main className="w-full min-h-screen flex items-center justify-center">
			<div className="bg-black/70 p-5 rounded-lg">
				<Form clientId={clientId} />
			</div>
		</main>
	);
};

export default Admin;
