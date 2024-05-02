import React from "react";
import "./Toolbar.css";
import { trpc } from "../utils/trpc";
import useLocalStorage from "../hooks/useLocalStorage";
import { useQueryClient } from "@tanstack/react-query";

const Toolbar = ({ screen = "" }) => {
	const { setItem } = useLocalStorage();
	const queryClient = useQueryClient();

	const userQuery = trpc.public.getMe.useQuery(undefined);
	const user = userQuery.data;

	const logoutMutation = trpc.protected.logout.useMutation({
		onSuccess: () => {
			setItem("jwt_token", null);
			queryClient.invalidateQueries();
		},
	});

	const logout = () => {
		logoutMutation.mutate();
	};

	return (
		<div className="Toolbar">
			<img src="./vite.svg" alt="logo" />
			<span>ChessFront</span>
			<h3>{screen}</h3>
			<div className="ToolbarActions">
				<span>Hello {user?.pseudo}</span>
				<button type="button" onClick={logout}>
					Déconnexion
				</button>
			</div>
		</div>
	);
};

export default Toolbar;
