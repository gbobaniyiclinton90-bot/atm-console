const atmUsersContainer = document.getElementById('atmUsersContainer');
const cardboxes = document.querySelectorAll('.d_account');
const nameDisplay = document.getElementById('names');
const cardDisplay = document.getElementById('card-details');
const btns = document.querySelectorAll(".button");
const pinInputs = document.querySelectorAll('.displayInput');
const useerName = document.getElementById('user-name');
const cardNumber = document.getElementById('card-number');
const submitBtn = document.getElementById('submit-pin-btn');
const alertMessage = document.getElementById('alert-message');

const savedsession = localStorage.getItem('activeUserId');
const activeProfile = ATM_USERS[savedsession];

const attemptKey = `failedInput-${savedsession}`;
const lockKey = `lockExpiry-${savedsession}`;

let failedInput = Number(localStorage.getItem(attemptKey)) || 0;

const LOCK_DURATION = 30000;


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


if (nameDisplay && cardDisplay) {
    if (activeProfile) {
        nameDisplay.innerText = activeProfile.username;
        cardDisplay.innerText = activeProfile.accountNo;
    }   

    console.log(activeProfile);
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


