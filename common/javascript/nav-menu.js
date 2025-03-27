const menuOpen = document.querySelector(".menuHamburguer");
const menu = document.querySelector(".menu");

menuOpen.onclick = () => {
    menu.classList.toggle('open');
}
