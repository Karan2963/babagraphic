/**
 * Converts a numeric amount to Indian Currency Words format:
 * e.g. 118 -> "INR One Hundred Eighteen Only"
 * e.g. 1250.5 -> "INR One Thousand Two Hundred Fifty and Paise Fifty Only"
 */
export function numberToWordsIndian(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'INR Zero Only';

  const singleDigits = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const tensDigits = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return singleDigits[n];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return `${tensDigits[tens]}${ones > 0 ? ` ${singleDigits[ones]}` : ''}`.trim();
  }

  function convertThreeDigits(n: number): string {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    let result = '';
    if (hundreds > 0) {
      result += `${singleDigits[hundreds]} Hundred`;
    }
    if (remainder > 0) {
      if (result) result += ' ';
      result += convertTwoDigits(remainder);
    }
    return result.trim();
  }

  const roundedAmount = Math.round(amount * 100) / 100;
  const integerPart = Math.floor(roundedAmount);
  const paisePart = Math.round((roundedAmount - integerPart) * 100);

  let words = '';

  const crore = Math.floor(integerPart / 10000000);
  let remainder = integerPart % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  const hundredAndBelow = remainder;

  if (crore > 0) {
    words += `${convertTwoDigits(crore)} Crore `;
  }
  if (lakh > 0) {
    words += `${convertTwoDigits(lakh)} Lakh `;
  }
  if (thousand > 0) {
    words += `${convertTwoDigits(thousand)} Thousand `;
  }
  if (hundredAndBelow > 0) {
    words += `${convertThreeDigits(hundredAndBelow)} `;
  }

  words = words.trim();
  if (!words) words = 'Zero';

  let finalOutput = `INR ${words}`;
  if (paisePart > 0) {
    finalOutput += ` and Paise ${convertTwoDigits(paisePart)}`;
  }
  finalOutput += ' Only';

  return finalOutput;
}
