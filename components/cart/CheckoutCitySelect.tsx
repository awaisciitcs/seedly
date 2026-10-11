'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import { CITY_PROVINCE_MAP, PAKISTAN_CITIES } from '@/lib/delivery';

const cities = PAKISTAN_CITIES.filter(city => city !== 'Other City');

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
}

/** Editable city combobox: suggested cities are optional, and focus stays in the input. */
export function CheckoutCitySelect({ id, label, value, onChange, invalid, describedBy, disabled = false }: Props) {
  const field = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<CSSProperties>({ visibility: 'hidden' });
  const options = useMemo(() => cities.filter(city => city.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [query]);
  const menuId = id + '-options';
  const optionId = (index: number) => id + '-option-' + index;

  useEffect(() => { if (disabled) setExpanded(false); }, [disabled]);

  useLayoutEffect(() => {
    if (!expanded || !input.current || !panel.current) return;
    const anchor = input.current;
    const menu = panel.current;
    const viewport = window.visualViewport;
    const place = () => {
      const rect = anchor.getBoundingClientRect();
      const leftEdge = viewport?.offsetLeft || 0;
      const topEdge = viewport?.offsetTop || 0;
      const width = viewport?.width || innerWidth;
      const height = viewport?.height || innerHeight;
      if (!anchor.isConnected || anchor.matches(':disabled') || rect.bottom < topEdge || rect.top > topEdge + height) {
        setExpanded(false);
        return;
      }
      const edge = 12, gap = 6;
      const menuWidth = Math.min(rect.width, width - edge * 2);
      menu.style.width = menuWidth + 'px';
      const desiredHeight = Math.min(menu.scrollHeight, 360);
      const below = Math.max(0, topEdge + height - rect.bottom - gap - edge);
      const above = Math.max(0, rect.top - topEdge - gap - edge);
      const upwards = below < Math.min(desiredHeight, 220) && above > below;
      const maxHeight = Math.min(360, upwards ? above : below);
      const menuHeight = Math.min(desiredHeight, maxHeight);
      setPosition({
        left: Math.max(leftEdge + edge, Math.min(rect.left, leftEdge + width - menuWidth - edge)),
        top: upwards ? rect.top - gap - menuHeight : rect.bottom + gap,
        width: menuWidth, maxHeight, visibility: 'visible',
      });
    };
    const outside = (event: Event) => {
      if (event.target instanceof Node && !field.current?.contains(event.target) && !menu.contains(event.target)) setExpanded(false);
    };
    const scroll = (event: Event) => {
      if (!(event.target instanceof Node) || !menu.contains(event.target)) place();
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(anchor);
    window.addEventListener('resize', place);
    document.addEventListener('scroll', scroll, true);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    viewport?.addEventListener('resize', place);
    viewport?.addEventListener('scroll', place);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', place);
      document.removeEventListener('scroll', scroll, true);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      viewport?.removeEventListener('resize', place);
      viewport?.removeEventListener('scroll', place);
    };
  }, [expanded, query]);

  useEffect(() => {
    if (!expanded || !list.current) return;
    const option = list.current.children[active] as HTMLElement | undefined;
    if (!option) return;
    if (option.offsetTop < list.current.scrollTop) list.current.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.current.scrollTop + list.current.clientHeight) {
      list.current.scrollTop = option.offsetTop + option.offsetHeight - list.current.clientHeight;
    }
  }, [expanded, active, position]);

  const open = () => {
    if (disabled || input.current?.matches(':disabled')) return;
    setHost(input.current?.closest('dialog') || document.body);
    setQuery('');
    setActive(Math.max(0, cities.indexOf(value)));
    setPosition({ visibility: 'hidden' });
    setExpanded(true);
  };
  const choose = (index: number) => {
    const city = options[index];
    if (!city || disabled) return;
    onChange(city);
    // Focus before closing so a focus event cannot immediately reopen the menu.
    input.current?.focus({ preventScroll: true });
    setExpanded(false);
  };
  const keys = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && expanded) {
      event.preventDefault(); event.stopPropagation(); setExpanded(false);
    } else if (event.key === 'Tab') {
      setExpanded(false);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!expanded) open();
      else setActive(index => options.length ? Math.max(0, Math.min(options.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1))) : -1);
    } else if (event.key === 'Enter' && expanded && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (options[active]) choose(active); else setExpanded(false);
    }
  };

  return <div ref={field} className="checkout-city-field">
    <label id={id + '-label'} className="field-label" htmlFor={id}>{label}</label>
    <div className="checkout-city-control">
      <input ref={input} className="form-input checkout-city-input" id={id} name={id} role="combobox"
        value={value} autoComplete="address-level2" maxLength={100} required disabled={disabled}
        placeholder="Search or type your city" aria-autocomplete="list" aria-haspopup="listbox"
        aria-expanded={expanded} aria-controls={expanded ? menuId : undefined}
        aria-activedescendant={expanded && active >= 0 && options[active] ? optionId(active) : undefined}
        aria-invalid={!!invalid} aria-describedby={describedBy}
        onFocus={open} onClick={() => { if (!expanded) open(); }} onKeyDown={keys}
        onChange={event => {
          onChange(event.target.value);
          setQuery(event.target.value);
          setActive(0);
          setHost(input.current?.closest('dialog') || document.body);
          setExpanded(true);
        }} />
      <button type="button" tabIndex={-1} disabled={disabled} className="checkout-city-toggle"
        aria-label={expanded ? 'Hide city options' : 'Show city options'} aria-expanded={expanded}
        aria-controls={expanded ? menuId : undefined} onPointerDown={event => event.preventDefault()}
        onClick={() => { if (expanded) setExpanded(false); else { input.current?.focus({ preventScroll: true }); open(); } }}>
        <ChevronDown size={18} aria-hidden="true" />
      </button>
    </div>
    {expanded && host && createPortal(<div ref={panel} className="catalog-select-menu checkout-city-menu" style={position}>
      <div className="checkout-city-heading"><span>Suggested cities</span><span>{options.length}</span></div>
      <ul ref={list} id={menuId} className="checkout-city-options" role="listbox" aria-labelledby={id + '-label'}>
        {options.map((city, index) => <li id={optionId(index)} key={city} className="catalog-select-option checkout-city-option"
          role="option" aria-selected={city === value} data-highlighted={active === index ? 'true' : undefined}
          onPointerMove={event => { if (event.pointerType === 'mouse') setActive(index); }}
          onPointerDown={event => { if (event.pointerType === 'mouse') event.preventDefault(); }} onClick={() => choose(index)}>
          <MapPin size={16} className="checkout-city-pin" aria-hidden="true" />
          <span className="checkout-city-name">{city}<span className="checkout-city-region">{CITY_PROVINCE_MAP[city]}</span></span>
          <Check size={16} className="catalog-select-check" aria-hidden="true" />
        </li>)}
      </ul>
      {!options.length && <p role="status" className="checkout-city-empty">City not listed? You can use the city you entered and select its province.</p>}
      <p className="checkout-city-hint">Search above, or enter a city not on this list.</p>
    </div>, host)}
  </div>;
}
