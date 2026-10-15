

const atmUsersContainer = document.getElementById('atmUsersContainer');
const cardboxes = document.querySelectorAll('.d_account');
const nameDisplay = document.getElementById('names');
const cardDisplay = document.getElementById('card-details');
const btns = document.querySelectorAll(".button")
const pinInputs = document.querySelectorAll('.displayInput')
const useerName = document.getElementById('user-name');
const cardNumber = document.getElementById('card-number');
const submitBtn = document.getElementById('submit-pin-btn');

if (atmUsersContainer) {    

for ( const [userId,user] of Object.entries(ATM_USERS)){
        
 const cards = document.createElement('div')
 cards.classList.add("d_account");
 cards.innerHTML = `
   <h3>${user.username}</h3>
   <p>${user.accountNo}</p>
   `;
    cards.addEventListener("click", ()=>{
     localStorage.setItem('activeUserId', userId);
      window.location.href = "./passcode_page.html";
    })

   atmUsersContainer.appendChild(cards)
}
}

if (nameDisplay && cardDisplay){
    const savedsession= localStorage.getItem('activeUserId');
    const activeProfile = ATM_USERS[savedsession];

  if (activeProfile) {
        nameDisplay.innerText = activeProfile.username;
        cardDisplay.innerText = activeProfile.accountNo;   
    }  

    console.log(activeProfile)
}


btns.forEach((btn)=>{
    btn.addEventListener('click',(e)=>{
    e.preventDefault()

    const value = btn.textContent.trim()
    let currentIndex = Array.from(pinInputs).findIndex(input => input.value === '');
    if (value === 'clear') {
    pinInputs.forEach(input => input.value = '');
    }else if (value === 'del') {
        let lastFilledIndex = Array.from(pinInputs).findLastIndex(input => input.value !== '');
        if (lastFilledIndex !== -1) {
            pinInputs[lastFilledIndex].value = '';
        }
    
    }else {
    if (currentIndex !== -1) {
        pinInputs[currentIndex].value = value;
    }


}})
})
 
submitBtn.addEventListener('click', (e)=>{
    e.preventDefault()
 const enteredPin = Array.from(pinInputs)
    .map(input => input.value)
    .join('');

    const savedsession= localStorage.getItem('activeUserId');
    const activeProfile = ATM_USERS[savedsession];

    if (enteredPin.length !== 4) {
        const alertMessage = document.getElementById('alert-message');
        alertMessage.textContent = "Please enter your four-digit PIN.";
        return;
    }

    if (enteredPin === activeProfile.pinCode) {
        window.location.href = "./dashboard.html";
    }
})

//  let failedInput = 0;
//     failedInput++;
//     const remainingAttempts = 3 - failedInput;
//     if(failedInput < 3){
//      alert(`Incorrect PIN. You have ${remainingAttempts} attempts remaining.`);
//      }
