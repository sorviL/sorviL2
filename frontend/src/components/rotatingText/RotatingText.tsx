import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import {
    motion,
    AnimatePresence,
    type Transition,
    type VariantLabels,
    type Target,
    type TargetAndTransition
} from 'motion/react';

import './RotatingText.css';

function cn(...classes: (string | undefined | null | boolean)[]): string {
    return classes.filter(Boolean).join(' ');
}

export interface RotatingTextRef {
    next: () => void;
    previous: () => void;
    jumpTo: (index: number) => void;
    reset: () => void;
}

export interface RotatingTextProps
    extends Omit<
        React.ComponentPropsWithoutRef<typeof motion.span>,
        'children' | 'transition' | 'initial' | 'animate' | 'exit'
    > {
    texts: string[];
    transition?: Transition;
    initial?: boolean | Target | VariantLabels;
    animate?: boolean | VariantLabels | TargetAndTransition;
    exit?: Target | VariantLabels;
    animatePresenceMode?: 'sync' | 'wait';
    animatePresenceInitial?: boolean;
    rotationInterval?: number;
    staggerDuration?: number;
    staggerFrom?: 'first' | 'last' | 'center' | 'random' | number;
    loop?: boolean;
    auto?: boolean;
    splitBy?: string;
    onNext?: (index: number) => void;
    mainClassName?: string;
    splitLevelClassName?: string;
    elementLevelClassName?: string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>((props, ref) => {
    const {
        texts,
        transition = { type: 'spring', damping: 25, stiffness: 300 },
        initial = { y: '100%', opacity: 0 },
        animate = { y: 0, opacity: 1 },
        exit = { y: '-120%', opacity: 0 },
        animatePresenceMode = 'wait',
        animatePresenceInitial = false,
        rotationInterval = 2000,
        staggerDuration = 0,
        staggerFrom = 'first',
        loop = true,
        auto = true,
        splitBy = 'characters',
        onNext,
        mainClassName,
        splitLevelClassName,
        elementLevelClassName,
        ...rest
    } = props;

    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);

    const splitIntoCharacters = (text: string): string[] => {
        if (typeof Intl !== 'undefined' && Intl.Segmenter) {
            const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
            return Array.from(segmenter.segment(text), segment => segment.segment);
        }
        return Array.from(text);
    };

    const elements = useMemo(() => {
        const currentText: string = texts[currentTextIndex];
        if (splitBy === 'characters') {
            const words = currentText.split(' ');
            return words.map((word, i) => ({
                characters: splitIntoCharacters(word),
                needsSpace: i !== words.length - 1
            }));
        }
        if (splitBy === 'words') {
            return currentText.split(' ').map((word, i, arr) => ({
                characters: [word],
                needsSpace: i !== arr.length - 1
            }));
        }
        if (splitBy === 'lines') {
            return currentText.split('\n').map((line, i, arr) => ({
                characters: [line],
                needsSpace: i !== arr.length - 1
            }));
        }

        return currentText.split(splitBy).map((part, i, arr) => ({
            characters: [part],
            needsSpace: i !== arr.length - 1
        }));
    }, [texts, currentTextIndex, splitBy]);

    const getStaggerDelay = useCallback(
        (index: number, totalChars: number): number => {
            const total = totalChars;
            if (staggerFrom === 'first') return index * staggerDuration;
            if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration;
            if (staggerFrom === 'center') {
                const center = Math.floor(total / 2);
                return Math.abs(center - index) * staggerDuration;
            }
            if (staggerFrom === 'random') {
                const randomIndex = Math.floor(Math.random() * total);
                return Math.abs(randomIndex - index) * staggerDuration;
            }
            return Math.abs((staggerFrom as number) - index) * staggerDuration;
        },
        [staggerFrom, staggerDuration]
    );

    return (
        <motion.span className={cn('rotating-text', mainClassName)} {...rest} layout transition={transition}>
            <span className="rotating-text-sr-only">{texts[currentTextIndex]}</span>
        </motion.span>
    );
});

RotatingText.displayName = 'RotatingText';
export default RotatingText;
