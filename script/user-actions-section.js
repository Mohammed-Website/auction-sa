// My Actions Section - Tab Switching Logic
;(function () {
    'use strict';

    let eventListenersAttached = false;
    let myActionsRendered = false;

    // Create and append filter buttons to finished content
    function createFilterButtons() {
        const finishedContent = document.getElementById('finished-content');
        if (!finishedContent || document.querySelector('.finished-filters')) return;

        const filterContainer = document.createElement('div');
        filterContainer.className = 'finished-filters';
        filterContainer.style.display = 'flex';
        filterContainer.style.justifyContent = 'flex-start';
        filterContainer.style.gap = '8px';
        filterContainer.style.marginBottom = '16px';
        filterContainer.style.width = '100%';

        const buttons = [
            { id: 'won-auctions', text: 'الرابحة' },
            { id: 'lost-auctions', text: 'الخاسرة' }
        ];

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'my-actions-tab';
            button.id = btn.id;
            button.textContent = btn.text;
            button.style.margin = '0';
            button.style.padding = '8px 16px';
            filterContainer.appendChild(button);
        });

        if (finishedContent.firstChild) {
            finishedContent.insertBefore(filterContainer, finishedContent.firstChild);
        } else {
            finishedContent.appendChild(filterContainer);
        }

        const filterButtons = filterContainer.querySelectorAll('.my-actions-tab');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const isActive = this.classList.contains('active');
                filterButtons.forEach(b => b.classList.remove('active'));
                if (!isActive) {
                    this.classList.add('active');
                }
            });
        });
    }

    // Render my actions section markup
    function renderMyActionsSection() {
        const myActionsSection = document.getElementById('my-actions-section');
        if (!myActionsSection || myActionsRendered) return;

        myActionsSection.innerHTML = `
            <div class="section-content">
                <div class="my-actions-header">
                    <h1 class="my-actions-title">مشاركاتي</h1>
                </div>

                <div class="my-actions-tabs">
                    <button class="my-actions-tab active" data-tab="pending" id="pending-tab">
                        <span>المزادات قيد الانتظار</span>
                    </button>
                    <button class="my-actions-tab" data-tab="finished" id="finished-tab">
                        <span>المزادات المنتهية</span>
                    </button>
                </div>

                <div class="my-actions-content">
                    <div class="my-actions-tab-content active" id="pending-content">
                        <div class="my-actions-empty-state">
                            <p class="my-actions-empty-text">لا يوجد بيانات لعرضها</p>
                        </div>
                    </div>

                    <div class="my-actions-tab-content" id="finished-content">
                        <div class="my-actions-empty-state">
                            <p class="my-actions-empty-text">لا يوجد بيانات لعرضها</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        eventListenersAttached = false;
        myActionsRendered = true;
    }

    // Initialize tab switching
    function initMyActionsTabs() {
        if (eventListenersAttached) return;

        const tabs = document.querySelectorAll('.my-actions-tab:not(.finished-filters .my-actions-tab)');
        const tabContents = document.querySelectorAll('.my-actions-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const targetTab = this.getAttribute('data-tab');
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                tabContents.forEach(content => content.classList.remove('active'));

                const targetContent = document.getElementById(`${targetTab}-content`);
                if (targetContent) {
                    targetContent.classList.add('active');
                    if (targetTab === 'finished') {
                        setTimeout(createFilterButtons, 10);
                    }
                }
            });
        });

        eventListenersAttached = true;
    }

    // Initialize when DOM is ready
    function init() {
        const myActionsSection = document.getElementById('my-actions-section');
        if (!myActionsSection) {
            return;
        }

        renderMyActionsSection();
        initMyActionsTabs();

        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = myActionsSection.classList.contains('active');
                    if (isActive) {
                        setTimeout(() => {
                            initMyActionsTabs();
                        }, 100);
                    }
                }
            });
        });

        observer.observe(myActionsSection, {
            attributes: true,
            attributeFilter: ['class']
        });

        if (myActionsSection.classList.contains('active')) {
            initMyActionsTabs();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.MyActionsTabs = {
        init: initMyActionsTabs
    };
})();
