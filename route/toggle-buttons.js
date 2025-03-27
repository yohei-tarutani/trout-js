export function toggleButtonsVisibility() {
  const buttonsBox = document.querySelector(".buttons-box");
  if (buttonsBox) {
    buttonsBox.classList.toggle("visually-hidden");
  }
}
// export function hideButtonsVisibility() {
//   const buttonsBox = document.querySelector(".buttons-box");
//   if (buttonsBox) {
//     buttonsBox.classList.add("visually-hidden");
//   }
// }
document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll("button");
  const originalColor = "white";
  const activeColor = "#C6CCD0";

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      buttons.forEach((btn) => {
        btn.style.backgroundColor = originalColor;
      });

      this.style.backgroundColor = activeColor;
    });
  });
});

//now or never
