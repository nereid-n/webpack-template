if ((document.querySelector('[data-modal]'))) {
    const btns = document.querySelectorAll('[data-modal]');
    for (let i = 0; i < btns.length; i++) {
        const btn = btns[i] as HTMLElement;
        btn.addEventListener('click', () => {
            const id = btn.dataset.modal;
            const modal = document.getElementById(id);
            modal.classList.add('active');
        });
    }
}

if ((document.querySelector('[data-modal-close]'))) {
    const btns = document.querySelectorAll('[data-modal-close]');
    for (let i = 0; i < btns.length; i++) {
        const btn = btns[i] as HTMLElement;
        btn.addEventListener('click', () => {
            const id = btn.dataset.modalClose;
            const modal = document.getElementById(id);
            modal.classList.remove('active');
        });
    }
}