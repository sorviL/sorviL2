import React, { useRef } from "react";
import { Input } from "../../input/Input";
import "./ChatInputBar.scss";

type ChatInputBarProps = {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (value: string) => void;
	placeholder?: string;
	autoFocus?: boolean;
	disabled?: boolean;
	loading?: boolean;
};

export function ChatInputBar({
	value,
	onChange,
	onSubmit,
	placeholder = "Digite uma mensagem...",
	autoFocus,
	disabled,
	loading = false
}: ChatInputBarProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const trimmed = value.trim();
	const canSend = trimmed.length > 0 && !disabled && !loading;

	function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!canSend) return;
		onSubmit(trimmed);
		requestAnimationFrame(() => inputRef.current?.focus());
	}

	return (
		<form className="chat-input-bar" onSubmit={handleSubmit}>
			<Input
				type="text"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				autoFocus={autoFocus}
				disabled={disabled}
				autoComplete="off"
				containerClassName="chat-input-bar-field"
				aria-label="Mensagem para a Lia"
				ref={inputRef}
				endAdornment={
					<button
						type="submit"
						className={`chat-input-bar-send${loading ? " chat-input-bar-send-loading" : ""}`}
						aria-label={loading ? "Enviando..." : "Enviar mensagem"}
						disabled={!canSend}
					>
						{loading ? (
							<span className="chat-input-bar-spinner" />
						) : (
							<span className="material-icons" aria-hidden="true">arrow_upward</span>
						)}
					</button>
				}
			/>
		</form>
	);
}
