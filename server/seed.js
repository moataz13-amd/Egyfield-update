const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const Category = require('./models/Category');
const Product = require('./models/Product');

dotenv.config();

const categories = [
  {
    name: { ar: 'مخللات', en: 'Pickles' },
    slug: 'pickles',
    icon: '🫙',
    color: '#7BB445',
  },
  {
    name: { ar: 'منتجات طازجة', en: 'Fresh Produce' },
    slug: 'fresh',
    icon: '🥦',
    color: '#4F9200',
  },
  {
    name: { ar: 'منتجات مجمدة', en: 'Frozen' },
    slug: 'frozen',
    icon: '❄️',
    color: '#5BA8C8',
  },
  {
    name: { ar: 'حبوب', en: 'Grains & Legumes' },
    slug: 'grains',
    icon: '🌾',
    color: '#D4A843',
  },
];

const productsData = [
  // Pickles
  {
    name: { ar: 'مخلل خيار', en: 'Pickled Cucumbers' },
    description: {
      ar: 'خيار مخلل مصري أصيل بتتبيلة تقليدية، معبأ بعناية للحفاظ على النكهة والقرمشة.',
      en: 'Authentic Egyptian pickled cucumbers with traditional seasoning, carefully packed to preserve flavor and crunch.',
    },
    origin: 'Egypt',
    packaging: '250g, 500g, 1kg, 5kg',
    season: 'Year-round',
    certifications: ['ISO 22000', 'HACCP'],
    featured: true,
    catSlug: 'pickles',
  },
  {
    name: { ar: 'مخلل جزر', en: 'Pickled Carrots' },
    description: {
      ar: 'جزر مخلل بخلطة مصرية مميزة، غني بالنكهة ومثالي كطبق جانبي.',
      en: 'Carrots pickled with a distinctive Egyptian blend, rich in flavor and perfect as a side dish.',
    },
    origin: 'Egypt',
    packaging: '250g, 500g, 1kg',
    season: 'Year-round',
    certifications: ['ISO 22000'],
    featured: false,
    catSlug: 'pickles',
  },
  {
    name: { ar: 'مخلل ليمون', en: 'Pickled Lemons' },
    description: {
      ar: 'ليمون مخلل على الطريقة المصرية، نكهة حامضة غنية تضيف طعماً مميزاً لأي وجبة.',
      en: 'Egyptian-style pickled lemons, rich tangy flavor that adds a distinctive taste to any meal.',
    },
    origin: 'Egypt',
    packaging: '500g, 1kg',
    season: 'Year-round',
    certifications: ['HACCP'],
    featured: true,
    catSlug: 'pickles',
  },
  // Fresh Produce
  {
    name: { ar: 'برتقال بلدي', en: 'Egyptian Oranges' },
    description: {
      ar: 'برتقال مصري طازج من أجود المزارع، غني بفيتامين سي ومثالي للعصير والأكل.',
      en: 'Fresh Egyptian oranges from the finest farms, rich in Vitamin C and perfect for juicing and eating.',
    },
    origin: 'Egypt',
    packaging: '5kg, 10kg, 15kg cartons',
    season: 'November - April',
    certifications: ['GlobalGAP', 'ISO 22000'],
    featured: true,
    catSlug: 'fresh',
  },
  {
    name: { ar: 'فراولة طازجة', en: 'Fresh Strawberries' },
    description: {
      ar: 'فراولة مصرية طازجة بجودة تصديرية عالية، حلوة وعصيرية.',
      en: 'Premium export-quality fresh Egyptian strawberries, sweet and juicy.',
    },
    origin: 'Egypt',
    packaging: '250g punnets, 2.5kg crates',
    season: 'December - March',
    certifications: ['GlobalGAP', 'HACCP'],
    featured: true,
    catSlug: 'fresh',
  },
  {
    name: { ar: 'بطاطس طازجة', en: 'Fresh Potatoes' },
    description: {
      ar: 'بطاطس مصرية طازجة عالية الجودة، مناسبة للطهي والتصنيع.',
      en: 'High-quality fresh Egyptian potatoes, suitable for cooking and processing.',
    },
    origin: 'Egypt',
    packaging: '25kg, 50kg sacks',
    season: 'Year-round',
    certifications: ['ISO 22000'],
    featured: false,
    catSlug: 'fresh',
  },
  // Frozen
  {
    name: { ar: 'فراولة مجمدة', en: 'Frozen Strawberries' },
    description: {
      ar: 'فراولة مجمدة بتقنية التجميد السريع للحفاظ على النكهة والقيمة الغذائية.',
      en: 'IQF frozen strawberries, flash-frozen to preserve flavor and nutritional value.',
    },
    origin: 'Egypt',
    packaging: '1kg, 2.5kg, 10kg',
    season: 'Year-round',
    certifications: ['BRC', 'ISO 22000', 'HACCP'],
    featured: true,
    catSlug: 'frozen',
  },
  {
    name: { ar: 'بامية مجمدة', en: 'Frozen Okra' },
    description: {
      ar: 'بامية مصرية مجمدة فائقة الجودة، مقطعة ومعبأة بعناية.',
      en: 'Premium Egyptian frozen okra, carefully cut and packed.',
    },
    origin: 'Egypt',
    packaging: '400g, 1kg, 2.5kg',
    season: 'Year-round',
    certifications: ['ISO 22000', 'HACCP'],
    featured: false,
    catSlug: 'frozen',
  },
  {
    name: { ar: 'ملوخية مجمدة', en: 'Frozen Molokhia' },
    description: {
      ar: 'ملوخية مصرية مجمدة، مفرومة وجاهزة للطبخ.',
      en: 'Frozen Egyptian molokhia (jute mallow), chopped and ready to cook.',
    },
    origin: 'Egypt',
    packaging: '400g, 1kg',
    season: 'Year-round',
    certifications: ['HACCP'],
    featured: false,
    catSlug: 'frozen',
  },
  // Grains & Legumes
  {
    name: { ar: 'أرز مصري', en: 'Egyptian Rice' },
    description: {
      ar: 'أرز مصري فاخر قصير الحبة، مثالي للأطباق الشرقية والغربية.',
      en: 'Premium short-grain Egyptian rice, perfect for Middle Eastern and Western dishes.',
    },
    origin: 'Egypt',
    packaging: '1kg, 5kg, 25kg, 50kg',
    season: 'Year-round',
    certifications: ['ISO 22000'],
    featured: true,
    catSlug: 'grains',
  },
  {
    name: { ar: 'فول مدشوش', en: 'Split Fava Beans' },
    description: {
      ar: 'فول مدشوش مصري عالي الجودة، أساس الفول المدمس الأصيل.',
      en: 'High-quality Egyptian split fava beans, the base of authentic ful medames.',
    },
    origin: 'Egypt',
    packaging: '500g, 1kg, 25kg',
    season: 'Year-round',
    certifications: ['ISO 22000', 'HACCP'],
    featured: false,
    catSlug: 'grains',
  },
  {
    name: { ar: 'عدس أصفر', en: 'Yellow Lentils' },
    description: {
      ar: 'عدس أصفر مصري نقي، سريع الطهي وغني بالبروتين.',
      en: 'Pure Egyptian yellow lentils, quick-cooking and protein-rich.',
    },
    origin: 'Egypt',
    packaging: '500g, 1kg, 25kg',
    season: 'Year-round',
    certifications: ['ISO 22000'],
    featured: true,
    catSlug: 'grains',
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Admin.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create admin
    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@egyfield.com',
      password: 'EgyField@2024',
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create a map of slug to category ID
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    // Create products with placeholder images
    const products = productsData.map((p) => ({
      name: p.name,
      description: p.description,
      category: categoryMap[p.catSlug],
      images: [
        {
          url: `https://placehold.co/800x600/7BB445/FFFFFF?text=${encodeURIComponent(p.name.en)}`,
          publicId: `egyfield/products/placeholder_${p.catSlug}_${Date.now()}`,
        },
      ],
      origin: p.origin,
      packaging: p.packaging,
      season: p.season,
      certifications: p.certifications,
      featured: p.featured,
      isActive: true,
    }));

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log('\n🌱 Database seeded successfully!');
    console.log('Admin login: admin@egyfield.com / EgyField@2024');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
