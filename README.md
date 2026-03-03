# LifeOS - Hayatı Akıllıca Yönet

LifeOS, hayatınızın farklı alanlarını (eğitim, görevler, kişisel gelişim ve eğlence) tek bir yerden yönetmenize olanak tanıyan, modern, temiz ve kullanımı kolay bir PWA (Progressive Web App - İleri Düzey Web Uygulaması) kişisel kontrol merkezidir.

![LifeOS Ekran Görüntüsü](assets/screenshot.png) <!-- Buraya arayüzünden bir ekran görüntüsü yükledikten sonra bu yolu güncelleyebilirsin -->

🔗 [Canlı Demoya Git](https://kaanzio.github.io/lifeos_mobile/) <!-- GitHub Pages url adresi varsa buraya gelecek -->

## 🌟 Özellikler

LifeOS içerisinde çeşitli modüller ve sistemler bulunur:

### 1. 📊 Kontrol Merkezi (Dashboard)
- Sık kullanılan sitelere ve aksiyonlara hızlı erişim.
- Bugün yapılması gereken aktif görevlerin ve rutinlerin özeti.
- Zinciri Kırma etkinliği ve yaklaşan planların takvimi.
- Detaylı toplam analiz kartları (Total görev, kitap, film sayısı).

### 2. ⚡ Verimlilik ve Planlama
* **Görevler:** İşlerinizi, ödevlerinizi veya günlük sorumluluklarınızı Kanban / Liste görünümlerinde ve renkli etiketlerle düzenleyin.
* **Not Defteri:** Hızlı notlar alın ve renk kodlarıyla organize edin.
* **Pomodoro Zamanlayıcı:** Odaklanma sürelerinizi belirleyip Pomodoro tekniği ile çalışma ritmini yakalayın.
* **Zinciri Kırma (Habit Tracker):** Günlük alışkanlıklarınızı (spor, su, kitap okuma vb.) takip edip "Zinciri Kırma" felsefesiyle sürdürülebilir kılın.
* **Haftalık Program:** Tüm haftayı tek ekranda gün gün görselleştirin.

### 3. 🎓 Akademik
* **Ders Programı (Schedule):** Üniversite veya okul ders saatlerinizi planlayın.
* **Dersler:** Ders içeriklerini, hocalarını ve gereksinimleri not edin.
* **Sınavlar:** Gelecek vize, final veya quizler için kalan gün sayacı ile sınav takibi.

### 4. 📚 Kütüphane & Eğlence
* **Kitaplar:** Okuduğunuz veya okuyacağınız kitapların adlarını, yazarlarını ve sayfalarını girin. İlerleme yüzdelerini görüp "Şu an Okunuyor", "Bitti" gibi aşamalarını yönetin.
* **Dizi / Film İzleme Listesi:** Sürükleyici hikayelerin veya beğendiğiniz filmlerin sezon/bölüm ilerlemelerini tutup IMDB puanları ve kapak fotoğraflarıyla birlikte takibini yapın.
* **YouTube Koleksiyonu:** Sık seyrettiğiniz kanalları ve faydalı kanalların türünü ekleyin.
* **Oyunlar:** Bitirdiğiniz veya oynamaya devam ettiğiniz PC, konsol oyunlarının kişisel oyun listenizi oluşturun.

### 5. 🛠 Araçlar & Sistem
* **Siteler:** Sürekli ziyaret ettiğiniz veya favori olarak kaydettiğiniz web sitelerinin bağlantı adreslerini ikonlarla toplayın.
* **Ayarlar (Profile):** LifeOS profil ayarları, Tema (Açık/Koyu mod) seçimi, verileri yerel diske dışa çıkarma ve içe aktarma mekanizması, animasyon ayarları ve dahası.

## 🚀 Teknolojiler
Bu proje, performans ve taşınabilirlik açısından hafif bir yığınla geliştirilmiştir:

- **HTML5 & CSS3:** Modern, responsif, grid tabanlı ve 'Glassmorphism' stil destekli temiz bir arayüz tasarımı.
- **Vanilla JavaScript:** Framework karmaşası olmadan, hızlı çalışan dinamik modül sistemi (ES6 özellikleri, LocalStorage tabanlı veritabanı).
- **PWA Uyumluluğu:** `manifest.json` ve servis çalışanları ile tamamen internetsiz çevrimdışı çalışma ve mobil/desktop platformlara uygulama olarak kurulum desteği.

## 💾 Veri Saklama
Tüm verileriniz **tarayıcınızın yerel depolamasında (LocalStorage)** güvenle saklanır; herhangi bir sunucuya yüklenmez, paylaşılmaz veya satılmaz. Kendi cihazınızdaki verilerle gizlilik esaslı çalışır. 

* **Veri Yedeği:** Ayarlar > Profil > Verileri İndir / Yükle sistemiyle verilerinizi `.json` formatında yedekleyebilir/taşıyabilirsiniz.

## ⚙️ Kurulum / Kullanım

LifeOS'u herhangi bir kurulum gerektirmeden direkt kullanabilirsiniz.

1. Projeyi tarayıcınızda açın.
2. Mobil cihazınızda kullanıyorsanız tarayıcı ayarlarına (sağ üstteki 3 nokta menüsü) tıklayıp **"Ana Ekrana Ekle" (Add to Home Screen)** veya **"Uygulamayı Yükle"** seçeneğini kullanarak telefonunuza bir mobil uygulama gibi anında kurabilirsiniz.

### Geliştiriciler İçin
Projeyi kendi bilgisayarınıza klonlayıp düzenlemek isterseniz:

```bash
git clone https://github.com/Kaanzio/lifeos_mobile.git
cd lifeos_mobile
# Daha sonra klasör içindeki index.html dosyasını çalıştırın veya
# Live Server vs. gibi bir eklentiyle açın.
```

---
**Geliştiren:** [Kaanzio](https://github.com/Kaanzio) | Hayatınızı organize etmenin en modern yolu. 🌌
