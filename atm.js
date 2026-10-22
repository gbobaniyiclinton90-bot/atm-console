const atmUsersContainer = document.getElementById('atmUsersContainer');
const nameDisplay = document.getElementById('names');
const cardDisplay = document.getElementById('card-details');
const btns = document.querySelectorAll(".button");
const pinInputs = document.querySelectorAll('.displayInput');
const submitBtn = document.getElementById('submit-pin-btn');
const alertMessage = document.getElementById('alert-message');
const balanceDisplay = document.getElementById('balance');
const savedsession = localStorage.getItem('activeUserId');
const activeProfile = ATM_USERS[savedsession];

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

const balanceKey = `balance-${savedsession}`;
const savedBalance = localStorage.getItem(balanceKey);

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
        let amount = customAmountInput.value.replace(/\D/g, '');

        if (value === 'clear') {
            amount = '';

        } else if (value === 'delete') {
            amount = amount.slice(0, -1);

        } else if (/^\d$/.test(value)) {

            amount += value;

        }
        customAmountInput.value = amount
            ? `₦${Number(amount).toLocaleString()}`
            : '₦';


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



if (confirmWithdrawBtn && customAmountInput && activeProfile) {
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
            amount: amount,
            updatedBalance: activeProfile.balance,
            reference: `ATM-${Date.now()}`,
            dateTime: new Date().toISOString()
        };

        localStorage.setItem(
            'lastWithdrawal',
            JSON.stringify(transaction)
        );

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


if (confirmDepositBtn && customAmountInput && activeProfile) {
    
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
            amount: amount,
            updatedBalance: activeProfile.balance,
            reference: `ATM-${Date.now()}`,
            dateTime: new Date().toISOString()
        };

        localStorage.setItem(
            'lastDeposit',
            JSON.stringify(transaction)
        );

        window.location.href = './deposit-withdraw.html';
    });
}

const withdrawalSavedTransaction = localStorage.getItem('lastWithdrawal');
const transactionReference = document.getElementById("transaction-reference")
const transactionDate = document.getElementById("transaction-date-time")
const transactionAmount = document.getElementById("transaction-amount")

const withdrawalTransaction = withdrawalSavedTransaction
    ? JSON.parse(withdrawalSavedTransaction)
    : null;


if(transactionReference){
    transactionReference.textContent = withdrawalTransaction.reference
}

if(transactionDate){
    transactionDate.textContent =  new Date(withdrawalTransaction.dateTime).toLocaleString();
}

if(transactionAmount){
    transactionAmount .textContent= `₦${withdrawalSavedTransaction.amount.toLocaleString()}`;
}

const depositSavedTrasaction = localStorage.getItem('lastDeposit')

const depositTransaction = depositSavedTrasaction
    ? JSON.parse(depositSavedTrasaction)
    : null;


if(transactionReference){
    transactionReference.textContent = depositTransaction.reference
}

if(transactionDate){
    transactionDate.textContent =  new Date(depositTransaction.dateTime).toLocaleString();
}

if(transactionAmount){
    transactionAmount .textContent= `₦${depositTransaction.amount.toLocaleString()}`;
}

