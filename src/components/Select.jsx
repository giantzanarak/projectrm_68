import { Children, Fragment, isValidElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import "../css/Select.css";

function collectOptions(children, group = null, out = []) {
  Children.toArray(children).forEach((child) => {
    if (!isValidElement(child)) return;
    if (child.type === Fragment) {
      collectOptions(child.props.children, group, out);
    } else if (child.type === "optgroup") {
      out.push({ kind: "group", label: child.props.label });
      collectOptions(child.props.children, child.props.label, out);
    } else if (child.type === "option") {
      const { value, children: label, disabled } = child.props;
      out.push({
        kind: "option",
        value: value == null ? textOf(label) : String(value),
        label,
        disabled: !!disabled,
        grouped: !!group,
      });
    }
  });
  return out;
}

const textOf = (node) =>
  Children.toArray(node).map((n) => (typeof n === "object" ? textOf(n.props?.children) : String(n))).join("");

const MENU_GAP = 6;
const MENU_MAX_HEIGHT = 320;

export default function Select({
  value,
  onChange,
  name,
  id,
  disabled = false,
  required = false,
  className = "",
  style,
  title,
  autoFocus,
  children,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuPos, setMenuPos] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const options = collectOptions(children);
  const selectable = options.filter((o) => o.kind === "option");
  const current = value == null ? "" : String(value);
  const shown = selectable.find((o) => o.value === current) ?? selectable[0];
  const isPlaceholder = !shown || shown.value === "";

  const choose = (opt) => {
    if (opt.disabled) return;
    setOpen(false);
    triggerRef.current?.focus();
    if (opt.value === current) return;
    onChange?.({ target: { name, value: opt.value }, currentTarget: { name, value: opt.value } });
  };

  const placeMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const below = window.innerHeight - rect.bottom - MENU_GAP - 8;
    const above = rect.top - MENU_GAP - 8;
    const openUp = below < Math.min(MENU_MAX_HEIGHT, 200) && above > below;
    setMenuPos({
      left: rect.left,
      minWidth: rect.width,
      maxHeight: Math.min(MENU_MAX_HEIGHT, openUp ? above : below),
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + MENU_GAP }
        : { top: rect.bottom + MENU_GAP }),
    });
  };

  useLayoutEffect(() => {
    if (open) placeMenu();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onScroll = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) setOpen(false);
      else placeMenu();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", placeMenu);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", placeMenu);
    };
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    menuRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const openMenu = () => {
    if (disabled) return;
    setActiveIndex(options.findIndex((o) => o.kind === "option" && o.value === current));
    setOpen(true);
  };

  const moveActive = (dir) => {
    let i = activeIndex;
    for (let step = 0; step < options.length; step++) {
      i = (i + dir + options.length) % options.length;
      if (options[i].kind === "option" && !options[i].disabled) break;
    }
    setActiveIndex(i);
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); moveActive(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); }
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt?.kind === "option") choose(opt);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className={`ui-select ${className}`} style={style} title={title}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`ui-select-trigger${open ? " open" : ""}${isPlaceholder ? " is-placeholder" : ""}`}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
      >
        <span className="ui-select-value">{shown ? shown.label : " "}</span>
        <FiChevronDown size={16} className="ui-select-arrow" />
      </button>

      {(name || required) && (
        <input
          className="ui-select-native"
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          value={current}
          required={required}
          disabled={disabled}
          onChange={() => {}}
          onFocus={() => triggerRef.current?.focus()}
        />
      )}

      {open && menuPos && createPortal(
        <div ref={menuRef} className="ui-select-menu" role="listbox" style={menuPos}>
          {options.map((opt, i) =>
            opt.kind === "group" ? (
              <div key={`g-${i}`} className="ui-select-group">{opt.label}</div>
            ) : (
              <div
                key={`o-${i}`}
                data-index={i}
                role="option"
                aria-selected={opt.value === current}
                aria-disabled={opt.disabled || undefined}
                className={[
                  "ui-select-item",
                  opt.value === current && "active",
                  i === activeIndex && "highlight",
                  opt.disabled && "disabled",
                  opt.grouped && "grouped",
                ].filter(Boolean).join(" ")}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => choose(opt)}
              >
                <span className="ui-select-item-label">{opt.label}</span>
                {opt.value === current && <FiCheck size={15} className="ui-select-check" />}
              </div>
            )
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
