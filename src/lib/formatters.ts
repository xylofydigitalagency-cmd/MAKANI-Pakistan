/**
 * Pakistani Currency & Real Estate Formatters
 */

export function formatPricePKR(price: number): string {
  if (!price || isNaN(price)) return 'Price on call';

  if (price >= 1000000000) {
    const arab = price / 1000000000;
    return `PKR ${arab % 1 === 0 ? arab : arab.toFixed(2)} Arab`;
  }
  if (price >= 10000000) {
    const crore = price / 10000000;
    return `PKR ${crore % 1 === 0 ? crore : crore.toFixed(2)} Crore`;
  }
  if (price >= 100000) {
    const lac = price / 100000;
    return `PKR ${lac % 1 === 0 ? lac : lac.toFixed(2)} Lac`;
  }
  if (price >= 1000) {
    const thousand = price / 1000;
    return `PKR ${thousand % 1 === 0 ? thousand : thousand.toFixed(1)} K`;
  }
  return `PKR ${price.toLocaleString('en-PK')}`;
}

export function formatExactPKR(price: number): string {
  return `PKR ${price.toLocaleString('en-PK')}`;
}

/**
 * Pakistani mobile number validator + formatter.
 * Accept: 03001234567, 0300-1234567, 0300 1234567, +92 300 1234567, 923001234567, 00923001234567
 * Return: "+92 300 1234567" ya galat number par null
 */
export function normalizePkMobile(input?: string): string | null {
  if (!input) return null;
  let d = input.replace(/\D/g, '');
  if (d.startsWith('0092')) d = d.slice(4);
  else if (d.startsWith('92')) d = d.slice(2);
  else if (d.startsWith('0')) d = d.slice(1);
  if (!/^3[0-5]\d{8}$/.test(d)) return null;
  return `+92 ${d.slice(0, 3)} ${d.slice(3)}`;
}

export function formatArea(value: number, unit: string): string {
  return `${value.toLocaleString('en-PK')} ${unit}`;
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    houses: 'House / Villa',
    apartments: 'Apartment / Flat',
    residential_plots: 'Residential Plot',
    commercial_plots: 'Commercial Plot',
    files: 'Plot File',
    shops: 'Shop',
    offices: 'Office Space',
    buildings: 'Complete Building',
    warehouses: 'Warehouse',
    agricultural: 'Agricultural / Farmhouse',
    commercial: 'Commercial Property',
    other: 'Other Property',
  };
  return map[category] || category;
}
