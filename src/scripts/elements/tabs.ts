if ((document.querySelector('.tabs-container'))) {
    const tabs = document.querySelectorAll('.tabs-container');
    for (let i = 0; i < tabs.length; i++) {
        const tabsTitles = tabs[i].querySelectorAll('.tabs-title');
        for (let j = 0; j < tabsTitles.length; j++) {
            const tab = tabsTitles[j];
            tab.addEventListener('click', () => {
                const active = tabs[i].querySelectorAll('.active');
                if (active[0] !== tab) {
                    const content = tabs[i].querySelectorAll('.tabs-content')[j];
                    active[0].classList.remove('active');
                    active[1].classList.remove('active');
                    tab.classList.add('active');
                    content.classList.add('active');
                }
            })
        }
    }
}