'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

type Option = { value: string; label: string };
type Props = {
  id: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
  hideLabel?: boolean;
};

/** Select-only combobox. Keep drawer menus inside their native modal's focus scope. */
export function CatalogSelect({ id, label, value, options, onChange, className = '', hideLabel = false }: Props) {
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: '', time: 0 });
  const [expanded, setExpanded] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<CSSProperties>({ visibility: 'hidden' });
  const selectedIndex = options.findIndex(option => option.value === value);
  const selected = options[selectedIndex] || options[0];
  const optionSignature = JSON.stringify(options);
  const menuId = id + '-options';
  const optionId = (index: number) => id + '-option-' + index;

  useEffect(() => { setExpanded(false); typeahead.current.text = ''; }, [value, optionSignature]);

  useLayoutEffect(() => {
    if (!expanded || !trigger.current || !menu.current) return;
    const button = trigger.current;
    const list = menu.current;
    const place = () => {
      const rect = button.getBoundingClientRect();
      const viewport = window.visualViewport;
      const viewportLeft = viewport?.offsetLeft || 0;
      const viewportTop = viewport?.offsetTop || 0;
      const viewportWidth = viewport?.width || window.innerWidth;
      const viewportHeight = viewport?.height || window.innerHeight;
      const scrollContainer = button.closest('[data-select-scroll-container]')?.getBoundingClientRect();
      if (!button.isConnected || rect.bottom < viewportTop || rect.top > viewportTop + viewportHeight ||
          scrollContainer && (rect.bottom < scrollContainer.top || rect.top > scrollContainer.bottom)) {
        setExpanded(false);
        return;
      }
      const edge = 12;
      const gap = 8;
      const width = Math.min(rect.width, viewportWidth - edge * 2);
      const left = Math.max(viewportLeft + edge, Math.min(rect.left, viewportLeft + viewportWidth - width - edge));
      // Measure with the actual width so long option labels contribute to the height.
      list.style.width = width + 'px';
      const desiredHeight = Math.min(list.scrollHeight, 320);
      const below = Math.max(0, viewportTop + viewportHeight - rect.bottom - gap - edge);
      const above = Math.max(0, rect.top - viewportTop - gap - edge);
      const upwards = below < Math.min(desiredHeight, 220) && above > below;
      const maxHeight = Math.min(320, upwards ? above : below);
      const height = Math.min(desiredHeight, maxHeight);
      const top = upwards ? rect.top - gap - height : rect.bottom + gap;
      setPosition({ left, top, width, maxHeight, visibility: 'visible' });
    };
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && list.contains(event.target)) return;
      place();
    };
    const outside = (event: Event) => {
      if (event.target instanceof Node && !button.contains(event.target) && !list.contains(event.target)) setExpanded(false);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(button);
    window.addEventListener('resize', place);
    document.addEventListener('scroll', onScroll, true);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    window.visualViewport?.addEventListener('resize', place);
    window.visualViewport?.addEventListener('scroll', place);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', place);
      document.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      window.visualViewport?.removeEventListener('resize', place);
      window.visualViewport?.removeEventListener('scroll', place);
    };
  }, [expanded, optionSignature]);

  useEffect(() => {
    if (!expanded || !menu.current) return;
    const list = menu.current;
    const option = list.children[highlighted] as HTMLElement | undefined;
    if (!option) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [expanded, highlighted, position]);

  const openMenu = (index = Math.max(0, selectedIndex)) => {
    if (!options.length || !trigger.current) return;
    setHost(trigger.current.closest('dialog') || document.body);
    setPosition({ visibility: 'hidden' });
    setHighlighted(index);
    setExpanded(true);
    trigger.current.focus({ preventScroll: true });
  };
  const choose = (index: number, restoreFocus = true) => {
    const option = options[index];
    if (!option) return;
    setExpanded(false);
    typeahead.current.text = '';
    if (option.value !== value) onChange(option.value);
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const key = event.key;
    if (key === 'Escape' && expanded) {
      event.preventDefault();
      event.stopPropagation();
      setExpanded(false);
      trigger.current?.focus({ preventScroll: true });
      return;
    }
    if (key === 'Tab') {
      if (expanded) choose(highlighted, false);
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
      event.preventDefault();
      if (!expanded) openMenu(key === 'Home' ? 0 : key === 'End' ? options.length - 1 : Math.max(0, selectedIndex));
      else setHighlighted(index => key === 'Home' ? 0 : key === 'End' ? options.length - 1 : Math.max(0, Math.min(options.length - 1, index + (key === 'ArrowDown' ? 1 : -1))));
      return;
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (expanded) choose(highlighted); else openMenu();
      return;
    }
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      const previous = typeahead.current;
      const text = (now - previous.time > 700 ? '' : previous.text) + key.toLocaleLowerCase();
      const search = Array.from(text).every(character => character === text[0]) ? text[0] : text;
      typeahead.current = { text, time: now };
      const start = expanded ? highlighted : selectedIndex;
      const match = options.findIndex((_, offset) => options[(Math.max(start, 0) + 1 + offset) % options.length]?.label.toLocaleLowerCase().startsWith(search));
      if (match >= 0) {
        event.preventDefault();
        const index = (Math.max(start, 0) + 1 + match) % options.length;
        if (expanded) setHighlighted(index); else openMenu(index);
      }
    }
  };

  return <div className={'catalog-select-field ' + className}>
    <label id={id + '-label'} htmlFor={id} className={hideLabel ? 'sr-only' : 'field-label'}>{label}</label>
    <button ref={trigger} id={id} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={expanded}
      aria-controls={expanded ? menuId : undefined} aria-activedescendant={expanded ? optionId(highlighted) : undefined}
      aria-labelledby={id + '-label ' + id + '-value'} disabled={!options.length} className="catalog-select-trigger"
      onClick={() => expanded ? setExpanded(false) : openMenu()} onKeyDown={onKeyDown}>
      <span id={id + '-value'} className="catalog-select-value">{selected?.label || 'No options'}</span>
      <ChevronDown size={16} aria-hidden="true" className="catalog-select-chevron" />
    </button>
    {expanded && host && createPortal(<ul ref={menu} id={menuId} role="listbox" aria-labelledby={id + '-label'}
      tabIndex={-1} className="catalog-select-menu" style={position} onKeyDown={onKeyDown}>
      {options.map((option, index) => <li id={optionId(index)} key={option.value} role="option" aria-selected={option.value === value}
        data-highlighted={highlighted === index ? 'true' : undefined} className="catalog-select-option"
        onPointerMove={event => { if (event.pointerType === 'mouse') setHighlighted(index); }}
        onPointerDown={event => { if (event.pointerType === 'mouse') event.preventDefault(); }} onClick={() => choose(index)}>
        <span>{option.label}</span>
        <Check size={16} aria-hidden="true" className="catalog-select-check" />
      </li>)}
    </ul>, host)}
  </div>;
}
