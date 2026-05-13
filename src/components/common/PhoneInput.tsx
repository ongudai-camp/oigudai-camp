"use client"

import { useState, useRef, useEffect } from "react"
import { countryCodes, formatLocalDigits, stripPhone, type CountryCodeEntry } from "@/lib/countryCodes"
import clsx from "clsx"

export default function PhoneInput({
  onChange,
  disabled,
}: {
  onChange: (phone: string, country: CountryCodeEntry) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(countryCodes[0])
  const [localRaw, setLocalRaw] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const digitCursorRef = useRef<number | null>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    if (digitCursorRef.current === null || !inputRef.current) return
    const newFormatted = formatLocalDigits(localRaw, selected.format)
    const target = Math.min(digitCursorRef.current, localRaw.length)
    let pos = 0
    let digits = 0
    for (let i = 0; i < newFormatted.length; i++) {
      if (digits >= target) { pos = i; break }
      if (/\d/.test(newFormatted[i])) digits++
      pos = i + 1
    }
    inputRef.current.setSelectionRange(pos, pos)
    digitCursorRef.current = null
  })

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const cursorPos = e.target.selectionStart ?? 0
    const raw = stripPhone(e.target.value)

    let digitPos = 0
    for (let i = 0; i < cursorPos; i++) {
      if (/\d/.test(e.target.value[i])) {
        digitPos++
      }
    }

    if (raw.length > 15) return
    setLocalRaw(raw)
    onChange(selected.code + raw, selected)
    digitCursorRef.current = digitPos
  }

  function selectCountry(entry: CountryCodeEntry) {
    if (entry.disabled) return
    setSelected(entry)
    setOpen(false)
    onChange(entry.code + localRaw, entry)
  }

  const formatted = formatLocalDigits(
    localRaw,
    selected.format,
  )

  return (
    <div ref={ref} className="relative flex items-stretch">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className={clsx(
          "flex items-center gap-1.5 px-3 border border-r-0 border-gray-200 rounded-l-2xl bg-gray-50 text-sm font-bold text-gray-700",
          "hover:bg-gray-100 transition-colors",
          disabled && "opacity-50",
          selected.isRf ? "text-orange-600" : "",
        )}
      >
        <span className="text-base leading-none">
          {selected.isRf ? "🇷🇺" : "🌐"}
        </span>
        <span className="hidden sm:inline max-w-[100px] truncate">
          {selected.isRf ? "РФ" : selected.code}
        </span>
        <svg className="w-3 h-3 text-[#1A2B48] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className="relative flex-1">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A2B48] font-medium text-sm pointer-events-none select-none">
          {selected.code}
        </span>
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          value={formatted}
          onChange={handleInput}
          disabled={disabled}
          placeholder={selected.format.replace(/x/g, "5")}
          className={clsx(
            "w-full pl-[4.5rem] pr-4 py-4 bg-gray-50 border border-gray-200 rounded-r-2xl",
            "focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10",
            "transition-all outline-none text-lg font-medium text-[#1A2B48]",
          )}
        />
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 sm:w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto">
          {countryCodes.map((entry, i) =>
            entry.disabled ? (
              <div key={i} className="h-px bg-gray-100 mx-3 my-1" />
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => selectCountry(entry)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                  selected === entry ? "bg-orange-50 text-orange-700" : "hover:bg-gray-50 text-gray-700",
                  entry.isRf ? "font-bold border-b border-orange-100" : "",
                )}
              >
                <span className="text-base w-5 text-center">
                  {entry.isRf ? "🇷🇺" : "🌐"}
                </span>
                <span className="flex-1 text-sm">{entry.label}</span>
                <span className="text-xs text-[#1A2B48] font-mono">{entry.code}</span>
                {entry.isRf && (
                  <span className="text-[10px] uppercase tracking-wider text-orange-500 font-bold">особые условия</span>
                )}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
