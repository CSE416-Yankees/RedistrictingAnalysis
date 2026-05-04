import { useEffect, useMemo, useRef, useState } from 'react';
import './PillDropdown.css';

export default function PillDropdown({
  label,
  value,
  options = [],
  onChange,
  className = '',
  align = 'left',
}) {
  const rootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const hasOptions = options.length > 0;

  const selected = useMemo(
    () => (hasOptions ? (options.find((option) => option.value === value) ?? options[0]) : null),
    [hasOptions, options, value],
  );

  const menuOpen = hasOptions && isOpen;

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  return (
    <div
      ref={rootRef}
      className={`pill-dropdown ${align === 'right' ? 'pill-dropdown--align-right' : ''} ${className}`.trim()}
    >
      <span className="pill-dropdown__label">{label}</span>
      <button
        type="button"
        className="pill-dropdown__trigger"
        aria-haspopup="listbox"
        aria-expanded={menuOpen}
        disabled={!hasOptions}
        onClick={() => hasOptions && setIsOpen((prev) => !prev)}
      >
        <span className="pill-dropdown__value">{selected?.label ?? value ?? '—'}</span>
        <span className="pill-dropdown__caret">▾</span>
      </button>

      {menuOpen && (
        <div className="pill-dropdown__menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`pill-dropdown__option ${option.value === value ? 'pill-dropdown__option--active' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
