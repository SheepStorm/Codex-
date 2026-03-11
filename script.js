const homePage = document.getElementById('home-page');
const selectionPage = document.getElementById('selection-page');
const enterBtn = document.getElementById('enter-btn');
const backBtn = document.getElementById('back-btn');

enterBtn.addEventListener('click', () => {
  homePage.classList.remove('active');
  selectionPage.classList.add('active');
});

backBtn.addEventListener('click', () => {
  selectionPage.classList.remove('active');
  homePage.classList.add('active');
});

const glassButtons = document.querySelectorAll('.glass-btn');

glassButtons.forEach((button) => {
  button.addEventListener('pointerdown', (event) => {
    button.classList.add('pressing');
    const rect = button.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    button.style.setProperty('--x', `${x}%`);
    button.style.setProperty('--y', `${y}%`);
  });

  ['pointerup', 'pointerleave', 'pointercancel'].forEach((action) => {
    button.addEventListener(action, () => {
      button.classList.remove('pressing');
      button.style.setProperty('--x', '50%');
      button.style.setProperty('--y', '50%');
    });
  });
});
