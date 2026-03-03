export function formatCurrency(value: string | number): string {
  const numericValue = typeof value === "string" ? Number.parseFloat(value) : value

  if (isNaN(numericValue)) {
    return "R$ 0,00"
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue)
}

export function parseMonetaryValue(value: string | number): number {
  if (typeof value === "number") {
    return value
  }

  const numericValue = Number.parseFloat(value)
  return isNaN(numericValue) ? 0 : numericValue
}
