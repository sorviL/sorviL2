import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

export interface SplitTextProps {
	text: string;
	className?: string;
	delay?: number;
	duration?: number;
	ease?: string | ((t: number) => number);
	splitType?: "chars" | "words" | "lines" | "words, chars";
	from?: gsap.TweenVars;
	to?: gsap.TweenVars;
	threshold?: number;
	rootMargin?: string;
	tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
	textAlign?: React.CSSProperties["textAlign"];
	onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
	text,
	className = "",
	delay = 50,
	duration = 1.25,
	ease = "power3.out",
	splitType = "chars",
	from = { opacity: 0, y: 40 },
	to = { opacity: 1, y: 0 },
	threshold = 0.1,
	rootMargin = "-100px",
	textAlign = "center",
	tag = "p",
	onLetterAnimationComplete
}) => {
	const ref = useRef<HTMLParagraphElement>(null);
	const animationCompletedRef = useRef(false);
	const onCompleteRef = useRef(onLetterAnimationComplete);
	const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

	useEffect(() => {
		onCompleteRef.current = onLetterAnimationComplete;
	}, [onLetterAnimationComplete]);

	useEffect(() => {
		if (document.fonts.status === "loaded") {
			setFontsLoaded(true);
		} else {
			document.fonts.ready.then(() => {
				setFontsLoaded(true);
			});
		}
	}, []);

	return null;
};

export default SplitText;
