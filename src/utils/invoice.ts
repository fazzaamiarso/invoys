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
  const [
    first = getRandomIndexValue(ALPHABET),
    second = getRandomIndexValue(ALPHABET),
    third = getRandomIndexValue(ALPHABET),
  ] = value ? value.toUpperCase().split(/[^A-Z]+/g, 3) : [];

  return `${first.charAt(0)}${second.charAt(0)}${third.charAt(0)}`;
};

/**
 * Calculate an invoice total orders
 */
export const calculateOrderAmount = <
  T extends { amount: number; quantity: number }
>(
  orders: T[]
) => {
  return orders.reduce((acc, curr) => acc + curr.amount * curr.quantity, 0);
};

/**
 * Trigger browser download action from the ref given
 */
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
