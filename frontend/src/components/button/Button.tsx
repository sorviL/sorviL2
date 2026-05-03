import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import "./Button.scss";

type ButtonColors = {
	bg?: string;
	color?: string;
	border?: string;
	hoverBg?: string;
	activeBg?: string;
};

type ButtonProps = {
	label?: string;
	icon?: string;
	colors?: ButtonColors;
	to?: string;
	onClick?: () => void;
	className?: string;
	children?: ReactNode;
	disabled?: boolean;
	type?: "button" | "submit" | "reset";
};

export function Button({
	label,
	icon,
	colors,
	to,
	onClick,
	className,
	children,
	disabled = false,
	type = "button"
}: ButtonProps) {
	const composedClassName = ["btn", className].filter(Boolean).join(" ");

	const style = colors
		? ({
				"--btn-bg": colors.bg,
				"--btn-color": colors.color,
				"--btn-border": colors.border,
				"--btn-hover-bg": colors.hoverBg,
				"--btn-active-bg": colors.activeBg
			} as CSSProperties)
		: undefined;

	const content = (
		<>
			{icon && <span className="material-icons btn-icon">{icon}</span>}
			{label && <span className="btn-label">{label}</span>}
			{children}
		</>
	);

	if (to) {
		return (
			<Link to={to} className={composedClassName} style={style}>
				{content}
			</Link>
		);
	}

	return (
		<button
			type={type}
			className={composedClassName}
			onClick={onClick}
			disabled={disabled}
			style={style}
		>
			{content}
		</button>
	);
}
