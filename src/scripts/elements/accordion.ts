if ((document.querySelector('.accordion'))) {
    const accordions = document.querySelectorAll('.accordion');
    for (let i = 0; i < accordions.length; i++) {
        const accordion = accordions[i];
        const btns = accordion.querySelectorAll('.accordion-title');
        for (let j = 0; j < btns.length; j++) {
            const btn = btns[j];
            btn.addEventListener('click', () => {
                const active = accordion.querySelector('.active');
                const item = btn.closest('.accordion-item');
                const body = item.querySelector('.accordion-body') as HTMLElement;
                const height = item.querySelector('.accordion-content').clientHeight + 'px';
                if (active !== null) {
                    const activeBtn = active.querySelector('.accordion-title');
                    const activeBody = active.querySelector('.accordion-body') as HTMLElement;
                    if (activeBtn !== btn) {
                        active.classList.remove('active');
                        activeBody.style.height = '0';
                        item.classList.add('active');
                        body.style.height = height;
                    } else {
                        active.classList.remove('active');
                        activeBody.style.height = '0';
                    }
                } else {
                    item.classList.add('active');
                    body.style.height = height;
                }
            })
        }
    }
    const activeBodies = document.querySelectorAll('.accordion-item.active .accordion-body');
    for (let i = 0; i < activeBodies.length; i++) {
        const activeBody = activeBodies[i] as HTMLElement;
        const height = activeBody.querySelector('.accordion-content').clientHeight + 'px';
        activeBody.style.height = height;
    }
}