import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { RefObject } from 'react';

const getRandomIndexValue = (value: string) => {
  return value.charAt(Math.floor(Math.random() * value.length));
};

const ALPHABET = 'ABCDHIJKLMNOPQRSTUVWXYZ';

/**
 * Get 3 letter Invoice Number prefix
 */
export const generatePrefix = (value?: string) => {
  let [first, second, third] = value
    ? value.toUpperCase().split(/[^A-Z]+/g, 3)
    : [];

  third = third ? third.charAt(0) : getRandomIndexValue(ALPHABET);
  second = second ? second.charAt(0) : getRandomIndexValue(ALPHABET);
  first = first ? first.charAt(0) : getRandomIndexValue(ALPHABET);

  return `${first}${second}${third}`;
};

export const calculateOrderAmount = <
  T extends { amount: number; quantity: number }
>(
  orders: T[]
) => {
  return orders.reduce((acc, curr) => acc + curr.amount * curr.quantity, 0);
};

export const downloadPdf = async <T extends HTMLElement>(
  pdfContainer: RefObject<T>,
  filename: string
) => {
  if (!pdfContainer.current) return;

  const pdf = new jsPDF();
  const dataUrl = await toPng(pdfContainer.current);
  const imgProperties = pdf.getImageProperties(dataUrl);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
};
