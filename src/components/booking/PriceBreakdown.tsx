"use client";

interface PriceBreakdownProps {
  label: string;
  unitPrice: number;
  quantity: number;
  quantityLabel: string;
  total: number;
  serviceFee?: number;
  discount?: number;
  grandTotal: number;
  currency?: string;
}

export default function PriceBreakdown({
  label,
  unitPrice,
  quantity,
  quantityLabel,
  total,
  serviceFee = 0,
  discount = 0,
  grandTotal,
  currency = "₽",
}: PriceBreakdownProps) {
  return (
    <div className="bg-gray-50/50 rounded-2xl p-5 space-y-3 border border-gray-100/50">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 font-medium">
          {unitPrice.toLocaleString()} {currency} × {quantity} {quantityLabel}
        </span>
        <span className="font-bold text-gray-900">{total.toLocaleString()} {currency}</span>
      </div>

      {serviceFee > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 font-medium">Service fee</span>
          <span className="text-gray-900">{serviceFee.toLocaleString()} {currency}</span>
        </div>
      )}

      {discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-emerald-600 font-medium">Discount</span>
          <span className="text-emerald-600 font-bold">-{discount.toLocaleString()} {currency}</span>
        </div>
      )}

      <div className="border-t border-gray-200/50 pt-3 flex justify-between items-center">
        <span className="font-black text-gray-900">Total</span>
        <span className="font-black text-2xl text-orange-500">
          {grandTotal.toLocaleString()} {currency}
        </span>
      </div>
    </div>
  );
}
