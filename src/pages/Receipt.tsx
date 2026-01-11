import React from 'react';
import { useCheckout } from '@/context/CheckoutContext';
import { useNavigate } from 'react-router-dom';
import { Printer, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Receipt = () => {
    const { cart, customer, total, resetCheckout } = useCheckout();
    const navigate = useNavigate();

    if (!cart) return <div className="p-20 text-center">Loading receipt data...</div>;

    // Helper to convert number to words
    const toWords = (num: number) => {
        if (!num || isNaN(num)) return 'Zero';
        const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const scales = ['', 'Thousand', 'Million', 'Billion'];

        let word = '';
        let scaleIdx = 0;
        let n = Math.floor(Math.abs(num));

        if (n === 0) return 'Zero';

        while (n > 0) {
            let chunk = n % 1000;
            if (chunk > 0) {
                let chunkWord = '';
                if (chunk >= 100) {
                    chunkWord += units[Math.floor(chunk / 100)] + ' Hundred ';
                    chunk = chunk % 100;
                }
                if (chunk >= 10 && chunk < 20) {
                    chunkWord += teens[chunk - 10] + ' ';
                } else {
                    if (chunk >= 20) {
                        chunkWord += tens[Math.floor(chunk / 10)] + ' ';
                        chunk = chunk % 10;
                    }
                    if (chunk > 0) {
                        chunkWord += units[chunk] + ' ';
                    }
                }
                word = chunkWord + scales[scaleIdx] + ' ' + word;
            }
            n = Math.floor(n / 1000);
            scaleIdx++;
        }

        return word.trim();
    };

    const handlePrint = () => {
        window.print();
    };

    const handleFinish = () => {
        resetCheckout();
        navigate('/checkout');
    };

    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear().toString();
    const receiptNo = Math.floor(Math.random() * 900 + 100);
    const totalValue = total || 0;
    const displayCustomer = customer?.name || '';
    const displayAddress = customer?.address || '';
    const displayPhone = customer?.phone || '';

    // Calculate items summary for cut-out
    const itemsSummary = cart.map(item => `${item.name} (${item.qty})`).join(', ');

    return (
        <div className="min-h-screen bg-neutral-300 p-4 md:p-8 flex flex-col items-center">
            {/* Header / Actions (Hidden on Print) */}
            <div className="w-full max-w-[210mm] flex items-center justify-between mb-4 no-print font-sans">
                <Button variant="ghost" onClick={() => navigate('/checkout')} className="gap-2 text-slate-600">
                    <ChevronLeft size={18} />
                    Back
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePrint} className="gap-2 border-slate-300">
                        <Printer size={18} />
                        Print
                    </Button>
                    <Button onClick={handleFinish} className="gap-2 bg-green-700 hover:bg-green-800 text-white">
                        <CheckCircle2 size={18} />
                        Next Transaction
                    </Button>
                </div>
            </div>

            {/* A4 Paper Size Receipt */}
            <div className="receipt-paper bg-white shadow-2xl print:shadow-none print:m-0 relative" style={{ width: '210mm', minHeight: '297mm', padding: '8mm' }}>

                {/* === MAIN RECEIPT SECTION === */}
                <div style={{ minHeight: '220mm' }}>
                    {/* Header with Logo and Business Name */}
                    <div className="flex items-start gap-4 mb-2">
                        {/* Left - Logo/Icon */}
                        <div className="flex-shrink-0">
                            <img src="/logo.jpeg" alt="Logo" className="w-16 h-16 object-cover rounded border border-black" />
                        </div>


                        {/* Center - Business Name */}
                        <div className="flex-1 text-left">
                            <h1 className="text-3xl font-black text-red-600 tracking-widest" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                                MARSHALL ETHEL NIG. LTD.
                            </h1>
                            <div className="border-2 border-red-600 text-black text-[9px] px-3 py-1 mx-auto mt-1 font-bold" style={{ maxWidth: '400px' }}>
                                Dealers on Electronics / Electrical such as:<br />
                                Fridge, TV sets, Plasma, CDs, VCDs, Air conditioners,<br />
                                Generating sets, Electric Wires, Accessories fittings, etc.
                            </div>
                        </div>


                    </div>

                    {/* Office Addresses and Brand Logos */}
                    <div className="flex justify-between items-start border-b-2 border-blue-600 pb-2 mb-2">
                        {/* Head Office */}
                        <div className="text-[9px] leading-tight">
                            <p className="font-black text-red-600">HEAD OFFICE:</p>
                            <p>No. 10 Oko Road</p>
                            <p>Ekwulobia, Aguata L.G.A</p>
                            <p>Anambra State.</p>
                            <p className="font-black text-red-600">08069818905</p>
                        </div>

                        {/* Tagged Images Section */}
                        <div className="flex justify-center items-center gap-1.5 my-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                <img
                                    key={num}
                                    src={`/tag${num}.jpeg`}
                                    alt={`Tag ${num}`}
                                    className="w-12 h-12 object-contain border border-black bg-white"
                                    style={{ border: '1px solid black' }}
                                />
                            ))}
                        </div>

                        {/* Branch Office */}
                        <div className="text-[9px] leading-tight text-right">
                            <p className="font-black text-red-600">BRANCH OFFICE:</p>
                            <p>No. 9 Oko Road</p>
                            <p>Ekwulobia,</p>
                            <p>Aguata L.G.A</p>
                            <p>Anambra State.</p>
                            <p className="font-black text-red-600">09122430843</p>
                            <p className="font-black text-red-600">08130087873</p>
                        </div>
                    </div>

                    {/* Customer Info Row */}
                    <div className="flex justify-between items-end mb-2 text-[10px]">
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-1">
                                <span className="font-black w-14">Name:</span>
                                <span className="border-b border-blue-600 flex-1 pb-0.5 min-h-[16px]">{displayCustomer}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-black w-14">Address:</span>
                                <span className="border-b border-blue-600 flex-1 pb-0.5 min-h-[16px]">{displayAddress}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-black w-14">Phone:</span>
                                <span className="border-b border-blue-600 flex-1 pb-0.5 min-h-[16px]">{displayPhone}</span>
                            </div>
                        </div>
                        <div className="text-right ml-4">
                            <div className="flex items-center gap-2 justify-end">
                                <span className="font-black">No.</span>
                                <span className="text-red-600 font-black text-lg">{receiptNo}</span>
                            </div>
                            <div className="flex gap-2 mt-1 text-[9px]">
                                <div className="border border-blue-600 px-2 py-0.5 text-center">
                                    <p className="text-[7px] text-blue-600">Day</p>
                                    <p className="font-black">{day}</p>
                                </div>
                                <div className="border border-blue-600 px-2 py-0.5 text-center">
                                    <p className="text-[7px] text-blue-600">Month</p>
                                    <p className="font-black">{month}</p>
                                </div>
                                <div className="border border-blue-600 px-2 py-0.5 text-center">
                                    <p className="text-[7px] text-blue-600">Year</p>
                                    <p className="font-black">{year}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Items Table */}
                    <table className="w-full border-collapse text-[10px] mb-2">
                        <thead>
                            <tr className="bg-blue-100">
                                <th className="border border-blue-600 px-2 py-1 text-left font-black w-10">QTY</th>
                                <th className="border border-blue-600 px-2 py-1 text-left font-black">DESCRIPTION OF GOODS</th>
                                <th className="border border-blue-600 px-2 py-1 text-right font-black w-20">RATE</th>
                                <th className="border border-blue-600 px-1 py-1 text-center font-black w-16" colSpan={2}>
                                    <span className="block">AMOUNT</span>
                                    <div className="flex justify-around text-[8px]">
                                        <span>N</span>
                                        <span>K</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart && cart.length > 0 ? cart.map((item, idx) => (
                                <tr key={item.cartId} className={idx % 2 === 0 ? 'bg-red-50' : 'bg-red-100'}>
                                    <td className="border border-blue-600 px-2 py-2 text-center font-bold">{item.qty}</td>
                                    <td className="border border-blue-600 px-2 py-2">
                                        <span className="font-bold">{item.name}</span>
                                        {item.model && item.model !== 'N/A' && (
                                            <span className="ml-2 text-[9px]">({item.model})</span>
                                        )}
                                        {item.selectedSerial && (
                                            <span className="ml-2 text-[8px] font-bold">S/N: {item.selectedSerial}</span>
                                        )}
                                    </td>
                                    <td className="border border-blue-600 px-2 py-2 text-right font-bold">
                                        {(item.selling_price || 0).toLocaleString()}
                                    </td>
                                    <td className="border border-blue-600 px-2 py-2 text-right font-bold" colSpan={2}>
                                        {((item.selling_price || 0) * item.qty).toLocaleString()}
                                    </td>
                                </tr>
                            )) : null}
                            {/* Empty rows to fill the table */}
                            {[...Array(Math.max(0, 10 - cart.length))].map((_, i) => (
                                <tr key={`empty-${i}`} className={i % 2 === 0 ? 'bg-red-50' : 'bg-red-100'}>
                                    <td className="border border-blue-600 px-2 py-2 h-6"></td>
                                    <td className="border border-blue-600 px-2 py-2"></td>
                                    <td className="border border-blue-600 px-2 py-2"></td>
                                    <td className="border border-blue-600 px-2 py-2" colSpan={2}></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Bottom Section with Totals */}
                    <div className="flex justify-between items-start text-[9px] mb-2">
                        <div className="flex-1 pr-4">
                            <p className="font-bold mb-1">
                                Goods tested and certified to be in good condition cannot be returned or replaced with effect from the day of purchase.
                            </p>
                            <div className="border border-blue-600 p-2 mt-2">
                                <p className="font-black">Comment:</p>
                                <p className="underline font-bold">NOTE:</p>
                                <p>No warranty on TV Screen.</p>
                                <p>Warranty is strictly on REPAIRS by the company not replacement or changing.</p>
                            </div>
                        </div>
                        <div className="w-40">
                            <div className="flex justify-between border border-blue-600 px-2 py-1 mb-1">
                                <span className="font-black">TOTAL Amt.</span>
                                <span className="font-black">{totalValue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border border-blue-600 px-2 py-1 mb-1">
                                <span className="font-black">Deposit.</span>
                                <span></span>
                            </div>
                            <div className="flex justify-between border border-blue-600 px-2 py-1">
                                <span className="font-black">Bal.</span>
                                <span></span>
                            </div>
                        </div>
                    </div>

                    {/* Value in Words */}
                    <div className="flex items-center gap-2 text-[10px] mb-4">
                        <span className="font-black">Value in words:</span>
                        <span className="border-b border-blue-600 flex-1 pb-0.5 font-bold italic">
                            {toWords(totalValue)} Naira
                        </span>
                        <span className="font-black">Kobo</span>
                    </div>

                    {/* Signatures */}
                    <div className="flex justify-between items-end mt-4 text-[9px]">
                        <div className="text-center">
                            <div className="border-t border-black w-32 pt-1">
                                <p className="font-black">Customer's Sign</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] mb-1">🤝 Thanks for your patronage</p>
                        </div>
                        <div className="text-center">
                            <div className="border-t border-black w-40 pt-1">
                                <p className="font-black">For: MARSHALL ETHEL NIG. LTD.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === CUT LINE === */}
                <div className="border-t-2 border-dashed border-blue-600 my-4 relative">
                    <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-white px-2 text-[8px] text-blue-600">✂ CUT HERE - BUSINESS COPY</span>
                </div>

                {/* === BUSINESS CUT-OUT COPY === */}
                <div className="text-[8px] p-2 bg-red-50 border border-blue-600">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="font-black text-red-600 text-[10px]">MARSHALL ETHEL NIG. LTD. - BUSINESS COPY</p>
                            <p className="font-bold">Receipt No: {receiptNo} | Date: {day}/{month}/{year}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-lg text-red-600">₦{totalValue.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p><span className="font-black">Customer:</span> {displayCustomer || 'Walk-in'}</p>
                            <p><span className="font-black">Phone:</span> {displayPhone || 'N/A'}</p>
                            <p><span className="font-black">Address:</span> {displayAddress || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="font-black">Items Purchased:</p>
                            <p className="truncate">{itemsSummary || 'No items'}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-600">
                        <div className="w-24 border-t border-black pt-1 text-center">
                            <p className="text-[7px]">Customer Sign</p>
                        </div>
                        <div className="w-24 border-t border-black pt-1 text-center">
                            <p className="text-[7px]">Staff Sign</p>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .receipt-paper {
                    font-family: Arial, sans-serif;
                    line-height: 1.3;
                    color: black;
                }

                @media print {
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    .no-print { display: none !important; }
                    .receipt-paper { 
                        box-shadow: none !important; 
                        margin: 0 !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                }
            ` }} />
        </div>
    );
};

export default Receipt;
