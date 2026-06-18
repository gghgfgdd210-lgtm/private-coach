const app = {
    currentUser: null,
    loginType: 'coach',
    players: [],

    init() {
        // Generate QR Codes
        this.generateQRs();
        
        // Load data
        this.loadData();
    },

    generateQRs() {
        const qrConfig = { width: 100, height: 100, colorDark: "#000", colorLight: "#fff" };
        
        new QRCode(document.getElementById("qr-tiktok"), { text: "https://www.tiktok.com/@a7elite96?_r=1&_t=ZS-97JTXoeZG3p", ...qrConfig });
        new QRCode(document.getElementById("qr-fb1"), { text: "https://www.facebook.com/share/1BiifKRhow/?mibextid=wwXIfr", ...qrConfig });
        new QRCode(document.getElementById("qr-fb2"), { text: "https://www.facebook.com/share/1BqfMrfbUY/?mibextid=wwXIfr", ...qrConfig });
        new QRCode(document.getElementById("qr-wa"), { text: "https://wa.me/201145345321", ...qrConfig });
    },

    showSection(sectionId) {
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById('section-' + sectionId).classList.add('active');
    },

    setLoginType(type) {
        this.loginType = type;
        const tabs = document.querySelectorAll('.tab-btn');
        tabs[0].classList.toggle('active', type === 'coach');
        tabs[1].classList.toggle('active', type === 'player');
    },

    handleLogin(e) {
        e.preventDefault();
        const user = document.getElementById('login-username').value;
        const pass = document.getElementById('login-password').value;

        if (this.loginType === 'coach') {
            if (user === 'mama' && pass === '197769') {
                this.currentUser = 'coach';
                sessionStorage.setItem('isCoach', 'true');
                document.getElementById('nav-dashboard').style.display = 'inline-block';
                document.getElementById('nav-logout').style.display = 'inline-block';
                this.renderPlayers();
                this.showSection('dashboard');
                e.target.reset();
            } else {
                alert('بيانات المدرب غير صحيحة');
            }
        } else {
            // Player login
            const player = this.players.find(p => p.name === user && p.password === pass);
            if (player) {
                sessionStorage.removeItem('isCoach');
                window.location.href = `player.html?id=${player.id}`;
            } else {
                alert('اسم اللاعب أو كلمة المرور غير صحيحة');
            }
        }
    },

    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('isCoach');
        document.getElementById('nav-dashboard').style.display = 'none';
        document.getElementById('nav-logout').style.display = 'none';
        this.showSection('home');
    },

    // --- Player Management ---
    loadData() {
        const data = localStorage.getItem('coachPlayers');
        if (data) {
            this.players = JSON.parse(data);
        }
    },

    saveData() {
        localStorage.setItem('coachPlayers', JSON.stringify(this.players));
        this.renderPlayers();
    },

    openPlayerModal(id = null) {
        const modal = document.getElementById('player-modal');
        const form = document.getElementById('player-form');
        form.reset();
        
        if (id) {
            const player = this.players.find(p => p.id === id);
            document.getElementById('modal-title').innerText = 'تعديل بيانات اللاعب';
            document.getElementById('p-id').value = player.id;
            document.getElementById('p-name').value = player.name;
            document.getElementById('p-password').value = player.password || '';
            document.getElementById('p-image').value = player.image || '';
            document.getElementById('p-phone').value = player.phone || '';
            document.getElementById('p-start-date').value = player.startDate;
            document.getElementById('p-days').value = player.days;
            document.getElementById('p-end-date').value = player.endDate;
            document.getElementById('p-sessions').value = player.sessions;
            document.getElementById('p-payment').value = player.payment;
            document.getElementById('p-passing').value = player.stats.passing;
            document.getElementById('p-shooting').value = player.stats.shooting;
            document.getElementById('p-dribbling').value = player.stats.dribbling;
            document.getElementById('p-agility').value = player.stats.agility;
            document.getElementById('p-notes').value = player.notes;
        } else {
            document.getElementById('modal-title').innerText = 'إضافة لاعب جديد';
            document.getElementById('p-id').value = '';
        }
        
        modal.style.display = 'block';
    },

    closePlayerModal() {
        document.getElementById('player-modal').style.display = 'none';
    },

    calculateEndDate() {
        const start = document.getElementById('p-start-date').value;
        const days = parseInt(document.getElementById('p-days').value);
        
        if (start && days) {
            const date = new Date(start);
            date.setDate(date.getDate() + days);
            document.getElementById('p-end-date').value = date.toISOString().split('T')[0];
        }
    },

    savePlayer(e) {
        e.preventDefault();
        
        const id = document.getElementById('p-id').value || Date.now().toString();
        const existingIndex = this.players.findIndex(p => p.id === id);
        const existingPlayer = existingIndex >= 0 ? this.players[existingIndex] : null;

        const playerData = {
            id: id,
            name: document.getElementById('p-name').value,
            password: document.getElementById('p-password').value,
            image: document.getElementById('p-image').value,
            phone: document.getElementById('p-phone').value,
            startDate: document.getElementById('p-start-date').value,
            days: document.getElementById('p-days').value,
            endDate: document.getElementById('p-end-date').value,
            sessions: document.getElementById('p-sessions').value,
            payment: document.getElementById('p-payment').value,
            stats: {
                passing: document.getElementById('p-passing').value,
                shooting: document.getElementById('p-shooting').value,
                dribbling: document.getElementById('p-dribbling').value,
                agility: document.getElementById('p-agility').value
            },
            notes: document.getElementById('p-notes').value,
            attendance: existingPlayer ? existingPlayer.attendance : []
        };

        if (existingIndex >= 0) {
            this.players[existingIndex] = playerData;
        } else {
            this.players.push(playerData);
        }

        this.saveData();
        this.closePlayerModal();
    },

    deletePlayer(id) {
        if(confirm('هل أنت متأكد من حذف هذا اللاعب؟')) {
            this.players = this.players.filter(p => p.id !== id);
            this.saveData();
        }
    },

    searchPlayers() {
        const term = document.getElementById('search-player').value.toLowerCase();
        this.renderPlayers(term);
    },

    renderPlayers(filterTerm = '') {
        const container = document.getElementById('players-list');
        const alertsContainer = document.getElementById('alerts-container');
        container.innerHTML = '';
        if(alertsContainer) alertsContainer.innerHTML = '';

        const filtered = this.players.filter(p => p.name.toLowerCase().includes(filterTerm));
        let alertsHtml = '';

        filtered.forEach(player => {
            if (player.endDate) {
                const end = new Date(player.endDate);
                const today = new Date();
                today.setHours(0,0,0,0);
                const diffTime = end - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let waButton = '';
                if (player.phone) {
                    const msg = encodeURIComponent(`أهلاً كابتن ${player.name}، نذكرك بموعد تجديد اشتراكك التدريبي. مع تحيات برايفت كوتش أحمد طه.`);
                    waButton = `<a href="https://wa.me/${player.phone}?text=${msg}" target="_blank" class="btn-success" style="padding: 0.2rem 0.5rem; margin-right: 1rem; text-decoration: none; font-size: 0.9rem; border-radius: 4px; color: #fff;"><i class="fab fa-whatsapp"></i> مراسلة</a>`;
                }

                if (diffDays <= 3 && diffDays >= 0) {
                    alertsHtml += `
                        <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(245, 158, 11, 0.2); border-right: 4px solid var(--warning); padding: 1rem; border-radius: 4px; margin-bottom: 0.5rem; color: #fff;">
                            <div><i class="fas fa-exclamation-triangle" style="color: var(--warning);"></i> تذكير: اشتراك <strong>${player.name}</strong> ينتهي خلال ${diffDays} أيام.</div>
                            ${waButton}
                        </div>
                    `;
                } else if (diffDays < 0) {
                    alertsHtml += `
                        <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(239, 68, 68, 0.2); border-right: 4px solid var(--danger); padding: 1rem; border-radius: 4px; margin-bottom: 0.5rem; color: #fff;">
                            <div><i class="fas fa-times-circle" style="color: var(--danger);"></i> تنبيه: اشتراك <strong>${player.name}</strong> انتهى منذ ${Math.abs(diffDays)} أيام.</div>
                            ${waButton}
                        </div>
                    `;
                }
            }

            let statusClass, statusText;
            if(player.payment === 'paid') { statusClass = 'bg-green'; statusText = 'تم السداد'; }
            else if(player.payment === 'partial') { statusClass = 'bg-yellow'; statusText = 'متبقي جزء'; }
            else { statusClass = 'bg-red'; statusText = 'لم يسدد'; }

            const card = document.createElement('div');
            card.className = 'player-card';
            card.innerHTML = `
                <div class="p-card-header">
                    <h3>${player.name}</h3>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <p>الحصص: ${player.sessions} | الأيام: ${player.days}</p>
                <p>ينتهي في: ${player.endDate}</p>
                <div class="card-actions">
                    <button class="btn-primary" onclick="window.open('player.html?id=${player.id}', '_blank')"><i class="fas fa-eye"></i></button>
                    <button class="btn-secondary" onclick="app.openPlayerModal('${player.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-danger" onclick="app.deletePlayer('${player.id}')"><i class="fas fa-trash"></i></button>
                </div>
            `;
            container.appendChild(card);
        });

        if (alertsHtml && alertsContainer) {
            alertsContainer.innerHTML = '<h3 style="margin-bottom: 1rem; color: var(--warning);">تنبيهات الاشتراكات القريبة من الانتهاء</h3>' + alertsHtml;
        }
    },

    viewPlayer(id, isCoach) {
        const player = this.players.find(p => p.id === id);
        const container = document.getElementById('player-profile-content');
        
        let statusClass, statusText;
        if(player.payment === 'paid') { statusClass = 'bg-green'; statusText = 'تم السداد'; }
        else if(player.payment === 'partial') { statusClass = 'bg-yellow'; statusText = 'متبقي جزء'; }
        else { statusClass = 'bg-red'; statusText = 'لم يسدد'; }

        const playerImageHtml = player.image ? `<div class="player-img-container"><img src="${player.image}" alt="${player.name}"></div>` : '';

        container.innerHTML = `
            ${playerImageHtml}
            <div class="detail-header">
                <h2>الملف الشخصي: ${player.name}</h2>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>

            <div class="detail-section">
                <h3>بيانات الاشتراك</h3>
                <p><strong>تاريخ البداية:</strong> ${player.startDate} | <strong>تاريخ النهاية:</strong> ${player.endDate}</p>
                <p><strong>إجمالي الحصص:</strong> ${player.sessions} حصص | <strong>فترة التمرين:</strong> ${player.days} أيام</p>
            </div>

            <div class="detail-section">
                <h3>التقييم الفني</h3>
                <div class="stats-grid">
                    <div class="stat-box">
                        <span class="stat-name">تمرير (${player.stats.passing}%)</span>
                        <div class="progress-bar"><div class="progress-fill" style="width: ${player.stats.passing}%"></div></div>
                    </div>
                    <div class="stat-box">
                        <span class="stat-name">تسديد (${player.stats.shooting}%)</span>
                        <div class="progress-bar"><div class="progress-fill" style="width: ${player.stats.shooting}%"></div></div>
                    </div>
                    <div class="stat-box">
                        <span class="stat-name">مراوغة (${player.stats.dribbling}%)</span>
                        <div class="progress-bar"><div class="progress-fill" style="width: ${player.stats.dribbling}%"></div></div>
                    </div>
                    <div class="stat-box">
                        <span class="stat-name">رشاقة (${player.stats.agility}%)</span>
                        <div class="progress-bar"><div class="progress-fill" style="width: ${player.stats.agility}%"></div></div>
                    </div>
                </div>
            </div>

            ${isCoach && player.notes ? `
            <div class="detail-section">
                <h3>ملاحظات المدرب</h3>
                <div class="notes-box">
                    ${player.notes.replace(/\n/g, '<br>')}
                </div>
            </div>
            ` : ''}
        `;

        this.showSection('player-detail');
    }
};

// Initialize App
window.onload = () => {
    app.init();
};
