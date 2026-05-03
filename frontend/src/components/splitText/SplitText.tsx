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

export default function SplitText() {
	return null;
}
