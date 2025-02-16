import { useCallback, useEffect, useRef, useState } from 'react';

import { useExplorerContext } from '../Context';
import { getExplorerStore } from '../store';

/**
 * Custom explorer dnd scroll handler as the default auto-scroll from dnd-kit is presenting issues
 */
export const useDragScrollable = ({ direction }: { direction: 'up' | 'down' }) => {
	const explorer = useExplorerContext();

	const [node, setNode] = useState<HTMLElement | null>(null);

	const timeout = useRef<NodeJS.Timeout | null>(null);
	const interval = useRef<NodeJS.Timer | null>(null);

	useEffect(() => {
		const element = node;
		const scrollElement = explorer.scrollRef.current;
		if (!element || !scrollElement) return;

		const reset = () => {
			if (timeout.current) {
				clearTimeout(timeout.current);
				timeout.current = null;
			}

			if (interval.current) {
				clearInterval(interval.current);
				interval.current = null;
			}
		};

		const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
			if (getExplorerStore().drag?.type !== 'dragging') return reset();

			const rect = element.getBoundingClientRect();

			const isInside =
				clientX >= rect.left &&
				clientX <= rect.right &&
				clientY >= rect.top &&
				clientY <= rect.bottom;

			if (!isInside) return reset();

			if (timeout.current) return;

			timeout.current = setTimeout(() => {
				interval.current = setInterval(() => {
					scrollElement.scrollBy({ top: direction === 'up' ? -10 : 10 });
				}, 5);
			}, 1000);
		};

		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mouseover', handleMouseMove);
	}, [direction, explorer.scrollRef, node]);

	const ref = useCallback((nodeElement: HTMLElement | null) => setNode(nodeElement), []);

	return { ref };
};
