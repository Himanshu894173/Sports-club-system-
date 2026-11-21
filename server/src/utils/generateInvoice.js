export const generateInvoiceData = (transactionOrOrder) => {
  return {
    clubName: 'KHELORA',
    tagline: 'Premier Sports Club & Athletic Arena',
    address: 'Estate 14, Royal Greens Blvd, Sector 62, Gurgaon, HR 122002',
    phone: '+91 (0124) 488-9000',
    email: 'accounts@khelora.com',
    gstin: '07AAAAA0000A1Z5',
    invoiceNumber: transactionOrOrder.invoiceNumber || transactionOrOrder.id || `INV-${Date.now()}`,
    date: transactionOrOrder.date || new Date().toISOString().split('T')[0],
    ...transactionOrOrder
  };
};
