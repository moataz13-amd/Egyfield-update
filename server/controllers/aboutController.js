const asyncHandler = require('express-async-handler');
const AboutContent = require('../models/AboutContent');

// Default data used to seed the document on first access
const defaultAbout = {
  storyText1: {
    en: "Founded with a vision to share Egypt's agricultural bounty with the world, Delta Harvest has grown into a leading export company specializing in premium quality food products.",
    ar: 'تأسست برؤية لمشاركة ثروة مصر الزراعية مع العالم، نمت إيجي فيلد لتصبح شركة تصدير رائدة متخصصة في المنتجات الغذائية عالية الجودة.',
    fr: "Fondée avec la vision de partager les richesses agricoles de l'Égypte avec le monde, Delta Harvest est devenue une entreprise leader d'exportation spécialisée dans les produits alimentaires de qualité supérieure.",
    it: "Fondata con la visione di condividere le ricchezze agricole dell'Egitto con il mondo, Delta Harvest è cresciuta fino a diventare un'azienda leader nell'esportazione specializzata in prodotti alimentari di qualità superiore.",
    tr: "Mısır'ın tarımsal zenginliğini dünyayla paylaşma vizyonuyla kurulan Delta Harvest, birinci sınıf gıda ürünlerinde uzmanlaşmış lider bir ihracat şirketi haline geldi.",
  },
  storyText2: {
    en: 'From the fertile lands of the Nile Delta to markets across the globe, we bridge the gap between Egyptian farmers and international buyers with our commitment to quality and reliability.',
    ar: 'من الأراضي الخصبة لدلتا النيل إلى الأسواق عبر العالم، نسد الفجوة بين المزارعين المصريين والمشترين الدوليين بالتزامنا بالجودة والموثوقية.',
    fr: "Des terres fertiles du delta du Nil aux marchés du monde entier, nous comblons le fossé entre les agriculteurs égyptiens et les acheteurs internationaux grâce à notre engagement envers la qualité et la fiabilité.",
    it: "Dalle fertili terre del delta del Nilo ai mercati di tutto il mondo, colmiamo il divario tra gli agricoltori egiziani e gli acquirenti internazionali con il nostro impegno per la qualità e l'affidabilità.",
    tr: "Nil Deltası'nın verimli topraklarından dünyanın dört bir yanındaki pazarlara kadar, kalite ve güvenilirliğe olan bağlılığımızla Mısırlı çiftçiler ile uluslararası alıcılar arasında köprü kuruyoruz.",
  },
  storyImage: '',
  storyBadge: {
    en: '100% Organic Quality',
    ar: 'جودة عضوية 100%',
    fr: 'Qualité 100% Organique',
    it: 'Qualità 100% Biologica',
    tr: '%100 Organik Kalite',
  },
  missionText: {
    en: 'To deliver the finest Egyptian agricultural products to the world while supporting local farming communities and maintaining the highest quality standards.',
    ar: 'تقديم أجود المنتجات الزراعية المصرية للعالم مع دعم المجتمعات الزراعية المحلية والحفاظ على أعلى معايير الجودة.',
    fr: "Livrer les meilleurs produits agricoles égyptiens au monde tout en soutenant les communautés agricoles locales et en maintenant les normes de qualité les plus élevées.",
    it: "Fornire i migliori prodotti agricoli egiziani al mondo, sostenendo le comunità agricole locali e mantenendo i più alti standard di qualità.",
    tr: "Yerel tarım topluluklarını desteklerken ve en yüksek kalite standartlarını korurken, Mısır'ın en iyi tarım ürünlerini dünyaya sunmak.",
  },
  visionText: {
    en: 'To become the most trusted name in Egyptian agricultural exports, recognized globally for quality, innovation, and sustainability.',
    ar: 'أن نصبح الاسم الأكثر ثقة في صادرات المنتجات الزراعية المصرية، معترف بنا عالمياً للجودة والابتكار والاستدامة.',
    fr: "Devenir le nom le plus fiable dans les exportations agricoles égyptiennes, reconnu mondialement pour sa qualité, l'innovation et la durabilité.",
    it: "Diventare il nome più affidabile nelle esportazioni agricole egiziane, riconosciuto a livello globale per qualità, innovazione e sostenibilità.",
    tr: "Kalite, yenilikçilik ve sürdürülebilirlikle küresel çapta tanınan, Mısır tarım ihracatında en güvenilen isim olmak.",
  },
  timeline: [
    {
      year: '2015',
      title: {
        en: 'Company Founded',
        ar: 'تأسيس الشركة',
        fr: "Fondation de l'entreprise",
        it: "Fondazione dell'azienda",
        tr: 'Şirketin Kuruluşu',
      },
      description: {
        en: 'Delta Harvest was established in Cairo with a mission to export high-quality Egyptian fresh crops.',
        ar: 'تأسست إيجي فيلد في القاهرة بهدف تصدير المحاصيل المصرية الطازجة عالية الجودة.',
        fr: "Delta Harvest a été créée au Caire avec pour mission d'exporter des cultures fraîches égyptiennes de haute qualité.",
        it: "Delta Harvest è stata fondata al Cairo con la missione di esportare colture fresche egiziane di alta qualità.",
        tr: "Delta Harvest, yüksek kaliteli Mısır taze ürünlerini ihraç etmek amacıyla Kahire'de kuruldu.",
      },
    },
    {
      year: '2018',
      title: {
        en: 'Expansion to Pickles & Frozen',
        ar: 'التوسع في المخللات والمجمدات',
        fr: 'Expansion aux cornichons et surgelés',
        it: 'Espansione a sottaceti e surgelati',
        tr: 'Turşu ve Dondurulmuş Gıdaya Geçiş',
      },
      description: {
        en: 'Opened our first dedicated packaging facility and expanded our portfolio to premium pickled and frozen foods.',
        ar: 'افتتحنا أول منشأة تعبئة مخصصة ووسعنا محفظتنا لتشمل المخللات والأطعمة المجمدة الفاخرة.',
        fr: "Ouverture de notre premier site d'emballage dédié et élargissement de notre portefeuille aux cornichons et surgelés de qualité.",
        it: "Apertura del nostro primo impianto di confezionamento dedicato e ampliamento della gamma a sottaceti e surgelati premium.",
        tr: "İlk özel paketleme tesisimizi açarak ürün yelpazemizi birinci sınıf turşu ve dondurulmuş gıdalarla genişlettik.",
      },
    },
    {
      year: '2021',
      title: {
        en: 'Global Certifications',
        ar: 'الشهادات الدولية',
        fr: 'Certifications mondiales',
        it: 'Certificazioni globali',
        tr: 'Küresel Sertifikalar',
      },
      description: {
        en: 'Achieved ISO 22000 and HACCP certifications, marking a milestone in our commitment to international standards.',
        ar: 'حصلنا على شهادات ISO 22000 و HACCP، مما يمثل معلمًا بارزًا في التزامنا بالمعايير الدولية.',
        fr: "Obtention des certifications ISO 22000 et HACCP, marquant une étape importante de notre engagement qualité.",
        it: "Ottenimento delle certificazioni ISO 22000 e HACCP, pietra miliare del nostro impegno verso gli standard internazionali.",
        tr: "Uluslararası standartlara olan bağlılığımızda bir dönüm noktası olan ISO 22000 ve HACCP sertifikalarını aldık.",
      },
    },
    {
      year: '2024',
      title: {
        en: 'Exporting to 35+ Countries',
        ar: 'التصدير لأكثر من 35 دولة',
        fr: 'Exportation vers plus de 35 pays',
        it: 'Esportazione in oltre 35 paesi',
        tr: "35'ten Fazla Ülkeye İhracat",
      },
      description: {
        en: 'Now delivering premium Egyptian agricultural exports to Europe, the Middle East, Asia, and North America.',
        ar: 'نقوم الآن بتوصيل الصادرات الزراعية المصرية الفاخرة إلى أوروبا والشرق الأوسط وآسيا وأمريكا الشمالية.',
        fr: "Livraison de nos produits agricoles égyptiens haut de gamme en Europe, au Moyen-Orient, en Asie et en Amérique du Nord.",
        it: "Esportazione di prodotti agricoli egiziani di prima scelta in Europa, Medio Oriente, Asia e Nord America.",
        tr: "Birinci sınıf Mısır tarım ürünlerini Avrupa, Orta Doğu, Asya ve Kuzey Amerika'ya teslim ediyoruz.",
      },
    },
  ],
  certifications: [
    {
      name: 'ISO 22000',
      description: {
        en: 'Food Safety Management System standard ensuring full safety controls throughout the supply chain.',
        ar: 'معيار نظام إدارة سلامة الغذاء يضمن ضوابط السلامة الكاملة عبر سلسلة التوريد.',
        fr: 'Norme de système de gestion de la sécurité alimentaire garantissant des contrôles tout au long de la chaîne.',
        it: 'Standard del sistema di gestione della sicurezza alimentare che garantisce controlli lungo la filiera.',
        tr: 'Tedarik zinciri boyunca tam güvenlik kontrolleri sağlayan Gıda Güvenliği Yönetim Sistemi standardı.',
      },
    },
    {
      name: 'HACCP Certified',
      description: {
        en: 'Hazard Analysis Critical Control Point standard ensuring rigorous preventative food safety systems.',
        ar: 'معيار نقاط التحكم الحرجة لتحليل المخاطر يضمن أنظمة سلامة غذائية وقائية صارمة.',
        fr: "Norme d'analyse des risques et points critiques pour des systèmes rigoureux de sécurité alimentaire.",
        it: 'Standard per l\'analisi dei rischi e punti critici di controllo per rigorosi sistemi di sicurezza alimentare.',
        tr: 'Sıkı önleyici gıda güvenliği sistemleri sağlayan Tehlike Analizi ve Kritik Kontrol Noktaları standardı.',
      },
    },
    {
      name: 'GlobalGAP',
      description: {
        en: 'Good Agricultural Practices standard certifying safe and sustainable agricultural production.',
        ar: 'معيار الممارسات الزراعية الجيدة يشهد على الإنتاج الزراعي الآمن والمستدام.',
        fr: 'Norme de bonnes pratiques agricoles certifiant une production sûre et durable.',
        it: 'Standard di buone pratiche agricole che certifica una produzione sicura e sostenibile.',
        tr: 'Güvenli ve sürdürülebilir tarımsal üretimi belgeleyen İyi Tarım Uygulamaları standardı.',
      },
    },
  ],
};

// @desc    Get about page content (public)
// @route   GET /api/about
// @access  Public
const getAboutContent = asyncHandler(async (req, res) => {
  let about = await AboutContent.findOne();
  if (!about) {
    about = await AboutContent.create(defaultAbout);
  } else {
    // Check if it is missing the new languages (e.g. fr translation doesn't exist)
    // If so, update the document with default values for fr, it, tr.
    let updated = false;
    const locales = ['fr', 'it', 'tr'];
    
    // We check and merge nested localized structures
    const mergeLocales = (field) => {
      locales.forEach(loc => {
        if (about[field] && about[field][loc] === undefined) {
          // If the field exists but lacks the locale, initialize and copy it
          if (!about[field]) about[field] = {};
          about[field][loc] = defaultAbout[field][loc] || '';
          updated = true;
        }
      });
    };
    
    mergeLocales('storyText1');
    mergeLocales('storyText2');
    mergeLocales('storyBadge');
    mergeLocales('missionText');
    mergeLocales('visionText');

    // Also check timeline
    if (about.timeline && about.timeline.length > 0) {
      about.timeline.forEach((item, index) => {
        const defaultItem = defaultAbout.timeline[index];
        if (defaultItem) {
          locales.forEach(loc => {
            if (item.title && item.title[loc] === undefined) {
              if (!item.title) item.title = {};
              item.title[loc] = defaultItem.title[loc] || '';
              updated = true;
            }
            if (item.description && item.description[loc] === undefined) {
              if (!item.description) item.description = {};
              item.description[loc] = defaultItem.description[loc] || '';
              updated = true;
            }
          });
        }
      });
    }

    // Check certifications
    if (about.certifications && about.certifications.length > 0) {
      about.certifications.forEach((item, index) => {
        const defaultItem = defaultAbout.certifications[index];
        if (defaultItem) {
          locales.forEach(loc => {
            if (item.description && item.description[loc] === undefined) {
              if (!item.description) item.description = {};
              item.description[loc] = defaultItem.description[loc] || '';
              updated = true;
            }
          });
        }
      });
    }
    
    if (updated) {
      about.markModified('storyText1');
      about.markModified('storyText2');
      about.markModified('storyBadge');
      about.markModified('missionText');
      about.markModified('visionText');
      about.markModified('timeline');
      about.markModified('certifications');
      await about.save();
    }
  }
  res.json(about);
});

// @desc    Update about page content (admin)
// @route   PUT /api/admin/about
// @access  Private
const updateAboutContent = asyncHandler(async (req, res) => {
  let about = await AboutContent.findOne();
  if (!about) {
    about = await AboutContent.create(defaultAbout);
  }

  const fields = [
    'storyText1', 'storyText2', 'storyImage', 'storyBadge',
    'missionText', 'visionText',
    'timeline', 'certifications',
  ];

  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      about[field] = req.body[field];
    }
  });

  const updated = await about.save();
  res.json(updated);
});

module.exports = { getAboutContent, updateAboutContent };
