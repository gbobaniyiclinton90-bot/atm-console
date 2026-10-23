const savedTransfer = localStorage.getItem('lastTransfer');

if (savedTransfer) {
    const transaction = JSON.parse(savedTransfer);

    const receiptAmount = document.getElementById('receipt-amount');
    const receiptStatus = document.getElementById('receipt-status');
    const receiptRecipient = document.getElementById('receipt-recipient');
    const receiptAccount = document.getElementById('receipt-account');
    const receiptBank = document.getElementById('receipt-bank');
    const receiptReference = document.getElementById('receipt-reference');
    const receiptDate = document.getElementById('receipt-date');
    const receiptBalance = document.getElementById('receipt-balance');

    receiptAmount.textContent =
        `₦${transaction.amount.toLocaleString()}`;

    receiptStatus.textContent = transaction.status;

    receiptRecipient.textContent = transaction.recipientName;

    receiptAccount.textContent = transaction.recipientAccount;

    receiptBank.textContent = transaction.recipientBank;

    receiptReference.textContent = transaction.reference;

    receiptDate.textContent =
        new Date(transaction.dateTime).toLocaleString();

    receiptBalance.textContent =
        `₦${transaction.updatedBalance.toLocaleString()}`;
} else {
    document.querySelector('.receipt-container').textContent =
        'No transfer receipt is available. Please complete a transfer first.';
}