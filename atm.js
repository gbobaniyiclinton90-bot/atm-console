const adams = document.getElementById('adams')
const clinton = document.getElementById('clinton')
const names = document.getElementById('names')
const user1 = document.getElementById('user1')
const user2 = document.getElementById('user2')

adams.addEventListener('click',()=>{
    if(user1.innerText === 'Adams John'){
        names.innerText = 'Adams John'
    }else{names.innerText = 'Clinton Tolani'}
})