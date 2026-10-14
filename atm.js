
const atmUsersContainer = document.getElementById('atmUsersContainer');
const cardboxes = document.querySelectorAll('.d_account');
const nameDisplay = document.getElementById('names');
const cardDisplay = document.getElementById('card-details');
const btns = document.querySelectorAll(".button")
const pinInputs = document.querySelectorAll('.displayInput')
const useerName = document.getElementById('user-name');
const cardNumber = document.getElementById('card-number');


atmUsersContainer



cardboxes.forEach(card => {
    card.addEventListener("click", ()=>{
     const selectedUserId = card.getAttribute('data-userid');
     localStorage.setItem('activeUserId', selectedUserId);
      window.location.href = "./passcode_page.html";

    })
})

if (nameDisplay && cardDisplay){
    const savedsession= localStorage.getItem('activeUserId');
    const activeProfile = ATM_USERS[savedsession];

  if (activeProfile) {
        nameDisplay.innerText = activeProfile.username;
        cardDisplay.innerText = activeProfile.accountNo;   
    }  
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
 

