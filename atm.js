
const ATM_USERS = {
    "adams": {
        username: "Adams OWOADE",
        accountNo: "Savings Account · **** **** 4821",
        pinCode: "1111", 
        balance: "₦125,000.00"
    },
    "clinton": {
        username: "Clinton Gbobaniyi",
        accountNo: "Current Account · **** **** 9912",
        pinCode: "2222",
        balance: "₦98,400.00"
    }
};



const cardboxes = document.querySelectorAll('.d_account');
const nameDisplay = document.getElementById('names');
const cardDisplay = document.getElementById('card-details');


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
 
