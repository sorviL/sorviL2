import type { CSSProperties, ReactNode } from "react";
import "./GradientText.scss";

type GradientTextProps = {
	children: ReactNode;
	colors?: string[];
	animationSpeed?: number;
	className?: string;
};

const DEFAULT_COLORS = [
	"var(--color-primary)",
	"var(--color-primary-dark)",
	"var(--color-primary)"
];

export function GradientText({
	children,
	colors = DEFAULT_COLORS,
	animationSpeed = 6,
	className
}: GradientTextProps) {
	const style = {
		"--gradient-text-colors": colors.join(", "),
		"--gradient-text-speed": `${animationSpeed}s`
	} as CSSProperties;

	const composedClassName = ["gradient-text", className].filter(Boolean).join(" ");

	return (
		<span className={composedClassName} style={style}>
			{children}
		</span>
	);
}
