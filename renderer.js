// axios CDN'den yüklendi

let currentResponse = null;
let history = [];

// API KEY'i kullanıcıdan al
let API_KEY = localStorage.getItem('apiKey');

if (!API_KEY) {
    API_KEY = prompt('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');
    if (API_KEY) {
        localStorage.setItem('apiKey', API_KEY);
    }
}

// Tür değiştiğinde label'ları güncelle
document.getElementById('contentType').addEventListener('change', (e) => {
    const type = e.target.value;
    const nameLabel = document.getElementById('nameLabel');
    const episodeLabel = document.getElementById('episodeLabel');
    
    if (type === 'anime') {
        nameLabel.textContent = 'Anime Adı:';
        episodeLabel.textContent = 'Hangi Bölümdesiniz?';
        document.getElementById('animeName').placeholder = 'Örnek: Naruto, One Piece';
        document.getElementById('episode').placeholder = 'Örnek: 45. bölüm';
    } else {
        nameLabel.textContent = 'Manga Adı:';
        episodeLabel.textContent = 'Hangi Bölümdesiniz?';
        document.getElementById('animeName').placeholder = 'Örnek: Naruto, Berserk';
        document.getElementById('episode').placeholder = 'Örnek: 120. bölüm';
    }
});

// Form aç/kapa
document.getElementById('formToggle').addEventListener('click', () => {
    const formContent = document.getElementById('formContent');
    const formArrow = document.getElementById('formArrow');
    
    formContent.classList.toggle('open');
    formArrow.classList.toggle('open');
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
    
    if (!API_KEY) {
        alert('API KEY girilmedi! Sayfayı yenileyin.');
        return;
    }
    
    const loading = document.getElementById('loading');
    const responseBox = document.getElementById('responseBox');
    const responseText = document.getElementById('responseText');
    const askBtn = document.getElementById('askBtn');
    
    loading.classList.add('show');
    responseBox.classList.remove('show');
    askBtn.disabled = true;
    currentResponse = null;
    
    const typeText = contentType === 'anime' ? 'anime' : 'manga';
    
    const systemPrompt = `Sen ${typeText} hakkında sorulara cevap veren bir yapay zeka asistanısın. Kullanıcı "${animeName}" ${typeText}sinin "${episode}" bölümünde/noktasında.

ÇOK ÖNEMLİ KURALLAR:

1. **SPOILER KONTROLÜ**: 
   - Kullanıcının bulunduğu bölüme KADAR olan bilgileri ver
   - Kullanıcının bulunduğu bölümden SONRA gerçekleşecek HIÇBIR olaydan, karakterden, detaydan bahsetme

2. **CEVAP VERİRKEN**:
   - SADECE ve SADECE kullanıcının bulunduğu bölüme kadar açıklanmış kavramları anlat
   - Eğer kullanıcının sorusu ilerideki bir olayı içeriyorsa: "Bu bilgi şu anki bölümlerde henüz açıklanmadı" de

3. **DİL**: Kısa, net, öğretici ve sade cevaplar ver.`;

    try {
        const response = await axios.post('/api/ask', {
            apiKey: API_KEY,
            systemPrompt: systemPrompt,
            question: question
        });
        
        const answer = response.data.content[0].text;
        currentResponse = answer;
        responseText.textContent = answer;
        responseBox.classList.add('show');
        
        // Formu kapat
        document.getElementById('formContent').classList.remove('open');
        document.getElementById('formArrow').classList.remove('open');
        
    } catch (error) {
        console.error('HATA:', error);
        let errorMsg = 'Bir hata oluştu!';
        
        if (error.response) {
            errorMsg = error.response.data?.error?.message || 'API hatası';
        } else if (error.message) {
            errorMsg = error.message;
        }
        
        alert('Hata: ' + errorMsg);
    } finally {
        loading.classList.remove('show');
        askBtn.disabled = false;
    }
});
