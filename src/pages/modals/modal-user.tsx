import { UserCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Client } from "../../type/type";
import toast from "react-hot-toast";

const ModalUser = ({ client }: { client: Client }) => {
	const [visibleModal, setVisibleModal] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);

	const handleToggleModal = () => {
		setVisibleModal((prev) => !prev);
	};

	const handleLogout = () => {
		chrome.storage.sync.get(null, (result) => {
			const updatedItem = { ...result, account: null };

			localStorage.removeItem("token");
			toast.success("Você saiu da sua conta com sucesso!", {
				position: "bottom-right",
				className: "text-base ring-2 ring-[#1F2937]",
				duration: 5000,
			});

			setTimeout(() => {
				chrome.runtime.sendMessage({
					target: "current",
					url: "/pages/dashboard.html",
				});
			}, 1000);

			window.location.reload();
			chrome.storage.sync.set(updatedItem);
		});
	};

	useEffect(() => {
		document.addEventListener("mousedown", (event) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				setVisibleModal(false);
			}
		});

		return () => {
			document.removeEventListener("mousedown", () => {
				setVisibleModal((prev) => !prev);
			});
		};
	}, []);

	return (
		<div className="relative flex items-center">
			<button onClick={handleToggleModal} type="button">
				<UserCircle color="#fff" size={26} />
			</button>
			{visibleModal && (
				<div
					ref={modalRef}
					className="absolute mt-2 top-full bg-white rounded-lg shadow-xl right-0 w-60"
				>
					<ul className="flex flex-col gap-y-px">
						<li className="p-2 text-sm truncate transition-colors">
							{client.name ?? client.email}
						</li>
						<div className="w-full h-px bg-[#ddd]" />
						<li className="text-sm transition-colors hover:bg-[#ececec]">
							<button
								onClick={() =>
									chrome.runtime.sendMessage({
										target: "current",
										url: `/pages/config.html?client_id=${client.id}`,
									})
								}
								type="button"
								className="p-2 text-start w-full"
							>
								Trocar a senha
							</button>
						</li>
						<li className="text-sm transition-colors hover:bg-[#ececec]">
							<button
								onClick={() => handleLogout()}
								type="button"
								className="p-2 text-start w-full"
							>
								Sair da conta
							</button>
						</li>
					</ul>
				</div>
			)}
		</div>
	);
};

export default ModalUser;
