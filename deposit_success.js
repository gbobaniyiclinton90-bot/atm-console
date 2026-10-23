const savedTransaction = localStorage.getItem('lastDeposit');

const transaction = savedTransaction
    ? JSON.parse(savedTransaction)
    : null;

const transactionReference = document.getElementById('transaction-reference');
const transactionDate = document.getElementById('transaction-date-time');
const transactionAmount = document.getElementById('transaction-amount');
const balanceDisplay = document.getElementById('balance');
const cardDetails = document.getElementById('card-details');

if (transaction) {
    transactionReference.textContent = transaction.reference;

    transactionDate.textContent =
        new Date(transaction.dateTime).toLocaleString();

    transactionAmount.textContent =
        `₦${transaction.amount.toLocaleString()}`;

    balanceDisplay.textContent =
        `₦${transaction.updatedBalance.toLocaleString()}`;

    cardDetails.textContent = transaction.accountNo;
}