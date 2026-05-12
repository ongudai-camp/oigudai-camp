export interface CountryCodeEntry {
  label: string
  code: string
  format: string
  disabled?: boolean
  isRf?: boolean
}

export const countryCodes: CountryCodeEntry[] = [
  { label: "Гражданин РФ", code: "+7", format: "(xxx) xxx-xx-xx", isRf: true },
  { label: "", code: "", format: "", disabled: true },
  { label: "Казахстан", code: "+7", format: "(xxx) xxx-xx-xx" },
  { label: "Узбекистан", code: "+998", format: "(xx) xxx-xx-xx" },
  { label: "Кыргызстан", code: "+996", format: "(xxx) xxx-xxx" },
  { label: "Таджикистан", code: "+992", format: "(xx) xxx-xx-xx" },
  { label: "Туркменистан", code: "+993", format: "(xx) xxx-xx-xx" },
  { label: "Азербайджан", code: "+994", format: "(xx) xxx-xx-xx" },
  { label: "Армения", code: "+374", format: "(xx) xxx-xx-xx" },
  { label: "Грузия", code: "+995", format: "(xx) xxx-xx-xx" },
  { label: "Турция", code: "+90", format: "(xxx) xxx-xx-xx" },
  { label: "Китай", code: "+86", format: "(xx) xxxx-xxxx" },
  { label: "Индия", code: "+91", format: "(xx) xxxx-xxxx" },
  { label: "ОАЭ", code: "+971", format: "(xx) xxx-xxxx" },
  { label: "США / Канада", code: "+1", format: "(xxx) xxx-xxxx" },
  { label: "Великобритания", code: "+44", format: "(xxxx) xxx-xxx" },
  { label: "Германия", code: "+49", format: "(xxx) xxx-xxxx" },
  { label: "Франция", code: "+33", format: "(x) xx-xx-xx-xx" },
  { label: "Италия", code: "+39", format: "(xxx) xxx-xxxx" },
  { label: "Испания", code: "+34", format: "(xxx) xxx-xxx" },
  { label: "Израиль", code: "+972", format: "(xx) xxx-xxxx" },
  { label: "Таиланд", code: "+66", format: "(xx) xxx-xxxx" },
  { label: "Вьетнам", code: "+84", format: "(xx) xxxx-xxx" },
  { label: "Монголия", code: "+976", format: "(xx) xx-xxxx" },
]

export function formatLocalDigits(digits: string, format: string): string {
  let result = ""
  let di = 0
  for (const ch of format) {
    if (ch === "x") {
      result += di < digits.length ? digits[di] : ""
      di++
    } else {
      result += ch
    }
  }
  return result
}

export function stripPhone(phone: string): string {
  return phone.replace(/\D/g, "")
}

