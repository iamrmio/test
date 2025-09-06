// نمایش پیام خوش‌آمدگویی به ادمین
document.addEventListener('DOMContentLoaded', function() {
    // انتخاب عنصر خوش‌آمدگویی
    var welcome = document.getElementById('welcome');
    // تنظیم متن خوش‌آمدگویی
    welcome.textContent = 'خوش آمدید، ادمین عزیز!';
});

// نمایش نام ادمین
document.addEventListener('DOMContentLoaded', function() {
    // انتخاب عنصر نام ادمین
    var adminName = document.getElementById('adminName');
    adminName.textContent = 'ادمین اصلی';
});

(function() {
    'use strict';

    // داده‌های پیش‌فرض
    const defaultUsers = [
        { name: 'علی رضایی', email: 'ali@email.com', status: 'فعال' },
        { name: 'مریم احمدی', email: 'maryam@email.com', status: 'غیرفعال' },
        { name: 'حسین موسوی', email: 'hossein@email.com', status: 'فعال' },
        { name: 'سارا محمدی', email: 'sara@email.com', status: 'فعال' }
    ];

    const defaultReports = [
        { title: 'ورود ناموفق', date: '1403/03/20', status: 'بررسی شد' },
        { title: 'تغییر رمز عبور', date: '1403/03/19', status: 'در انتظار' },
        { title: 'ثبت کاربر جدید', date: '1403/03/18', status: 'بررسی شد' }
    ];

    // داده‌ها (قابل بازنویسی از localStorage)
    let users = [];
    let reports = [];

    // ذخیره/بارگذاری از localStorage
    function saveData() {
        try {
            localStorage.setItem('dashboardData', JSON.stringify({ users, reports }));
        } catch (e) {
            console.warn('ذخیره‌سازی ممکن نیست', e);
        }
    }

    function loadData() {
        try {
            const raw = localStorage.getItem('dashboardData');
            if (raw) {
                const parsed = JSON.parse(raw);
                users = Array.isArray(parsed.users) ? parsed.users : defaultUsers.slice();
                reports = Array.isArray(parsed.reports) ? parsed.reports : defaultReports.slice();
            } else {
                users = defaultUsers.slice();
                reports = defaultReports.slice();
            }
        } catch (e) {
            users = defaultUsers.slice();
            reports = defaultReports.slice();
        }
    }

    // نمایش امن داده‌ها در جدول (از textContent استفاده می‌شود)
    function createStatusBadge(status) {
        const span = document.createElement('span');
        span.className = 'status-badge';
        const lower = (status || '').toString().toLowerCase();
        if (lower.includes('فعال') || lower.includes('active')) span.classList.add('status-active');
        else if (lower.includes('غیر') || lower.includes('inactive')) span.classList.add('status-inactive');
        else span.classList.add('status-pending');
        span.textContent = status;
        return span;
    }

    function renderUsers(filter = '') {
        const tbody = document.querySelector('#userTable tbody');
        tbody.innerHTML = '';
        const f = (filter || '').toLowerCase();
        const filtered = users.filter(u => {
            return u.name.toLowerCase().includes(f) || u.email.toLowerCase().includes(f);
        });

        if (filtered.length === 0) {
            const tr = document.createElement('tr');
            tr.className = 'empty-row';
            const td = document.createElement('td');
            td.colSpan = 3;
            td.textContent = 'هیچ کاربری یافت نشد';
            tr.appendChild(td);
            tbody.appendChild(tr);
        } else {
            filtered.forEach(user => {
                const tr = document.createElement('tr');

                const tdName = document.createElement('td');
                tdName.textContent = user.name;
                tr.appendChild(tdName);

                const tdEmail = document.createElement('td');
                tdEmail.textContent = user.email;
                tr.appendChild(tdEmail);

                const tdStatus = document.createElement('td');
                tdStatus.appendChild(createStatusBadge(user.status));
                tr.appendChild(tdStatus);

                tbody.appendChild(tr);
            });
        }

        document.getElementById('userCount').textContent = users.length;
    }

    function renderReports() {
        const tbody = document.querySelector('#reportTable tbody');
        tbody.innerHTML = '';
        if (reports.length === 0) {
            const tr = document.createElement('tr');
            tr.className = 'empty-row';
            const td = document.createElement('td');
            td.colSpan = 3;
            td.textContent = 'هیچ گزارشی موجود نیست';
            tr.appendChild(td);
            tbody.appendChild(tr);
        } else {
            reports.forEach(report => {
                const tr = document.createElement('tr');

                const tdTitle = document.createElement('td');
                tdTitle.textContent = report.title;
                tr.appendChild(tdTitle);

                const tdDate = document.createElement('td');
                tdDate.textContent = report.date;
                tr.appendChild(tdDate);

                const tdStatus = document.createElement('td');
                tdStatus.appendChild(createStatusBadge(report.status));
                tr.appendChild(tdStatus);

                tbody.appendChild(tr);
            });
        }
        document.getElementById('reportCount').textContent = reports.length;
    }

    // Debounce برای input جستجو
    let searchTimeout = null;
    function attachSearch() {
        const input = document.getElementById('searchUser');
        if (!input) return;
        input.addEventListener('input', function(e) {
            const v = e.target.value.trim();
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => renderUsers(v), 180);
        });
    }

    // خروجی CSV ساده برای کاربران
    function exportUsersCSV() {
        if (!users || users.length === 0) {
            alert('هیچ کاربری برای خروجی وجود ندارد.');
            return;
        }
        const rows = [
            ['نام', 'ایمیل', 'وضعیت'],
            ...users.map(u => [u.name, u.email, u.status])
        ];
        const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    // مدیریت سایدبار موبایل
    function attachSidebarToggle() {
        const btn = document.getElementById('toggleSidebar');
        const sidebar = document.getElementById('sidebar');
        if (!btn || !sidebar) return;
        btn.addEventListener('click', () => {
            const hidden = sidebar.classList.toggle('hidden');
            btn.setAttribute('aria-expanded', !hidden);
            sidebar.setAttribute('aria-expanded', String(!hidden));
        });
    }

    // Logout امن‌تر
    function attachLogout() {
        const btn = document.getElementById('logoutBtn');
        if (!btn) return;
        btn.addEventListener('click', function() {
            if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
                // پاکسازی داده‌های نمونه برای دمو (در پروژه واقعی توکن پاک شود و ریدایرکت)
                localStorage.removeItem('dashboardData');
                alert('خروج انجام شد');
                location.reload();
            }
        });
    }

    // مقداردهی اولیه صفحه
    document.addEventListener('DOMContentLoaded', function() {
        loadData();

        // المان‌های هدر
        const welcome = document.getElementById('welcome');
        if (welcome) welcome.textContent = 'خوش آمدید، ادمین عزیز!';

        const adminName = document.getElementById('adminName');
        if (adminName) adminName.textContent = 'ادمین اصلی';

        renderUsers();
        renderReports();
        attachSearch();
        attachLogout();
        attachSidebarToggle();

        const exportBtn = document.getElementById('exportUsers');
        if (exportBtn) exportBtn.addEventListener('click', exportUsersCSV);
    });

    // اکسپورت توابع برای تست یا توسعه بیشتر (در صورت نیاز)
    window.Dashboard = {
        renderUsers,
        renderReports,
        saveData,
        loadData,
        get users() { return users; },
        get reports() { return reports; }
    };
})();
