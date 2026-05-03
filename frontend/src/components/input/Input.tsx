import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import "./Input.scss";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
	endAdornment?: ReactNode;
	containerClassName?: string;
	ref?: Ref<HTMLInputElement>;
};

export function Input({
	label,
	endAdornment,
	containerClassName,
	id,
	className,
	ref,
	...rest
}: InputProps) {
	const generatedId = useId();
	const inputId = id ?? generatedId;

	const fieldClassName = ["input-field", containerClassName].filter(Boolean).join(" ");
	const elementClassName = ["input-element", className].filter(Boolean).join(" ");
	const controlClassName = endAdornment ? "input-control input-control-with-end" : "input-control";

	return (
		<div className={fieldClassName}>
			{label && (
				<label className="input-label" htmlFor={inputId}>
					{label}
				</label>
			)}
			<div className={controlClassName}>
				<input id={inputId} ref={ref} className={elementClassName} {...rest} />
				{endAdornment && <div className="input-end">{endAdornment}</div>}
			</div>
		</div>
	);
}
