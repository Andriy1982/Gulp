
const btnRef = document.querySelector('.open-modal-js');
const navRef = document.querySelector('.open-nav-js');

const openMenu = ({target}) => {
    target.classList.toggle('close');
    navRef.classList.toggle('active');
}

btnRef.addEventListener('click', openMenu )