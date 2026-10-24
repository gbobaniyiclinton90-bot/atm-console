

const nameDisplay = document.getElementById('names');
const cardDisplay = document.getElementById('card-details');
const btns = document.querySelectorAll(".button");
const pinInputs = document.querySelectorAll('.displayInput');
const submitBtn = document.getElementById('submit-pin-btn');
const alertMessage = document.getElementById('alert-message');
const savedsession = localStorage.getItem('activeUserId');
const activeProfile = ATM_USERS[savedsession];
const balanceKey = `balance-${savedsession}`;
const savedBalance = localStorage.getItem(balanceKey);
const atmUsersContainer = document.getElementById('atmUsersContainer');
const balanceDisplay = document.getElementById('balance');

const attemptKey = `failedInput-${savedsession}`;
const lockKey = `lockExpiry-${savedsession}`;

let failedInput = Number(localStorage.getItem(attemptKey)) || 0;

const LOCK_DURATION = 30000;


const customAmountInput = document.getElementById('custom-amount');
const quickAmountRadios = document.querySelectorAll('input[name="withdraw-amount"]');
const confirmWithdrawBtn = document.querySelector('.confirm-withdrawal');
const withdrawButton= document.querySelectorAll(".withdraw-button")
const withdrawMessage = document.getElementById('withdraw-message');
const confirmDepositBtn = document.querySelector(".confirm-deposit")


if (atmUsersContainer) {
    for (const [userId, user] of Object.entries(ATM_USERS)) {

        const cards = document.createElement('div');
        cards.classList.add("d_account");

        cards.innerHTML = `
            <h3>${user.username}</h3>
            <p>${user.accountNo}</p>
        `;

        cards.addEventListener("click", () => {
            localStorage.setItem('activeUserId', userId);
            window.location.href = "./passcode_page.html";
        });

        atmUsersContainer.appendChild(cards);
    }
}



if (activeProfile && savedBalance !== null) {
    activeProfile.balance = Number(savedBalance);
}


if (activeProfile) {
    if (nameDisplay) {
        nameDisplay.textContent = activeProfile.username;
    }

    if (cardDisplay) {
        cardDisplay.textContent = activeProfile.accountNo;
    }

    if (balanceDisplay) {
        balanceDisplay.textContent =
            `₦${activeProfile.balance.toLocaleString()}`;
    }
}


function checkCardLock() {

    const lockExpiry = Number(localStorage.getItem(lockKey));

    if (!lockExpiry) {
        return false;
    }

    const timeRemaining = lockExpiry - Date.now();

    if (timeRemaining <= 0) {

        localStorage.removeItem(lockKey);
        localStorage.removeItem(attemptKey);

        failedInput = 0;

        if (submitBtn) {
            submitBtn.disabled = false;
        }

        pinInputs.forEach(input => {
            input.disabled = false;
        });

        if (alertMessage) {
            alertMessage.textContent = "";
        }

        return false;
    }


    if (submitBtn) {
        submitBtn.disabled = true;
    }

    pinInputs.forEach(input => {
        input.disabled = true;
    });

    if (alertMessage) {
        alertMessage.textContent =
            `This card is locked. Please wait ${Math.ceil(timeRemaining / 1000)} seconds before trying again.`;
    }

    return true;
}


if (submitBtn && activeProfile) {

    checkCardLock();
  
    const lockTimer = setInterval(() => {

        const stillLocked = checkCardLock();

        if (!stillLocked) {
            clearInterval(lockTimer);
        }

    }, 1000);
}

btns.forEach((btn) => {

    btn.addEventListener('click', (e) => {

        e.preventDefault();

        
        if (checkCardLock()) {
            return;
        }

        const value = btn.textContent.trim();

        let currentIndex = Array.from(pinInputs)
            .findIndex(input => input.value === '');

        if (value === 'clear') {

            pinInputs.forEach(input => input.value = '');

        } else if (value === 'del') {

            let lastFilledIndex = Array.from(pinInputs)
                .findLastIndex(input => input.value !== '');

            if (lastFilledIndex !== -1) {
                pinInputs[lastFilledIndex].value = '';
            }

        } else {

            if (currentIndex !== -1) {
                pinInputs[currentIndex].value = value;
            }
        }
    });
});



if (submitBtn) {

    submitBtn.addEventListener('click', (e) => {

        e.preventDefault();

      
        if (checkCardLock()) {
            return;
        }

        const enteredPin = Array.from(pinInputs)
            .map(input => input.value)
            .join('');

        if (enteredPin.length !== 4) {
            alertMessage.textContent =
                "Please enter your four-digit PIN.";
            return;
        }

        if (enteredPin === activeProfile.pinCode) {
            localStorage.removeItem(attemptKey);
            localStorage.removeItem(lockKey);
            window.location.href = "./dashboard.html";
            return;

        } else {

            failedInput++;

            localStorage.setItem(attemptKey, failedInput);
        }

        const remainingAttempts = 3 - failedInput;

        if (failedInput < 3) {

            alertMessage.textContent =
                `Incorrect PIN. You have ${remainingAttempts} attempts remaining.`;

            return;

        } else {
            const lockExpiry = Date.now() + LOCK_DURATION;
            localStorage.setItem(lockKey, lockExpiry);
            checkCardLock();
        }
    });
}

if (customAmountInput && activeProfile) {

    quickAmountRadios.forEach((radio) => {

        if (radio.checked) {
            customAmountInput.value =
                `₦${Number(radio.value).toLocaleString()}`;
        }

        radio.addEventListener('change', () => {

            customAmountInput.value =
                `₦${Number(radio.value).toLocaleString()}`;

            if (confirmWithdrawBtn) {
                const isValid = validateWithdrawal();
                confirmWithdrawBtn.hidden = !isValid;
            }

            if (confirmDepositBtn) {
                const isValidDeposit = validateDeposit();
                confirmDepositBtn.hidden = !isValidDeposit;
            }

        });

    });

    customAmountInput.addEventListener('input', () => {

        quickAmountRadios.forEach((radio) => {
            radio.checked = false;
        });

    });

}


withdrawButton.forEach((wbtn) => {
wbtn.addEventListener('click', () => {
const value = wbtn.textContent.trim().toLowerCase();

    if (!activeKeypadInput) return;

    let currentValue = activeKeypadInput.value;

    // Remove the currency symbol and commas from the amount.
    if (activeKeypadInput === customAmountInput) {
        currentValue = currentValue.replace(/\D/g, '');
    }

    if (value === 'clear') {
        currentValue = '';
    } else if (value === 'delete') {
        currentValue = currentValue.slice(0, -1);
    } else if (/^\d$/.test(value)) {
        currentValue += value;
    }

    // Update the amount input.
    if (activeKeypadInput === customAmountInput) {
        activeKeypadInput.value = currentValue
            ? `₦${Number(currentValue).toLocaleString()}`
            : '₦';
    } else if (activeKeypadInput === destinationAccountInput) {
        // Keep account numbers numeric and limit them to 10 digits.
        activeKeypadInput.value = currentValue.replace(/\D/g, '').slice(0, 10);
    }

    // Preserve your existing withdrawal and deposit validation.
    if (confirmWithdrawBtn) {
        confirmWithdrawBtn.hidden = !validateWithdrawal();
    }

    if (confirmDepositBtn) {
        confirmDepositBtn.hidden = !validateDeposit();
    }

    // Validate the transfer when using either input.
    if (confirmTransferBtn) {
        updateTransferButton();
    }
});
});




function validateWithdrawal() {
    const amount = Number(
        customAmountInput.value.replace(/\D/g, '')
    );

    if (amount <= 0) {
        withdrawMessage.textContent = 'Please enter a valid amount.';
        return false;
    }

    if (amount % 1000 !== 0) {
        withdrawMessage.textContent =
            'This amount cannot be dispensed. This demo terminal supports ₦1,000 notes only.';
        return false;
    }

    if (amount > activeProfile.balance) {
        withdrawMessage.textContent =
            `Insufficient funds. Your available balance is ₦${activeProfile.balance.toLocaleString()}. Please adjust the amount to continue.`;
        return false;
    }

    withdrawMessage.textContent = '';
    return true;
}



if (confirmWithdrawBtn && activeProfile) {
    confirmWithdrawBtn.addEventListener('click', () => {

        const isValid = validateWithdrawal();

        if (!isValid) {
            confirmWithdrawBtn.hidden = true;
            return;
        }

        const amount = Number(
            customAmountInput.value.replace(/\D/g, '')
        );


        activeProfile.balance -= amount;

        localStorage.setItem(balanceKey, activeProfile.balance);

        const transaction = {
            userId: savedsession,
            accountNo: activeProfile.accountNo,
            type: 'Withdrawal',
            amount: amount,
            updatedBalance: activeProfile.balance,
            reference: `ATM-${Date.now()}`,
            dateTime: new Date().toISOString()
        };

        localStorage.setItem(
            'lastWithdrawal',
            JSON.stringify(transaction)
        );
     const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');

     allTransactions.push(transaction);

     localStorage.setItem( 'transactions',JSON.stringify(allTransactions));

     window.location.href = './withdraw_success.html';
    });
}


function validateDeposit() {
    const amount = Number(
        customAmountInput.value.replace(/\D/g, '')
    );

    if (amount <= 0) {
        withdrawMessage.textContent = 'Please enter a valid amount.';
        return false;
    }

    if (amount < 1000) {
        withdrawMessage.textContent =
            'This amount cannot be deposited. This demo terminal supports ₦1,000 notes upward.';
        return false;
    }

    if (amount > 200000) {
        withdrawMessage.textContent =
            'Configured demo limit: ₦200,000 per deposit.';
        return false;
    }

    withdrawMessage.textContent = '';
    return true;
}


if (confirmDepositBtn  && activeProfile) {
    
    confirmDepositBtn.addEventListener('click', () => {

        const isValidDeposit = validateDeposit();

        if (!isValidDeposit) {
            confirmDepositBtn.hidden = true;
            return;
        }

        const amount = Number(
            customAmountInput.value.replace(/\D/g, '')
        );


        activeProfile.balance += amount;

        localStorage.setItem(balanceKey, activeProfile.balance);

        const transaction = {
            userId: savedsession,
            accountNo: activeProfile.accountNo,
            type: 'Deposit',
            amount: amount,
            updatedBalance: activeProfile.balance,
            reference: `ATM-${Date.now()}`,
            dateTime: new Date().toISOString()
        };

        localStorage.setItem(
            'lastDeposit',
            JSON.stringify(transaction)
        );

     const allTransactions =
       JSON.parse(localStorage.getItem('transactions') || '[]');

     allTransactions.push(transaction);

     localStorage.setItem( 'transactions',JSON.stringify(allTransactions));

     window.location.href = './deposit-success.html';
    });
}

// const recipientEntry = Object.entries(ATM_USERS).find(
//     ([userId, user]) =>
//         user.transferAccountNo === destinationAccount
// );



const destinationAccountInput = document.getElementById("destination-account" )
const destinationBankInput = document.getElementById("destination-bank")
const transferMessage = document.getElementById("transfer-message")
const confirmTransferBtn = document.getElementById("confirm-transfer")

let activeKeypadInput = customAmountInput;

if (destinationAccountInput) {
    destinationAccountInput.addEventListener('focus', () => {
        activeKeypadInput = destinationAccountInput;
    });
}

if (customAmountInput) {
    customAmountInput.addEventListener('focus', () => {
        activeKeypadInput = customAmountInput;
    });
}


function validateTransfer() {
    if (
        !customAmountInput ||
        !destinationAccountInput ||
        !destinationBankInput ||
        !activeProfile
    ) {
        return false;
    }

    const destinationAccount = destinationAccountInput.value.trim();

    const amount = Number(
        customAmountInput.value.replace(/\D/g, '')
    );

    const selectedBank = destinationBankInput.value;

    if (!/^\d{10}$/.test(destinationAccount)) {
        transferMessage.textContent =
            'Please enter a valid 10-digit account number.';
        return false;
    }

    if (!selectedBank) {
        transferMessage.textContent =
            'Please select a destination bank.';
        return false;
    }

    if (!Number.isSafeInteger(amount) || amount <= 0) {
        transferMessage.textContent =
            'Please enter a valid transfer amount.';
        return false;
    }

    if (amount > activeProfile.balance) {
        transferMessage.textContent =
            `Insufficient funds. Your available balance is ₦${activeProfile.balance.toLocaleString()}. Please adjust the amount to continue.`;
        return false;
    }

    transferMessage.textContent = '';
    return true;

}



function updateTransferButton() {
    if (!confirmTransferBtn) return;

    confirmTransferBtn.hidden = !validateTransfer();
}

if ( confirmTransferBtn && customAmountInput && destinationAccountInput &&  destinationBankInput
) {
    confirmTransferBtn.hidden = true;

    customAmountInput.addEventListener('input', updateTransferButton);

    destinationAccountInput.addEventListener('input', updateTransferButton);

    destinationBankInput.addEventListener('change', updateTransferButton);

    customAmountInput.addEventListener( 'input', updateTransferButton );
}



if (
    confirmTransferBtn &&
    customAmountInput &&
    destinationAccountInput &&
    destinationBankInput &&
    activeProfile
) {
    confirmTransferBtn.addEventListener('click', () => {
        const isValid = validateTransfer();

        if (!isValid) {
            confirmTransferBtn.hidden = true;
            return;
        }

        const destinationAccount = destinationAccountInput.value.trim();
        const destinationBank = destinationBankInput.value;

        const amount = Number(
            customAmountInput.value.replace(/\D/g, '')
        );

        // Find the recipient using their unique transfer account number.
        const recipientEntry = Object.entries(ATM_USERS).find(
            ([userId, user]) =>
                user.transferAccountNo === destinationAccount
        );

        let recipientId = null;
        let recipientProfile = null;

        if (recipientEntry) {
            recipientId = recipientEntry[0];
            recipientProfile = recipientEntry[1];
        }

        // Prevent transferring to the sender's own account.
        if (recipientId === savedsession) {
            transferMessage.textContent =
                'You cannot transfer money to your own account.';
            return;
        }

        // Get the sender's latest saved balance.
        const senderBalanceKey = `balance-${savedsession}`;
        const senderSavedBalance = localStorage.getItem(senderBalanceKey);

        const senderBalance = senderSavedBalance !== null
            ? Number(senderSavedBalance)
            : activeProfile.balance;

        // Get the recipient's latest saved balance if they are registered.
        let recipientBalanceKey = null;
        let recipientBalance = null;

        if (recipientProfile) {
            recipientBalanceKey = `balance-${recipientId}`;

            const recipientSavedBalance =
                localStorage.getItem(recipientBalanceKey);

            recipientBalance = recipientSavedBalance !== null
                ? Number(recipientSavedBalance)
                : recipientProfile.balance;
        }

        // Recheck the sender's balance before processing.
        if (
            !Number.isSafeInteger(senderBalance) ||
            senderBalance < amount
        ) {
            transferMessage.textContent =
                'Insufficient funds. Please check your available balance.';
            return;
        }

        // Check that the recipient's balance can safely be increased.
        if (
            recipientProfile &&
            (
                !Number.isSafeInteger(recipientBalance) ||
                !Number.isSafeInteger(recipientBalance + amount)
            )
        ) {
            transferMessage.textContent =
                'This transfer cannot be processed. Please try again.';
            return;
        }

        // Create one reference and timestamp for the transfer.
        const reference = `TRF-${Date.now()}`;
        const dateTime = new Date().toISOString();

        const updatedSenderBalance = senderBalance - amount;

        const updatedRecipientBalance = recipientProfile
            ? recipientBalance + amount
            : null;

        // Build the sender's transaction record.
        const senderTransaction = {
            userId: savedsession,
            accountNo: activeProfile.accountNo,
            type: 'Transfer',
            direction: 'Sent',
            amount: amount,
            updatedBalance: updatedSenderBalance,
            recipientName: recipientProfile
                ? recipientProfile.username
                : 'External demo recipient',
            recipientAccount: destinationAccount,
            recipientBank: destinationBank,
            reference: reference,
            dateTime: dateTime,
            status: 'Simulated'
        };

        // Build a recipient transaction only for a registered user.
        let recipientTransaction = null;

        if (recipientProfile) {
            recipientTransaction = {
                userId: recipientId,
                accountNo: recipientProfile.accountNo,
                type: 'Transfer',
                direction: 'Received',
                amount: amount,
                updatedBalance: updatedRecipientBalance,
                senderName: activeProfile.username,
                senderAccount: activeProfile.transferAccountNo,
                reference: reference,
                dateTime: dateTime,
                status: 'Simulated'
            };
        }

        // Read the existing transaction history.
        const allTransactions = JSON.parse(
            localStorage.getItem('transactions') || '[]'
        );

        // Prepare the new history before changing balances.
        allTransactions.push(senderTransaction);

        if (recipientTransaction) {
            allTransactions.push(recipientTransaction);
        }

        // Update the sender's profile and persist the balance.
        activeProfile.balance = updatedSenderBalance;

        localStorage.setItem(
            senderBalanceKey,
            String(updatedSenderBalance)
        );

        // Credit the recipient when they are one of our registered users.
        if (recipientProfile) {
            recipientProfile.balance = updatedRecipientBalance;

            localStorage.setItem(
                recipientBalanceKey,
                String(updatedRecipientBalance)
            );
        }

        // Save the updated shared transaction history.
        localStorage.setItem(
            'transactions',
            JSON.stringify(allTransactions)
        );

        // Save the sender's receipt details.
        localStorage.setItem(
            'lastTransfer',
            JSON.stringify(senderTransaction)
        );

        // Redirect the sender to the receipt page.
        window.location.href = './transfer-success.html';
    });
}

const savedTransfer = localStorage.getItem('lastTransfer');
const receiptContainer = document.querySelector('.receipt-container');

if (receiptContainer) {
    if (savedTransfer) {
        const transaction = JSON.parse(savedTransfer);

        // Keep your existing receipt-display code here.
    } else {
        receiptContainer.textContent =
            'No transfer receipt is available. Please complete a transfer first.';
    }
}


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


   if (receiptAmount) {
    receiptAmount.textContent = `₦${transaction.amount.toLocaleString()}`;
   }

   if(receiptStatus){
        receiptStatus.textContent = transaction.status;
   }

    if(receiptRecipient){
        receiptRecipient.textContent = transaction.recipientName;
    }

    if(receiptAccount){
        receiptAccount.textContent = transaction.recipientAccount;
    }

    if(receiptBank){
        receiptBank.textContent = transaction.recipientBank;
    }

    if(receiptReference){
        receiptReference.textContent = transaction.reference;
    }

    if(receiptDate){
        receiptDate.textContent =
        new Date(transaction.dateTime).toLocaleString();
    }

    if(receiptBalance){
        receiptBalance.textContent =
        `₦${transaction.updatedBalance.toLocaleString()}`;
    }
} else {
    document.querySelector('.receipt-container').textContent =
        'No transfer receipt is available. Please complete a transfer first.';
}




const transactionRows = document.getElementById('transaction-rows');
const emptyTransactions = document.getElementById('empty-transactions');
const transactionTable = document.getElementById('transaction-table');

const filterAll = document.getElementById('filter-all');
const filterDeposits = document.getElementById('filter-deposits');
const filterWithdrawals = document.getElementById('filter-withdrawals');
const filterTransfers = document.getElementById('filter-transfers');

if (
    transactionRows &&
    emptyTransactions &&
    transactionTable &&
    filterAll &&
    filterDeposits &&
    filterWithdrawals &&
    filterTransfers
) {

    const savedTransactions = JSON.parse(
        localStorage.getItem('transactions') || '[]'
    );

    const userTransactions = savedTransactions.filter(
        transaction => transaction.userId === savedsession
    );

    function displayTransactions(transactions) {

        transactionRows.innerHTML = '';

        transactions.forEach((transaction) => {

            const row = document.createElement('tr');

            row.innerHTML = `
                <td data-label="Transaction / Date">
                    <strong>${transaction.type}</strong>
                    <span>${new Date(transaction.dateTime).toLocaleString()}</span>
                </td>

                <td data-label="Reference">
                    ${transaction.reference}
                </td>

                <td class="transaction-amount" data-label="Amount">
                    ${transaction.type === 'Deposit' ? '+' : transaction.type === 'Withdrawal' ? '−' : ''}
                    ₦${transaction.amount.toLocaleString()}
                </td>

                <td data-label="Status">
                    <span class="transaction-status">
                        Completed · Demo
                    </span>
                </td>
            `;

            transactionRows.appendChild(row);

        });

        if (transactions.length === 0) {
            emptyTransactions.hidden = false;
            transactionTable.hidden = true;
        } else {
            emptyTransactions.hidden = true;
            transactionTable.hidden = false;
        }

    }

    function applyTransactionFilter() {

        let filteredTransactions = userTransactions;

        if (filterDeposits.checked) {

            filteredTransactions = userTransactions.filter(
                transaction => transaction.type === 'Deposit'
            );

        } else if (filterWithdrawals.checked) {

            filteredTransactions = userTransactions.filter(
                transaction => transaction.type === 'Withdrawal'
            );

        } else if (filterTransfers.checked) {

            filteredTransactions = userTransactions.filter(
                transaction => transaction.type === 'Transfer'
            );

        }

        displayTransactions(filteredTransactions);

    }

    filterAll.addEventListener('change', applyTransactionFilter);
    filterDeposits.addEventListener('change', applyTransactionFilter);
    filterWithdrawals.addEventListener('change', applyTransactionFilter);
    filterTransfers.addEventListener('change', applyTransactionFilter);

    applyTransactionFilter();

}

