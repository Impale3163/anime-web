const axios = require('axios');
const API_KEY = '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';

let currentResponse = null;
let history = [];
let trash = [];
let editingIndex = -1;

// Tür değiştiğinde label'ları güncelle
document.getElementById('contentType').addEventListener('change', (e) => {
    const type = e.target.value;
    const nameLabel = document.getElementById('nameLabel');
    const episodeLabel = document.getElementById('episodeLabel');
    
    if (type === 'anime') {
        nameLabel.textContent = 'Anime Adı:';
        episodeLabel.textContent = 'Hangi Bölümdesiniz?';
        document.getElementById('animeName').placeholder = 'Örnek: Naruto, One Piece, Attack on Titan';
        document.getElementById('episode').placeholder = 'Örnek: 45. bölüm';
    } else {
        nameLabel.textContent = 'Manga Adı:';
        episodeLabel.textContent = 'Hangi Bölümdesiniz?';
        document.getElementById('animeName').placeholder = 'Örnek: Naruto, One Piece, Berserk';
        document.getElementById('episode').placeholder = 'Örnek: 120. bölüm';
    }
});

// Geçmişi yükle
function loadHistory() {
    const saved = localStorage.getItem('animeHistory');
    const savedTrash = localStorage.getItem('animeTrash');
    if (saved) {
        history = JSON.parse(saved);
        renderHistory();
    }
    if (savedTrash) {
        trash = JSON.parse(savedTrash);
        renderTrash();
    }
}

// Geçmişi kaydet
function saveHistory() {
    localStorage.setItem('animeHistory', JSON.stringify(history));
}

// Çöp kutusunu kaydet
function saveTrash() {
    localStorage.setItem('animeTrash', JSON.stringify(trash));
}

// Geçmişi göster
function renderHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    history.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        
        const typeIcon = item.type === 'anime' ? '🎬' : '📖';
        
        div.innerHTML = `
            <div class="history-anime">${typeIcon} ${item.customName || item.anime} - ${item.episode}</div>
            <div class="history-question">${item.question}</div>
            <div class="item-buttons">
                <button class="item-btn edit-btn" data-index="${index}">✏️</button>
                <button class="item-btn delete-btn" data-index="${index}">🗑️</button>
            </div>
        `;
        
        div.onclick = (e) => {
            if (!e.target.classList.contains('item-btn')) {
                showHistoryItem(item);
            }
        };
        
        historyList.appendChild(div);
    });
    
    // Düzenleme butonlarına event ekle
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            openEditModal(index);
        };
    });
    
    // Silme butonlarına event ekle
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            moveToTrash(index);
        };
    });
}

// Çöp kutusunu göster
function renderTrash() {
    const trashList = document.getElementById('trashList');
    const trashCount = document.getElementById('trashCount');
    
    trashCount.textContent = trash.length;
    trashList.innerHTML = '';
    
    if (trash.length === 0) {
        trashList.innerHTML = '<div style="color: #666; font-size: 12px; text-align: center; padding: 10px;">Çöp kutusu boş</div>';
        return;
    }
    
    trash.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'trash-item';
        
        const typeIcon = item.type === 'anime' ? '🎬' : '📖';
        
        div.innerHTML = `
            ${typeIcon} ${item.customName || item.anime} - ${item.episode}
            <button class="restore-btn" data-index="${index}">↩️ Geri Al</button>
        `;
        
        trashList.appendChild(div);
    });
    
    // Geri alma butonlarına event ekle
    document.querySelectorAll('.restore-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            restoreFromTrash(index);
        };
    });
}

// Çöp kutusuna taşı
function moveToTrash(index) {
    const item = history[index];
    trash.unshift(item);
    history.splice(index, 1);
    saveHistory();
    saveTrash();
    renderHistory();
    renderTrash();
}

// Çöp kutusundan geri al
function restoreFromTrash(index) {
    const item = trash[index];
    history.unshift(item);
    trash.splice(index, 1);
    saveHistory();
    saveTrash();
    renderHistory();
    renderTrash();
}

// Çöp kutusunu boşalt
document.getElementById('emptyTrash').addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('Çöp kutusunu tamamen boşaltmak istediğinizden emin misiniz?')) {
        trash = [];
        saveTrash();
        renderTrash();
    }
});

// Çöp kutusunu aç/kapa
document.getElementById('trashHeader').addEventListener('click', (e) => {
    if (e.target.id === 'emptyTrash') return;
    
    const trashContent = document.getElementById('trashContent');
    const trashArrow = document.getElementById('trashArrow');
    
    trashContent.classList.toggle('open');
    trashArrow.classList.toggle('open');
});

// Form aç/kapa
document.getElementById('formToggle').addEventListener('click', () => {
    const formContent = document.getElementById('formContent');
    const formArrow = document.getElementById('formArrow');
    
    formContent.classList.toggle('open');
    formArrow.classList.toggle('open');
});

// Düzenleme modal'ını aç
function openEditModal(index) {
    editingIndex = index;
    const item = history[index];
    document.getElementById('editName').value = item.customName || item.anime;
    document.getElementById('editModal').classList.add('show');
}

// Modal kapat
document.getElementById('cancelEdit').addEventListener('click', () => {
    document.getElementById('editModal').classList.remove('show');
    editingIndex = -1;
});

// Adı kaydet
document.getElementById('saveEdit').addEventListener('click', () => {
    const newName = document.getElementById('editName').value.trim();
    if (newName && editingIndex >= 0) {
        history[editingIndex].customName = newName;
        saveHistory();
        renderHistory();
        document.getElementById('editModal').classList.remove('show');
        editingIndex = -1;
    }
});

// Geçmiş öğeyi göster
function showHistoryItem(item) {
    document.getElementById('contentType').value = item.type || 'anime';
    document.getElementById('contentType').dispatchEvent(new Event('change'));
    document.getElementById('animeName').value = item.anime;
    document.getElementById('episode').value = item.episode;
    document.getElementById('question').value = item.question;
    document.getElementById('responseText').textContent = item.answer;
    document.getElementById('responseBox').classList.add('show');
    
    // Formu aç
    document.getElementById('formContent').classList.add('open');
    document.getElementById('formArrow').classList.add('open');
}

// Kaydet butonu
document.getElementById('saveBtn').addEventListener('click', () => {
    if (!currentResponse) return;
    
    const item = {
        type: document.getElementById('contentType').value,
        anime: document.getElementById('animeName').value.trim(),
        episode: document.getElementById('episode').value.trim(),
        question: document.getElementById('question').value.trim(),
        answer: currentResponse,
        date: new Date().toLocaleString('tr-TR')
    };
    
    history.unshift(item);
    if (history.length > 50) history.pop();
    
    saveHistory();
    renderHistory();
    alert('✅ Sohbet kaydedildi!');
});

// Sor butonu
document.getElementById('askBtn').addEventListener('click', async () => {
    const contentType = document.getElementById('contentType').value;
    const animeName = document.getElementById('animeName').value.trim();
    const episode = document.getElementById('episode').value.trim();
    const question = document.getElementById('question').value.trim();
    
    if (!animeName || !episode || !question) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }
    
    const loading = document.getElementById('loading');
    const responseBox = document.getElementById('responseBox');
    const responseText = document.getElementById('responseText');
    const askBtn = document.getElementById('askBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    loading.classList.add('show');
    responseBox.classList.remove('show');
    askBtn.disabled = true;
    saveBtn.disabled = true;
    currentResponse = null;
    
    const typeText = contentType === 'anime' ? 'anime' : 'manga';
    
    const systemPrompt = `Sen ${typeText} hakkında sorulara cevap veren bir yapay zeka asistanısın. Kullanıcı "${animeName}" ${typeText}sinin "${episode}" bölümünde/noktasında.

ÇOK ÖNEMLİ KURALLAR:

1. **SPOILER KONTROLÜ**: 
   - Kullanıcının bulunduğu bölüme KADAR olan bilgileri ver
   - Kullanıcının bulunduğu bölümden SONRA gerçekleşecek HIÇBIR olaydan, karakterden, detaydan bahsetme
   - İleride olacak hiçbir şeyi ima bile etme

2. **CEVAP VERİRKEN**:
   - SADECE ve SADECE kullanıcının bulunduğu bölüme kadar açıklanmış kavramları anlat
   - Eğer kullanıcının sorusu ilerideki bir olayı, karakteri veya durumu içeriyorsa: "Bu bilgi şu anki bölümlerde henüz açıklanmadı" de, başka hiçbir şey söyleme
   - Asla "ileride", "daha sonra", "gelecekte" gibi kelimeler kullanma

3. **ÖRNEKLEMİN GÜVENLİĞİ**:
   - Örnek verirken bile spoiler verme
   - İlerideki karakterleri, olayları örnek gösterme
   - Sadece o bölüme kadar bilinen şeyleri örnek göster

4. **DİL**: Kısa, net, öğretici ve sade cevaplar ver.`;

    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{
                role: 'user',
                content: question
            }]
        }, {
            headers: {
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            }
        });
        
        const answer = response.data.content[0].text;
        currentResponse = answer;
        responseText.textContent = answer;
        responseBox.classList.add('show');
        saveBtn.disabled = false;
        
        // Formu kapat
        document.getElementById('formContent').classList.remove('open');
        document.getElementById('formArrow').classList.remove('open');
        
    } catch (error) {
        console.error('HATA:', error);
        alert('Hata: ' + (error.response?.data?.error?.message || error.message));
    } finally {
        loading.classList.remove('show');
        askBtn.disabled = false;
    }
});

// Sayfa yüklendiğinde geçmişi yükle
loadHistory();