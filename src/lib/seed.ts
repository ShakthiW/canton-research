import 'server-only'
import { ObjectId } from 'mongodb'
import { getDb } from './mongodb/db'

const SUPPLIER_IDS = Array.from({ length: 10 }, () => new ObjectId())
const PRODUCT_IDS = Array.from({ length: 20 }, () => new ObjectId())
const RESEARCH_IDS = Array.from({ length: 15 }, () => new ObjectId())
const SAMPLE_IDS = Array.from({ length: 5 }, () => new ObjectId())
const FAIR_ID = new ObjectId()

const now = new Date()
const days = (d: number) => new Date(now.getTime() - d * 86400000)

export async function seedDatabase() {
  const db = await getDb()

  // Clear existing demo data
  await Promise.all([
    db.collection('products').deleteMany({}),
    db.collection('suppliers').deleteMany({}),
    db.collection('researchItems').deleteMany({}),
    db.collection('samples').deleteMany({}),
    db.collection('fairs').deleteMany({}),
    db.collection('fairVisits').deleteMany({}),
    db.collection('activities').deleteMany({}),
    db.collection('supplierProducts').deleteMany({}),
    db.collection('settings').deleteMany({}),
  ])

  // Settings
  await db.collection('settings').insertOne({
    exchangeRates: { USD_TO_LKR: 305, CNY_TO_LKR: 42, USD_TO_CNY: 7.24 },
    defaultCurrency: 'LKR',
    categories: [
      'Electronics','Home','Kitchen','Beauty','Automotive',
      'Travel','Fitness','Pets','Office','Lifestyle','Gifts','Other',
    ],
    scoreThresholds: { exceptional: 90, strong: 80, promising: 70, needsValidation: 60 },
    currentFairId: FAIR_ID.toHexString(),
    updatedAt: now,
  })

  // Fair
  await db.collection('fairs').insertOne({
    _id: FAIR_ID,
    name: '140th Canton Fair',
    year: 2026,
    location: 'Guangzhou, China',
    phase: 'Phase 1',
    startDate: '2026-10-15',
    endDate: '2026-10-19',
    notes: 'Focus on electronics, home & kitchen, and lifestyle products.',
    createdAt: days(30),
  })

  // Suppliers
  const supplierDocs = [
    { _id: SUPPLIER_IDS[0], companyName: 'Shenzhen TechPro Manufacturing', contactPerson: 'Wei Chen', country: 'China', city: 'Shenzhen', boothNumber: 'A123', hall: 'Hall 1.1', email: 'wei@techpro.cn', phone: '+86 139 1234 5678', wechat: 'techpro_wei', alibabaUrl: 'https://techpro.en.alibaba.com', website: 'https://techpro.cn', supplierType: 'Manufacturer', categories: ['Electronics', 'Office'], moq: 200, leadTime: '30 days', paymentTerms: '30% deposit, 70% before shipment', customization: true, privateLabeling: true, packagingCustomization: true, sampleAvailability: true, sampleCost: 25, notes: 'Very responsive. Good quality control.', scoreQuality: 17, scorePricing: 16, scoreCommunication: 18, scoreMoq: 12, scoreCustomization: 8, scoreLeadTime: 8, scoreReliability: 4, score: 83, createdAt: days(45), updatedAt: days(5) },
    { _id: SUPPLIER_IDS[1], companyName: 'Guangzhou Home Essentials Co.', contactPerson: 'Liu Mei', country: 'China', city: 'Guangzhou', boothNumber: 'B456', hall: 'Hall 2.3', email: 'liu@homeessentials.cn', phone: '+86 138 9876 5432', wechat: 'home_liu', alibabaUrl: '', website: '', supplierType: 'Manufacturer', categories: ['Home', 'Kitchen'], moq: 100, leadTime: '25 days', paymentTerms: 'T/T', customization: true, privateLabeling: true, packagingCustomization: true, sampleAvailability: true, sampleCost: 15, notes: 'Excellent packaging options.', scoreQuality: 16, scorePricing: 17, scoreCommunication: 15, scoreMoq: 13, scoreCustomization: 9, scoreLeadTime: 9, scoreReliability: 4, score: 83, createdAt: days(40), updatedAt: days(3) },
    { _id: SUPPLIER_IDS[2], companyName: 'Yiwu Global Accessories', contactPerson: 'Zhang Wei', country: 'China', city: 'Yiwu', boothNumber: 'C789', hall: 'Hall 3.2', email: 'zhang@yiwuglobal.cn', phone: '+86 137 5555 6666', wechat: 'yiwu_zhang', alibabaUrl: 'https://yiwuglobal.en.alibaba.com', website: '', supplierType: 'Trading Company', categories: ['Lifestyle', 'Gifts', 'Travel'], moq: 50, leadTime: '20 days', paymentTerms: 'PayPal or T/T', customization: false, privateLabeling: false, packagingCustomization: true, sampleAvailability: true, sampleCost: 10, notes: 'Low MOQ. Good for testing new products.', scoreQuality: 13, scorePricing: 18, scoreCommunication: 16, scoreMoq: 15, scoreCustomization: 4, scoreLeadTime: 10, scoreReliability: 3, score: 79, createdAt: days(35), updatedAt: days(2) },
    { _id: SUPPLIER_IDS[3], companyName: 'Foshan Pet Products Factory', contactPerson: 'Chen Jing', country: 'China', city: 'Foshan', boothNumber: 'D321', hall: 'Hall 4.1', email: 'chen@foshanpet.cn', phone: '+86 136 4444 3333', wechat: 'foshan_pet', alibabaUrl: '', website: 'https://foshanpet.cn', supplierType: 'Manufacturer', categories: ['Pets'], moq: 150, leadTime: '35 days', paymentTerms: '50% advance', customization: true, privateLabeling: true, packagingCustomization: true, sampleAvailability: true, sampleCost: 20, notes: 'Specializes in innovative pet accessories.', scoreQuality: 18, scorePricing: 14, scoreCommunication: 14, scoreMoq: 11, scoreCustomization: 9, scoreLeadTime: 7, scoreReliability: 5, score: 78, createdAt: days(30), updatedAt: days(1) },
    { _id: SUPPLIER_IDS[4], companyName: 'Dongguan Beauty Solutions', contactPerson: 'Li Hong', country: 'China', city: 'Dongguan', boothNumber: 'E654', hall: 'Hall 5.2', email: 'li@dgbeauty.cn', phone: '+86 135 7777 8888', wechat: 'dg_beauty', alibabaUrl: 'https://dgbeauty.en.alibaba.com', website: '', supplierType: 'Manufacturer', categories: ['Beauty'], moq: 300, leadTime: '40 days', paymentTerms: '30% T/T', customization: true, privateLabeling: true, packagingCustomization: true, sampleAvailability: true, sampleCost: 30, notes: 'FDA certified. Premium packaging.', scoreQuality: 19, scorePricing: 13, scoreCommunication: 16, scoreMoq: 10, scoreCustomization: 10, scoreLeadTime: 7, scoreReliability: 5, score: 80, createdAt: days(25), updatedAt: days(4) },
    { _id: SUPPLIER_IDS[5], companyName: 'Ningbo Auto Accessories Ltd', contactPerson: 'Wang Fang', country: 'China', city: 'Ningbo', boothNumber: 'F987', hall: 'Hall 6.1', email: 'wang@nbautoacc.cn', phone: '+86 134 1111 2222', wechat: 'nb_auto', alibabaUrl: '', website: '', supplierType: 'Manufacturer', categories: ['Automotive'], moq: 500, leadTime: '45 days', paymentTerms: 'L/C or T/T', customization: false, privateLabeling: true, packagingCustomization: false, sampleAvailability: true, sampleCost: 35, notes: 'Good for car accessories.', scoreQuality: 15, scorePricing: 15, scoreCommunication: 12, scoreMoq: 8, scoreCustomization: 3, scoreLeadTime: 6, scoreReliability: 4, score: 63, createdAt: days(20), updatedAt: days(6) },
    { _id: SUPPLIER_IDS[6], companyName: 'Hangzhou Fitness Gear Co.', contactPerson: 'Zhao Lei', country: 'China', city: 'Hangzhou', boothNumber: 'G246', hall: 'Hall 7.3', email: 'zhao@hzfitness.cn', phone: '+86 133 3333 4444', wechat: 'hz_fitness', alibabaUrl: 'https://hzfitness.en.alibaba.com', website: 'https://hzfitness.cn', supplierType: 'Manufacturer', categories: ['Fitness'], moq: 200, leadTime: '30 days', paymentTerms: 'T/T 50%', customization: true, privateLabeling: true, packagingCustomization: true, sampleAvailability: true, sampleCost: 25, notes: 'Great for private label fitness equipment.', scoreQuality: 17, scorePricing: 16, scoreCommunication: 17, scoreMoq: 12, scoreCustomization: 9, scoreLeadTime: 8, scoreReliability: 5, score: 84, createdAt: days(18), updatedAt: days(2) },
    { _id: SUPPLIER_IDS[7], companyName: 'Suzhou Office Supplies Factory', contactPerson: 'Sun Ying', country: 'China', city: 'Suzhou', boothNumber: 'H135', hall: 'Hall 8.1', email: 'sun@szoffice.cn', phone: '+86 132 5555 6666', wechat: 'sz_office', alibabaUrl: '', website: '', supplierType: 'Manufacturer', categories: ['Office', 'Lifestyle'], moq: 100, leadTime: '20 days', paymentTerms: 'PayPal', customization: true, privateLabeling: true, packagingCustomization: true, sampleAvailability: true, sampleCost: 12, notes: 'Fast turnaround. Good for desk products.', scoreQuality: 16, scorePricing: 17, scoreCommunication: 18, scoreMoq: 14, scoreCustomization: 8, scoreLeadTime: 10, scoreReliability: 4, score: 87, createdAt: days(15), updatedAt: days(1) },
    { _id: SUPPLIER_IDS[8], companyName: 'Xiamen Travel Gear Manufacturing', contactPerson: 'Lin Bo', country: 'China', city: 'Xiamen', boothNumber: 'I753', hall: 'Hall 9.2', email: 'lin@xmtravel.cn', phone: '+86 131 7777 8888', wechat: 'xm_travel', alibabaUrl: 'https://xmtravel.en.alibaba.com', website: '', supplierType: 'Manufacturer', categories: ['Travel'], moq: 150, leadTime: '28 days', paymentTerms: '30% deposit', customization: true, privateLabeling: true, packagingCustomization: true, sampleAvailability: true, sampleCost: 18, notes: 'Specializes in travel accessories and luggage.', scoreQuality: 18, scorePricing: 15, scoreCommunication: 16, scoreMoq: 12, scoreCustomization: 9, scoreLeadTime: 9, scoreReliability: 5, score: 84, createdAt: days(12), updatedAt: days(3) },
    { _id: SUPPLIER_IDS[9], companyName: 'Qingdao Electronics Hub', contactPerson: 'Gao Yan', country: 'China', city: 'Qingdao', boothNumber: 'J864', hall: 'Hall 10.1', email: 'gao@qdelectronics.cn', phone: '+86 130 9999 0000', wechat: 'qd_electronics', alibabaUrl: '', website: '', supplierType: 'Manufacturer', categories: ['Electronics'], moq: 300, leadTime: '35 days', paymentTerms: 'T/T', customization: true, privateLabeling: false, packagingCustomization: false, sampleAvailability: true, sampleCost: 40, notes: 'Specializes in wireless electronics.', scoreQuality: 16, scorePricing: 14, scoreCommunication: 13, scoreMoq: 10, scoreCustomization: 5, scoreLeadTime: 7, scoreReliability: 4, score: 69, createdAt: days(8), updatedAt: days(1) },
  ]
  await db.collection('suppliers').insertMany(supplierDocs)

  // Products
  const productDocs = [
    {
      _id: PRODUCT_IDS[0], productType: 'CANTON_FAIR', name: 'Magnetic Cable Organizer', description: 'Premium magnetic desk cable management solution with 6 strong magnets. Keeps USB, charging, and headphone cables organized on any metal surface.', category: 'Office', subcategory: 'Desk Organization', imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400', productUrl: '', sourceUrl: 'https://tiktok.com/@tech_finds', sourcePlatform: 'TikTok', tags: ['High Margin', 'Low MOQ', 'TikTok', 'Emerging'], notes: 'Seen on multiple TikTok viral compilations. Very high engagement.',
      status: 'Shortlisted', tiktokViews: 4500000, instagramEngagement: 85000, googleTrendsScore: 72, searchInterest: 68, growthTrend: 'Viral', viralStatus: true, demandConfidence: 85,
      sriLankanCompetitors: 'None found', competitorCount: 0, localSellingPrice: 0, localAvailability: false, marketplacePresence: 'None', competitionLevel: 'Low',
      chinaCost: 2.5, moq: 100, sampleCost: 15, packagingCost: 0.5, shippingPerUnit: 1.2, customsPerUnit: 0.8, otherCosts: 0.3, landedCost: 5.3, sellingPrice: 19.99, currency: 'USD',
      score: 88, scoreDemand: 20, scoreMargin: 20, scoreCompetition: 15, scoreShipping: 9, scoreBrandability: 9, scoreContent: 9, scoreRepeatPurchase: 3, scoreRegulatory: 3, scoreSupplier: 0,
      rejectionReason: '', supplierIds: [SUPPLIER_IDS[7].toHexString()], researchItemId: RESEARCH_IDS[0].toHexString(), fairVisitId: '', createdAt: days(30), updatedAt: days(2),
    },
    {
      _id: PRODUCT_IDS[1], productType: 'CANTON_FAIR', name: 'Portable Label Printer', description: 'Compact wireless label printer with Bluetooth connectivity. Prints sticky labels without ink cartridges using thermal technology.', category: 'Office', subcategory: 'Printing', imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400', productUrl: '', sourceUrl: 'https://instagram.com/p/office_hacks', sourcePlatform: 'Instagram', tags: ['High Margin', 'TikTok', 'Canton Fair'],
      status: 'Supplier Contacted', tiktokViews: 2800000, instagramEngagement: 65000, googleTrendsScore: 65, searchInterest: 70, growthTrend: 'Growing', viralStatus: false, demandConfidence: 75,
      sriLankanCompetitors: '2 local sellers', competitorCount: 2, localSellingPrice: 8500, localAvailability: true, marketplacePresence: 'Daraz', competitionLevel: 'Low',
      chinaCost: 8.5, moq: 200, sampleCost: 25, packagingCost: 1.2, shippingPerUnit: 2.5, customsPerUnit: 1.8, otherCosts: 0.5, landedCost: 14.5, sellingPrice: 45.0, currency: 'USD',
      score: 82, scoreDemand: 16, scoreMargin: 18, scoreCompetition: 14, scoreShipping: 7, scoreBrandability: 8, scoreContent: 9, scoreRepeatPurchase: 5, scoreRegulatory: 3, scoreSupplier: 2,
      rejectionReason: '', supplierIds: [SUPPLIER_IDS[0].toHexString()], researchItemId: RESEARCH_IDS[1].toHexString(), fairVisitId: '', createdAt: days(28), updatedAt: days(3),
    },
    {
      _id: PRODUCT_IDS[2], productType: 'CANTON_FAIR', name: 'Travel Compression Cubes Set', description: 'Set of 6 packing cubes with compression zippers. Reduces luggage volume by 60%. Waterproof nylon material.', category: 'Travel', subcategory: 'Luggage Accessories', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', productUrl: '', sourceUrl: 'https://youtube.com/watch?v=travel_hacks', sourcePlatform: 'YouTube', tags: ['Low MOQ', 'Travel', 'Repeat Purchase'],
      status: 'Sample Ordered', tiktokViews: 1200000, instagramEngagement: 45000, googleTrendsScore: 58, searchInterest: 62, growthTrend: 'Growing', viralStatus: false, demandConfidence: 70,
      sriLankanCompetitors: '1 local seller', competitorCount: 1, localSellingPrice: 3200, localAvailability: false, marketplacePresence: 'None', competitionLevel: 'Low',
      chinaCost: 4.2, moq: 150, sampleCost: 18, packagingCost: 0.8, shippingPerUnit: 1.5, customsPerUnit: 1.0, otherCosts: 0.3, landedCost: 7.8, sellingPrice: 22.0, currency: 'USD',
      score: 79, scoreDemand: 13, scoreMargin: 16, scoreCompetition: 15, scoreShipping: 9, scoreBrandability: 8, scoreContent: 7, scoreRepeatPurchase: 5, scoreRegulatory: 4, scoreSupplier: 2,
      rejectionReason: '', supplierIds: [SUPPLIER_IDS[8].toHexString()], researchItemId: RESEARCH_IDS[2].toHexString(), fairVisitId: '', createdAt: days(25), updatedAt: days(1),
    },
    {
      _id: PRODUCT_IDS[3], productType: 'CANTON_FAIR', name: 'LED Desk Lamp with Wireless Charger', description: 'Smart desk lamp with built-in Qi wireless charging pad, touch dimming, and 3 color temperature modes.', category: 'Electronics', subcategory: 'Desk Accessories', imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', productUrl: '', sourceUrl: 'https://alibaba.com/product/led-desk-lamp', sourcePlatform: 'Alibaba', tags: ['High Margin', 'Canton Fair', 'Electronics'],
      status: 'Researching', tiktokViews: 850000, instagramEngagement: 32000, googleTrendsScore: 62, searchInterest: 65, growthTrend: 'Growing', viralStatus: false, demandConfidence: 65,
      sriLankanCompetitors: '3 local sellers', competitorCount: 3, localSellingPrice: 6500, localAvailability: true, marketplacePresence: 'Daraz, Facebook', competitionLevel: 'Medium',
      chinaCost: 12.0, moq: 200, sampleCost: 30, packagingCost: 1.5, shippingPerUnit: 3.5, customsPerUnit: 2.5, otherCosts: 0.8, landedCost: 20.3, sellingPrice: 55.0, currency: 'USD',
      score: 74, scoreDemand: 13, scoreMargin: 16, scoreCompetition: 10, scoreShipping: 7, scoreBrandability: 9, scoreContent: 9, scoreRepeatPurchase: 3, scoreRegulatory: 4, scoreSupplier: 3,
      rejectionReason: '', supplierIds: [SUPPLIER_IDS[0].toHexString()], researchItemId: '', fairVisitId: '', createdAt: days(22), updatedAt: days(4),
    },
    {
      _id: PRODUCT_IDS[4], productType: 'CANTON_FAIR', name: 'Silicone Kitchen Utensil Set', description: '12-piece heat-resistant silicone kitchen set with bamboo handles. BPA-free, dishwasher safe.', category: 'Kitchen', subcategory: 'Utensils', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', productUrl: '', sourceUrl: 'https://tiktok.com/@kitchen_finds', sourcePlatform: 'TikTok', tags: ['High Margin', 'Low MOQ', 'TikTok', 'Kitchen'],
      status: 'Shortlisted', tiktokViews: 3200000, instagramEngagement: 72000, googleTrendsScore: 70, searchInterest: 75, growthTrend: 'Viral', viralStatus: true, demandConfidence: 80,
      sriLankanCompetitors: 'None specific', competitorCount: 1, localSellingPrice: 2800, localAvailability: false, marketplacePresence: 'None', competitionLevel: 'Low',
      chinaCost: 3.8, moq: 100, sampleCost: 15, packagingCost: 0.7, shippingPerUnit: 1.3, customsPerUnit: 0.9, otherCosts: 0.2, landedCost: 6.9, sellingPrice: 24.0, currency: 'USD',
      score: 86, scoreDemand: 18, scoreMargin: 18, scoreCompetition: 14, scoreShipping: 9, scoreBrandability: 8, scoreContent: 9, scoreRepeatPurchase: 4, scoreRegulatory: 4, scoreSupplier: 2,
      rejectionReason: '', supplierIds: [SUPPLIER_IDS[1].toHexString()], researchItemId: RESEARCH_IDS[3].toHexString(), fairVisitId: '', createdAt: days(20), updatedAt: days(1),
    },
    {
      _id: PRODUCT_IDS[5], productType: 'CANTON_FAIR', name: 'Smart Pet Water Fountain', description: 'Automatic filtered pet water fountain with LED indicator and quiet pump. 2.5L capacity, suitable for cats and small dogs.', category: 'Pets', subcategory: 'Pet Accessories', imageUrl: 'https://images.unsplash.com/photo-1516750105099-4b8a83e217ee?w=400', productUrl: '', sourceUrl: 'https://tiktok.com/@pet_products', sourcePlatform: 'TikTok', tags: ['TikTok', 'Emerging', 'Pets'],
      status: 'Researching', tiktokViews: 2100000, instagramEngagement: 55000, googleTrendsScore: 68, searchInterest: 65, growthTrend: 'Emerging', viralStatus: false, demandConfidence: 72,
      sriLankanCompetitors: 'None', competitorCount: 0, localSellingPrice: 0, localAvailability: false, marketplacePresence: 'None', competitionLevel: 'Low',
      chinaCost: 6.5, moq: 150, sampleCost: 20, packagingCost: 1.2, shippingPerUnit: 2.0, customsPerUnit: 1.5, otherCosts: 0.5, landedCost: 11.7, sellingPrice: 35.0, currency: 'USD',
      score: 81, scoreDemand: 16, scoreMargin: 17, scoreCompetition: 15, scoreShipping: 8, scoreBrandability: 8, scoreContent: 8, scoreRepeatPurchase: 5, scoreRegulatory: 2, scoreSupplier: 2,
      rejectionReason: '', supplierIds: [SUPPLIER_IDS[3].toHexString()], researchItemId: RESEARCH_IDS[4].toHexString(), fairVisitId: '', createdAt: days(18), updatedAt: days(2),
    },
    {
      _id: PRODUCT_IDS[6], productType: 'CANTON_FAIR', name: 'Car Phone Holder with Fast Charge', description: 'Magnetic car mount with 15W wireless fast charging. Auto-clamp design, 360° rotation.', category: 'Automotive', subcategory: 'Car Accessories', imageUrl: 'https://images.unsplash.com/photo-1517153831789-b6d0a066deb7?w=400', productUrl: '', sourceUrl: 'https://alibaba.com', sourcePlatform: 'Alibaba', tags: ['Electronics', 'Automotive'],
      status: 'Researching', tiktokViews: 500000, instagramEngagement: 18000, googleTrendsScore: 55, searchInterest: 58, growthTrend: 'Stable', viralStatus: false, demandConfidence: 55,
      sriLankanCompetitors: '5 sellers', competitorCount: 5, localSellingPrice: 3500, localAvailability: true, marketplacePresence: 'Daraz', competitionLevel: 'Medium',
      chinaCost: 5.0, moq: 500, sampleCost: 22, packagingCost: 0.8, shippingPerUnit: 1.5, customsPerUnit: 1.2, otherCosts: 0.3, landedCost: 8.8, sellingPrice: 20.0, currency: 'USD',
      score: 62, scoreDemand: 10, scoreMargin: 14, scoreCompetition: 10, scoreShipping: 9, scoreBrandability: 6, scoreContent: 6, scoreRepeatPurchase: 2, scoreRegulatory: 3, scoreSupplier: 2,
      rejectionReason: '', supplierIds: [SUPPLIER_IDS[5].toHexString()], researchItemId: '', fairVisitId: '', createdAt: days(15), updatedAt: days(5),
    },
    {
      _id: PRODUCT_IDS[7], productType: 'CANTON_FAIR', name: 'Resistance Band Set (11-piece)', description: 'Premium latex resistance bands set with door anchor, handles, ankle straps and carry bag. 5 resistance levels.', category: 'Fitness', subcategory: 'Exercise Equipment', imageUrl: 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=400', productUrl: '', sourceUrl: 'https://instagram.com/fitness_finds', sourcePlatform: 'Instagram', tags: ['Fitness', 'Low MOQ', 'High Margin'],
      status: 'Shortlisted', tiktokViews: 1800000, instagramEngagement: 78000, googleTrendsScore: 72, searchInterest: 75, growthTrend: 'Growing', viralStatus: false, demandConfidence: 78,
      sriLankanCompetitors: '2 sellers', competitorCount: 2, localSellingPrice: 4200, localAvailability: false, marketplacePresence: 'None', competitionLevel: 'Low',
      chinaCost: 3.2, moq: 200, sampleCost: 15, packagingCost: 0.6, shippingPerUnit: 0.8, customsPerUnit: 0.6, otherCosts: 0.2, landedCost: 5.4, sellingPrice: 18.0, currency: 'USD',
      score: 83, scoreDemand: 16, scoreMargin: 17, scoreCompetition: 14, scoreShipping: 10, scoreBrandability: 8, scoreContent: 9, scoreRepeatPurchase: 3, scoreRegulatory: 4, scoreSupplier: 2,
      rejectionReason: '', supplierIds: [SUPPLIER_IDS[6].toHexString()], researchItemId: RESEARCH_IDS[5].toHexString(), fairVisitId: '', createdAt: days(14), updatedAt: days(1),
    },
    {
      _id: PRODUCT_IDS[8], productType: 'CANTON_FAIR', name: 'Portable Neck Massager', description: 'EMS pulse neck massager with heat function. Rechargeable, wireless, 6 massage modes.', category: 'Beauty', subcategory: 'Personal Care', imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400', productUrl: '', sourceUrl: 'https://tiktok.com/@health_gadgets', sourcePlatform: 'TikTok', tags: ['TikTok', 'High Margin', 'Viral'],
      status: 'Sample Received', tiktokViews: 5800000, instagramEngagement: 125000, googleTrendsScore: 85, searchInterest: 82, growthTrend: 'Viral', viralStatus: true, demandConfidence: 90,
      sriLankanCompetitors: 'None', competitorCount: 0, localSellingPrice: 0, localAvailability: false, marketplacePresence: 'None', competitionLevel: 'Low',
      chinaCost: 7.5, moq: 200, sampleCost: 25, packagingCost: 1.2, shippingPerUnit: 2.0, customsPerUnit: 1.5, otherCosts: 0.5, landedCost: 12.7, sellingPrice: 42.0, currency: 'USD',
      score: 91, scoreDemand: 20, scoreMargin: 18, scoreCompetition: 15, scoreShipping: 8, scoreBrandability: 10, scoreContent: 10, scoreRepeatPurchase: 4, scoreRegulatory: 4, scoreSupplier: 2,
      rejectionReason: '', supplierIds: [SUPPLIER_IDS[4].toHexString()], researchItemId: RESEARCH_IDS[6].toHexString(), fairVisitId: '', createdAt: days(12), updatedAt: days(1),
    },
    {
      _id: PRODUCT_IDS[9], productType: 'CANTON_FAIR', name: 'Bamboo Drawer Organizer Set', description: 'Expandable bamboo drawer dividers with 5 adjustable sections. Perfect for kitchen and bathroom drawers.', category: 'Home', subcategory: 'Storage & Organization', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', productUrl: '', sourceUrl: 'https://tiktok.com/@home_organization', sourcePlatform: 'TikTok', tags: ['Home', 'Eco-friendly', 'Low Competition'],
      status: 'Researching', tiktokViews: 750000, instagramEngagement: 28000, googleTrendsScore: 55, searchInterest: 52, growthTrend: 'Stable', viralStatus: false, demandConfidence: 60,
      sriLankanCompetitors: '1 seller', competitorCount: 1, localSellingPrice: 1800, localAvailability: false, marketplacePresence: 'None', competitionLevel: 'Low',
      chinaCost: 2.8, moq: 100, sampleCost: 12, packagingCost: 0.5, shippingPerUnit: 1.0, customsPerUnit: 0.7, otherCosts: 0.2, landedCost: 5.2, sellingPrice: 15.0, currency: 'USD',
      score: 71, scoreDemand: 10, scoreMargin: 16, scoreCompetition: 15, scoreShipping: 9, scoreBrandability: 7, scoreContent: 7, scoreRepeatPurchase: 3, scoreRegulatory: 4, scoreSupplier: 0,
      rejectionReason: '', supplierIds: [], researchItemId: '', fairVisitId: '', createdAt: days(10), updatedAt: days(3),
    },
    {
      _id: PRODUCT_IDS[10], productType: 'CANTON_FAIR', name: 'Mini Projector Portable', description: 'Native 1080P portable mini projector with WiFi and Bluetooth. 200 ANSI lumens, supports 300" display.', category: 'Electronics', subcategory: 'Entertainment', imageUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400', productUrl: '', sourceUrl: 'https://tiktok.com/@tech_unboxing', sourcePlatform: 'TikTok', tags: ['Electronics', 'High Margin', 'TikTok'],
      status: 'Researching', tiktokViews: 3500000, instagramEngagement: 88000, googleTrendsScore: 78, searchInterest: 80, growthTrend: 'Growing', viralStatus: false, demandConfidence: 78,
      sriLankanCompetitors: '2 sellers', competitorCount: 2, localSellingPrice: 25000, localAvailability: true, marketplacePresence: 'Daraz', competitionLevel: 'Medium',
      chinaCost: 45.0, moq: 50, sampleCost: 55, packagingCost: 3.0, shippingPerUnit: 8.0, customsPerUnit: 6.0, otherCosts: 1.5, landedCost: 63.5, sellingPrice: 130.0, currency: 'USD',
      score: 75, scoreDemand: 16, scoreMargin: 15, scoreCompetition: 10, scoreShipping: 5, scoreBrandability: 9, scoreContent: 10, scoreRepeatPurchase: 2, scoreRegulatory: 4, scoreSupplier: 4,
      rejectionReason: '', supplierIds: [SUPPLIER_IDS[9].toHexString()], researchItemId: RESEARCH_IDS[7].toHexString(), fairVisitId: '', createdAt: days(9), updatedAt: days(2),
    },
    {
      _id: PRODUCT_IDS[11], productType: 'CANTON_FAIR', name: 'Foldable Water Bottle', description: 'Collapsible silicone water bottle, 750ml. BPA-free, dishwasher safe. Folds to 2cm when empty.', category: 'Travel', subcategory: 'Hydration', imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400', productUrl: '', sourceUrl: 'https://instagram.com/eco_products', sourcePlatform: 'Instagram', tags: ['Travel', 'Eco-friendly', 'Low MOQ'],
      status: 'Shortlisted', tiktokViews: 980000, instagramEngagement: 42000, googleTrendsScore: 62, searchInterest: 65, growthTrend: 'Growing', viralStatus: false, demandConfidence: 68,
      sriLankanCompetitors: 'None', competitorCount: 0, localSellingPrice: 0, localAvailability: false, marketplacePresence: 'None', competitionLevel: 'Low',
      chinaCost: 1.8, moq: 100, sampleCost: 10, packagingCost: 0.3, shippingPerUnit: 0.5, customsPerUnit: 0.4, otherCosts: 0.1, landedCost: 3.1, sellingPrice: 12.0, currency: 'USD',
      score: 77, scoreDemand: 13, scoreMargin: 17, scoreCompetition: 15, scoreShipping: 10, scoreBrandability: 7, scoreContent: 8, scoreRepeatPurchase: 3, scoreRegulatory: 4, scoreSupplier: 0,
      rejectionReason: '', supplierIds: [], researchItemId: '', fairVisitId: '', createdAt: days(8), updatedAt: days(1),
    },
    {
      _id: PRODUCT_IDS[12], productType: 'CANTON_FAIR', name: 'Electric Lunch Box Heater', description: 'Portable 12V/24V/220V electric lunch box warmer. Stainless steel inner container, 1.5L capacity.', category: 'Kitchen', subcategory: 'Food Storage', imageUrl: 'https://images.unsplash.com/photo-1611784728730-8ee8a1040c7c?w=400', productUrl: '', sourceUrl: 'https://alibaba.com', sourcePlatform: 'Alibaba', tags: ['Kitchen', 'Practical'],
      status: 'Researching', tiktokViews: 420000, instagramEngagement: 15000, googleTrendsScore: 48, searchInterest: 45, growthTrend: 'Stable', viralStatus: false, demandConfidence: 52,
      sriLankanCompetitors: '3 sellers', competitorCount: 3, localSellingPrice: 3800, localAvailability: true, marketplacePresence: 'Daraz', competitionLevel: 'Medium',
      chinaCost: 8.0, moq: 200, sampleCost: 18, packagingCost: 1.0, shippingPerUnit: 2.5, customsPerUnit: 1.8, otherCosts: 0.5, landedCost: 13.8, sellingPrice: 28.0, currency: 'USD',
      score: 61, scoreDemand: 10, scoreMargin: 14, scoreCompetition: 10, scoreShipping: 7, scoreBrandability: 5, scoreContent: 6, scoreRepeatPurchase: 3, scoreRegulatory: 4, scoreSupplier: 2,
      rejectionReason: '', supplierIds: [], researchItemId: '', fairVisitId: '', createdAt: days(6), updatedAt: days(2),
    },
    {
      _id: PRODUCT_IDS[13], productType: 'CANTON_FAIR', name: 'Smart Plant Watering Device', description: 'Automatic drip irrigation system with soil moisture sensor. Keeps plants watered for up to 30 days.', category: 'Home', subcategory: 'Plant Care', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', productUrl: '', sourceUrl: 'https://tiktok.com/@plant_lovers', sourcePlatform: 'TikTok', tags: ['TikTok', 'Emerging', 'Unique'],
      status: 'Researching', tiktokViews: 1500000, instagramEngagement: 52000, googleTrendsScore: 65, searchInterest: 68, growthTrend: 'Emerging', viralStatus: false, demandConfidence: 70,
      sriLankanCompetitors: 'None', competitorCount: 0, localSellingPrice: 0, localAvailability: false, marketplacePresence: 'None', competitionLevel: 'Low',
      chinaCost: 4.5, moq: 100, sampleCost: 16, packagingCost: 0.8, shippingPerUnit: 1.2, customsPerUnit: 0.9, otherCosts: 0.3, landedCost: 7.7, sellingPrice: 25.0, currency: 'USD',
      score: 78, scoreDemand: 13, scoreMargin: 17, scoreCompetition: 15, scoreShipping: 9, scoreBrandability: 8, scoreContent: 9, scoreRepeatPurchase: 3, scoreRegulatory: 4, scoreSupplier: 0,
      rejectionReason: '', supplierIds: [], researchItemId: '', fairVisitId: '', createdAt: days(5), updatedAt: days(1),
    },
    {
      _id: PRODUCT_IDS[14], productType: 'CANTON_FAIR', name: 'Desk Cable Management Box', description: 'Large cable management box with lid. Hides power strips and cables. Comes with 5 cable clips.', category: 'Office', subcategory: 'Cable Management', imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c228b4b68b?w=400', productUrl: '', sourceUrl: 'https://tiktok.com/@desk_setup', sourcePlatform: 'TikTok', tags: ['Office', 'Low MOQ', 'Desk Setup'],
      status: 'Shortlisted', tiktokViews: 2200000, instagramEngagement: 62000, googleTrendsScore: 70, searchInterest: 72, growthTrend: 'Growing', viralStatus: false, demandConfidence: 75,
      sriLankanCompetitors: 'None', competitorCount: 0, localSellingPrice: 0, localAvailability: false, marketplacePresence: 'None', competitionLevel: 'Low',
      chinaCost: 5.5, moq: 100, sampleCost: 15, packagingCost: 0.8, shippingPerUnit: 1.8, customsPerUnit: 1.2, otherCosts: 0.4, landedCost: 9.7, sellingPrice: 28.0, currency: 'USD',
      score: 84, scoreDemand: 16, scoreMargin: 17, scoreCompetition: 15, scoreShipping: 8, scoreBrandability: 9, scoreContent: 9, scoreRepeatPurchase: 3, scoreRegulatory: 4, scoreSupplier: 3,
      rejectionReason: '', supplierIds: [SUPPLIER_IDS[7].toHexString()], researchItemId: RESEARCH_IDS[8].toHexString(), fairVisitId: '', createdAt: days(4), updatedAt: days(1),
    },
    // ─── DESK RESEARCH PRODUCTS (NO AI - PURE FOUNDER RESEARCH) ───
    {
      _id: PRODUCT_IDS[15],
      productType: 'DESK_RESEARCH',
      name: 'Ultrasonic Flame Effect Aroma Diffuser 500ml',
      description: 'Desk research finding from 1688 and TikTok. Simulated LED realistic flame effect + essential oil diffuser.',
      category: 'Home',
      subcategory: 'Wellness & Air Care',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      productUrl: 'https://detail.1688.com/offer/67489201928.html',
      sourceUrl: 'https://detail.1688.com/offer/67489201928.html',
      sourcePlatform: '1688',
      tags: ['Desk Research', '1688', 'TikTok Viral', 'High Margin'],
      notes: 'Discovered on 1688. Strong aesthetic appeal for Instagram reels. High markup potential in Sri Lanka.',
      researchHighlights: 'Key Findings:\n• 1688 factory offers ¥18 (~$2.50) at 100 MOQ.\n• TikTok videos have over 4.2M views with comment section flooded asking "where to buy in SL?".\n• Daraz sellers charging Rs. 5,500 representing a 4.5x markup potential.',
      overseasProviders: [
        { id: 'prov_1', platform: '1688', storeName: 'Shenzhen Flame Lighting Co.', storeUrl: 'https://detail.1688.com/offer/67489201928.html', fobPriceUsd: 2.50, fobPriceCny: 18.0, moq: 100, isPreferred: true },
        { id: 'prov_2', platform: 'Alibaba', storeName: 'Guangzhou Ambient Tech', storeUrl: 'https://ambient.en.alibaba.com', fobPriceUsd: 2.90, moq: 50, isPreferred: false },
      ],
      socialProofs: [
        { id: 'soc_1', platform: 'TikTok', postUrl: 'https://tiktok.com/@home_decor/video/71928374', viewsCount: 4200000, likesCount: 98000, commentsCount: 3400, commentFeedbackSummary: 'Comment section shows massive Sri Lankan and South Asian interest. Frequent questions about power plug compatibility and water tank capacity.', recordedAt: days(3).toISOString() },
      ],
      localCompetitors: [
        { id: 'comp_1', platform: 'Daraz', storeName: 'Lanka Lifestyle Hub', productUrl: 'https://daraz.lk/products/flame-diffuser', sellingPriceLkr: 5500, stockStatus: 'In Stock', observations: 'Sells out quickly during gift seasons.' },
      ],
      status: 'Shortlisted', tiktokViews: 4200000, instagramEngagement: 98000, googleTrendsScore: 80, searchInterest: 78, growthTrend: 'Viral', viralStatus: true, demandConfidence: 88,
      sriLankanCompetitors: 'Lanka Lifestyle Hub (Rs. 5,500)', competitorCount: 1, localSellingPrice: 5500, localAvailability: true, marketplacePresence: 'Daraz', competitionLevel: 'Low',
      chinaCost: 2.50, moq: 100, sampleCost: 15, packagingCost: 0.8, shippingPerUnit: 1.5, customsPerUnit: 1.0, otherCosts: 0.3, landedCost: 5.3, sellingPrice: 5500, currency: 'USD',
      score: 89, scoreDemand: 18, scoreMargin: 18, scoreCompetition: 14, scoreShipping: 9, scoreBrandability: 9, scoreContent: 10, scoreRepeatPurchase: 5, scoreRegulatory: 4, scoreSupplier: 2,
      rejectionReason: '', supplierIds: [], researchItemId: '', fairVisitId: '', createdAt: days(3), updatedAt: days(1),
    },
    {
      _id: PRODUCT_IDS[16],
      productType: 'DESK_RESEARCH',
      name: 'Electric Foot Callus Remover & Vacuum Cleaner',
      description: 'Rechargeable electric foot file with built-in dander vacuum absorption system.',
      category: 'Beauty',
      subcategory: 'Personal Care',
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
      productUrl: 'https://detail.1688.com/offer/5892301928.html',
      sourceUrl: 'https://detail.1688.com/offer/5892301928.html',
      sourcePlatform: '1688',
      tags: ['Desk Research', '1688', 'Personal Care'],
      notes: 'Found during beauty trend audit. Very low weight (0.2kg), cheap shipping.',
      researchHighlights: 'Key Observations:\n• Unit weight is under 200g, keeping air/sea freight minimal.\n• Factory in Yiwu offers custom color box packaging at 200 units MOQ.\n• High problem-solving appeal for Facebook video ad campaigns in SL.',
      overseasProviders: [
        { id: 'prov_3', platform: '1688', storeName: 'Yiwu Beauty Care Factory', storeUrl: 'https://detail.1688.com/offer/5892301928.html', fobPriceUsd: 1.80, fobPriceCny: 12.8, moq: 200, isPreferred: true },
      ],
      socialProofs: [
        { id: 'soc_2', platform: 'Facebook', postUrl: 'https://facebook.com/watch/video/8827361', viewsCount: 1500000, likesCount: 42000, commentsCount: 1800, commentFeedbackSummary: 'Users love that it vacuums dead skin dust automatically.', recordedAt: days(2).toISOString() },
      ],
      localCompetitors: [
        { id: 'comp_2', platform: 'Instagram Shop', storeName: '@beauty_store_sl', productUrl: 'https://instagram.com/p/beauty_store', sellingPriceLkr: 3800, stockStatus: 'In Stock', observations: 'Selling heavily on IG direct message orders.' },
      ],
      status: 'Researching', tiktokViews: 1500000, instagramEngagement: 42000, googleTrendsScore: 70, searchInterest: 68, growthTrend: 'Growing', viralStatus: false, demandConfidence: 75,
      sriLankanCompetitors: '@beauty_store_sl (Rs. 3,800)', competitorCount: 1, localSellingPrice: 3800, localAvailability: true, marketplacePresence: 'Instagram', competitionLevel: 'Low',
      chinaCost: 1.80, moq: 200, sampleCost: 10, packagingCost: 0.5, shippingPerUnit: 0.8, customsPerUnit: 0.6, otherCosts: 0.2, landedCost: 3.9, sellingPrice: 3800, currency: 'USD',
      score: 82, scoreDemand: 15, scoreMargin: 18, scoreCompetition: 15, scoreShipping: 10, scoreBrandability: 7, scoreContent: 8, scoreRepeatPurchase: 4, scoreRegulatory: 3, scoreSupplier: 2,
      rejectionReason: '', supplierIds: [], researchItemId: '', fairVisitId: '', createdAt: days(2), updatedAt: days(1),
    },
    {
      _id: PRODUCT_IDS[17],
      productType: 'DESK_RESEARCH',
      name: 'Smart Hydrocolloid Acne Patch (96 count)',
      description: 'Micro-dart tea tree oil hydrocolloid pimple patches.',
      category: 'Beauty',
      subcategory: 'Skincare',
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
      productUrl: 'https://detail.1688.com/offer/7123981290.html',
      sourceUrl: 'https://detail.1688.com/offer/7123981290.html',
      sourcePlatform: '1688',
      tags: ['Desk Research', 'Skincare', 'Repeat Purchase'],
      notes: 'Insanely high repeat purchase rate. Envelope style packaging makes shipping virtually free.',
      researchHighlights: 'Key Sourcing Highlights:\n• FOB cost $0.75 per pack of 96 patches.\n• Local selling target Rs. 2,400 per pack.\n• Consumable product line driving repeat subscription orders.',
      overseasProviders: [
        { id: 'prov_4', platform: '1688', storeName: 'Guangzhou Biotech Skincare', storeUrl: 'https://detail.1688.com/offer/7123981290.html', fobPriceUsd: 0.75, fobPriceCny: 5.2, moq: 300, isPreferred: true },
      ],
      socialProofs: [
        { id: 'soc_3', platform: 'TikTok', postUrl: 'https://tiktok.com/@skincare_hacks/video/981237', viewsCount: 8900000, likesCount: 220000, commentsCount: 6700, commentFeedbackSummary: 'Massive viral momentum. Users re-order monthly.', recordedAt: days(1).toISOString() },
      ],
      localCompetitors: [],
      status: 'Validated', tiktokViews: 8900000, instagramEngagement: 220000, googleTrendsScore: 92, searchInterest: 90, growthTrend: 'Viral', viralStatus: true, demandConfidence: 95,
      sriLankanCompetitors: 'None', competitorCount: 0, localSellingPrice: 2400, localAvailability: false, marketplacePresence: 'None', competitionLevel: 'Low',
      chinaCost: 0.75, moq: 300, sampleCost: 8, packagingCost: 0.2, shippingPerUnit: 0.3, customsPerUnit: 0.2, otherCosts: 0.1, landedCost: 1.5, sellingPrice: 2400, currency: 'USD',
      score: 94, scoreDemand: 20, scoreMargin: 20, scoreCompetition: 15, scoreShipping: 10, scoreBrandability: 8, scoreContent: 10, scoreRepeatPurchase: 5, scoreRegulatory: 4, scoreSupplier: 2,
      rejectionReason: '', supplierIds: [], researchItemId: '', fairVisitId: '', createdAt: days(1), updatedAt: days(0),
    },
  ]

  await db.collection('products').insertMany(productDocs)

  // Research Items
  const researchDocs = [
    { _id: RESEARCH_IDS[0], title: 'Magnetic desk organizers going viral on TikTok', productId: PRODUCT_IDS[0].toHexString(), source: '@desk_setups', url: 'https://tiktok.com/@desk_setups/video/1234', platform: 'TikTok', dateDiscovered: days(35).toISOString(), views: 4500000, likes: 320000, comments: 18000, shares: 95000, trendStatus: 'Viral', notes: 'Multiple creators posting desk setups with magnetic organizers', competitionNotes: 'No local competition found', potential: 'High', researchScore: 88, convertedToProduct: true, createdAt: days(35), updatedAt: days(30) },
    { _id: RESEARCH_IDS[1], title: 'Wireless label printers trending for home organization', productId: PRODUCT_IDS[1].toHexString(), source: '@organize_with_me', url: 'https://instagram.com/p/abc123', platform: 'Instagram', dateDiscovered: days(30).toISOString(), views: 850000, likes: 65000, comments: 4200, shares: 28000, trendStatus: 'Growing', notes: 'Home organization niche is booming', competitionNotes: 'Some sellers on Daraz but quality is poor', potential: 'High', researchScore: 82, convertedToProduct: true, createdAt: days(30), updatedAt: days(28) },
    { _id: RESEARCH_IDS[2], title: 'Packing cubes for travel exploding on YouTube', productId: PRODUCT_IDS[2].toHexString(), source: 'Lost LeBlancs', url: 'https://youtube.com/watch?v=xyz456', platform: 'YouTube', dateDiscovered: days(28).toISOString(), views: 1200000, likes: 45000, comments: 2800, shares: 15000, trendStatus: 'Growing', notes: 'Travel niche recovering strongly post-COVID', competitionNotes: 'Limited local availability', potential: 'High', researchScore: 79, convertedToProduct: true, createdAt: days(28), updatedAt: days(25) },
    { _id: RESEARCH_IDS[3], title: 'Silicone kitchen sets dominating TikTok kitchen content', productId: PRODUCT_IDS[4].toHexString(), source: '@cooking_hacks', url: 'https://tiktok.com/@cooking_hacks/video/5678', platform: 'TikTok', dateDiscovered: days(22).toISOString(), views: 3200000, likes: 285000, comments: 22000, shares: 88000, trendStatus: 'Viral', notes: 'Very high engagement on all kitchen content', competitionNotes: 'None specific found locally', potential: 'High', researchScore: 86, convertedToProduct: true, createdAt: days(22), updatedAt: days(20) },
    { _id: RESEARCH_IDS[4], title: 'Smart pet water fountains going mainstream', productId: PRODUCT_IDS[5].toHexString(), source: '@petmom_hacks', url: 'https://tiktok.com/@petmom_hacks/video/9012', platform: 'TikTok', dateDiscovered: days(20).toISOString(), views: 2100000, likes: 188000, comments: 14000, shares: 62000, trendStatus: 'Emerging', notes: 'Pet category growing rapidly in Sri Lanka', competitionNotes: 'Zero local competition', potential: 'High', researchScore: 81, convertedToProduct: true, createdAt: days(20), updatedAt: days(18) },
    { _id: RESEARCH_IDS[5], title: 'Resistance bands still trending despite gym reopenings', productId: PRODUCT_IDS[7].toHexString(), source: '@fitness_routine', url: 'https://instagram.com/p/fit123', platform: 'Instagram', dateDiscovered: days(16).toISOString(), views: 580000, likes: 78000, comments: 5200, shares: 22000, trendStatus: 'Growing', notes: 'Home fitness remains popular', competitionNotes: 'Very low local competition', potential: 'High', researchScore: 83, convertedToProduct: true, createdAt: days(16), updatedAt: days(14) },
    { _id: RESEARCH_IDS[6], title: 'Neck massagers going massively viral', productId: PRODUCT_IDS[8].toHexString(), source: '@relaxation_tips', url: 'https://tiktok.com/@relaxation_tips/video/3456', platform: 'TikTok', dateDiscovered: days(14).toISOString(), views: 5800000, likes: 425000, comments: 35000, shares: 145000, trendStatus: 'Viral', notes: 'Exceptional engagement. Must investigate immediately.', competitionNotes: 'Zero local competition', potential: 'High', researchScore: 91, convertedToProduct: true, createdAt: days(14), updatedAt: days(12) },
    { _id: RESEARCH_IDS[7], title: 'Mini projectors getting mainstream attention', productId: PRODUCT_IDS[10].toHexString(), source: '@tech_reviews_lk', url: 'https://tiktok.com/@tech_reviews/video/7890', platform: 'TikTok', dateDiscovered: days(11).toISOString(), views: 3500000, likes: 280000, comments: 22000, shares: 95000, trendStatus: 'Growing', notes: 'Projectors becoming lifestyle items not just business tools', competitionNotes: 'Some on Daraz but expensive', potential: 'High', researchScore: 75, convertedToProduct: true, createdAt: days(11), updatedAt: days(9) },
    { _id: RESEARCH_IDS[8], title: 'Cable management boxes trending in WFH content', productId: PRODUCT_IDS[14].toHexString(), source: '@work_from_home_setup', url: 'https://tiktok.com/@wfh_setup/video/2345', platform: 'TikTok', dateDiscovered: days(6).toISOString(), views: 2200000, likes: 195000, comments: 16000, shares: 68000, trendStatus: 'Growing', notes: 'WFH setup content continues to perform well', competitionNotes: 'No local suppliers found', potential: 'High', researchScore: 84, convertedToProduct: true, createdAt: days(6), updatedAt: days(4) },
    { _id: RESEARCH_IDS[9], title: 'Aromatherapy diffusers evergreen product', productId: PRODUCT_IDS[15].toHexString(), source: '@home_wellness', url: 'https://tiktok.com/@home_wellness/video/6789', platform: 'TikTok', dateDiscovered: days(5).toISOString(), views: 4200000, likes: 378000, comments: 28000, shares: 125000, trendStatus: 'Viral', notes: 'Home wellness is massive niche', competitionNotes: 'One local seller, quality issues', potential: 'High', researchScore: 89, convertedToProduct: true, createdAt: days(5), updatedAt: days(3) },
    { _id: RESEARCH_IDS[10], title: 'Posture correctors massive viral trend', productId: PRODUCT_IDS[17].toHexString(), source: '@health_is_wealth', url: 'https://tiktok.com/@health_is_wealth/video/0123', platform: 'TikTok', dateDiscovered: days(3).toISOString(), views: 6200000, likes: 545000, comments: 42000, shares: 188000, trendStatus: 'Viral', notes: 'Desk workers are a massive target audience', competitionNotes: 'Zero local competition', potential: 'High', researchScore: 90, convertedToProduct: true, createdAt: days(3), updatedAt: days(1) },
    { _id: RESEARCH_IDS[11], title: 'Acne patches absolute viral sensation', productId: PRODUCT_IDS[19].toHexString(), source: '@skincare_community', url: 'https://tiktok.com/@skincare/video/4567', platform: 'TikTok', dateDiscovered: days(2).toISOString(), views: 8900000, likes: 780000, comments: 58000, shares: 280000, trendStatus: 'Viral', notes: 'Skincare is massive. Acne patches specifically are huge', competitionNotes: 'Not available locally at all', potential: 'High', researchScore: 94, convertedToProduct: true, createdAt: days(2), updatedAt: days(1) },
    { _id: RESEARCH_IDS[12], title: 'Sunset lamp projector trend', productId: '', source: '@aesthetic_room', url: 'https://tiktok.com/@aesthetic_room/video/8901', platform: 'TikTok', dateDiscovered: days(1).toISOString(), views: 3800000, likes: 335000, comments: 26000, shares: 112000, trendStatus: 'Growing', notes: 'Aesthetic room setups trend. Young demographic.', competitionNotes: 'Unknown', potential: 'High', researchScore: 78, convertedToProduct: false, createdAt: days(1), updatedAt: days(1) },
    { _id: RESEARCH_IDS[13], title: 'Electric milk frother trending on coffee content', productId: '', source: '@coffee_art', url: 'https://instagram.com/p/coffee456', platform: 'Instagram', dateDiscovered: days(0).toISOString(), views: 1200000, likes: 95000, comments: 7800, shares: 32000, trendStatus: 'Growing', notes: 'Coffee culture growing in Sri Lanka', competitionNotes: 'Unknown', potential: 'Medium', researchScore: 71, convertedToProduct: false, createdAt: days(0), updatedAt: days(0) },
    { _id: RESEARCH_IDS[14], title: 'Portable blender bottles going viral', productId: '', source: '@healthy_lifestyle', url: 'https://tiktok.com/@healthy_life/video/2109', platform: 'TikTok', dateDiscovered: days(0).toISOString(), views: 2500000, likes: 218000, comments: 18000, shares: 75000, trendStatus: 'Emerging', notes: 'Health and fitness trend aligns perfectly', competitionNotes: 'Unknown', potential: 'High', researchScore: 80, convertedToProduct: false, createdAt: days(0), updatedAt: days(0) },
  ]
  await db.collection('researchItems').insertMany(researchDocs)

  // Samples
  const sampleDocs = [
    { _id: SAMPLE_IDS[0], productId: PRODUCT_IDS[2].toHexString(), supplierId: SUPPLIER_IDS[8].toHexString(), orderDate: days(20).toISOString(), sampleCost: 18, shippingCost: 25, expectedArrival: days(5).toISOString(), receivedDate: '', qualityScore: 0, packagingScore: 0, productUsefulness: 0, customerAppeal: 0, notes: 'Ordered via Alibaba. Tracking: XM123456789CN', photos: [], finalDecision: 'Pending', status: 'Shipped', createdAt: days(20), updatedAt: days(18) },
    { _id: SAMPLE_IDS[1], productId: PRODUCT_IDS[8].toHexString(), supplierId: SUPPLIER_IDS[4].toHexString(), orderDate: days(18).toISOString(), sampleCost: 25, shippingCost: 30, expectedArrival: days(2).toISOString(), receivedDate: days(3).toISOString(), qualityScore: 9, packagingScore: 8, productUsefulness: 9, customerAppeal: 10, notes: 'Sample received! Excellent quality. Premium packaging. Friends loved it.', photos: [], finalDecision: 'Approve', status: 'Decided', createdAt: days(18), updatedAt: days(3) },
    { _id: SAMPLE_IDS[2], productId: PRODUCT_IDS[17].toHexString(), supplierId: SUPPLIER_IDS[6].toHexString(), orderDate: days(10).toISOString(), sampleCost: 12, shippingCost: 20, expectedArrival: days(-3).toISOString(), receivedDate: '', qualityScore: 0, packagingScore: 0, productUsefulness: 0, customerAppeal: 0, notes: 'Expected to arrive in 3 days.', photos: [], finalDecision: 'Pending', status: 'Shipped', createdAt: days(10), updatedAt: days(8) },
    { _id: SAMPLE_IDS[3], productId: PRODUCT_IDS[4].toHexString(), supplierId: SUPPLIER_IDS[1].toHexString(), orderDate: days(8).toISOString(), sampleCost: 15, shippingCost: 22, expectedArrival: days(-5).toISOString(), receivedDate: days(1).toISOString(), qualityScore: 8, packagingScore: 9, productUsefulness: 8, customerAppeal: 9, notes: 'Great quality. Heat resistant as claimed. Packaging is premium.', photos: [], finalDecision: 'Approve', status: 'Decided', createdAt: days(8), updatedAt: days(1) },
    { _id: SAMPLE_IDS[4], productId: PRODUCT_IDS[0].toHexString(), supplierId: SUPPLIER_IDS[7].toHexString(), orderDate: days(5).toISOString(), sampleCost: 15, shippingCost: 18, expectedArrival: days(-7).toISOString(), receivedDate: '', qualityScore: 0, packagingScore: 0, productUsefulness: 0, customerAppeal: 0, notes: '', photos: [], finalDecision: 'Pending', status: 'Ordered', createdAt: days(5), updatedAt: days(5) },
  ]
  await db.collection('samples').insertMany(sampleDocs)

  // Activities
  const activityDocs = [
    { type: 'product_created', entityId: PRODUCT_IDS[19].toHexString(), entityType: 'product', entityName: 'Acne Patch Set', description: 'Product created from TikTok research', metadata: {}, createdAt: days(0) },
    { type: 'product_status_changed', entityId: PRODUCT_IDS[17].toHexString(), entityType: 'product', entityName: 'Posture Corrector Brace', description: 'Status changed to Shortlisted', metadata: { from: 'Researching', to: 'Shortlisted' }, createdAt: days(1) },
    { type: 'sample_ordered', entityId: SAMPLE_IDS[2].toHexString(), entityType: 'sample', entityName: 'Posture Corrector Brace sample', description: 'Sample ordered from Hangzhou Fitness Gear', metadata: {}, createdAt: days(10) },
    { type: 'sample_received', entityId: SAMPLE_IDS[1].toHexString(), entityType: 'sample', entityName: 'Portable Neck Massager sample', description: 'Sample received and approved', metadata: { decision: 'Approve' }, createdAt: days(3) },
    { type: 'product_shortlisted', entityId: PRODUCT_IDS[0].toHexString(), entityType: 'product', entityName: 'Magnetic Cable Organizer', description: 'Added to shortlist', metadata: {}, createdAt: days(5) },
    { type: 'supplier_added', entityId: SUPPLIER_IDS[0].toHexString(), entityType: 'supplier', entityName: 'Shenzhen TechPro Manufacturing', description: 'New supplier added', metadata: {}, createdAt: days(45) },
    { type: 'research_converted', entityId: PRODUCT_IDS[8].toHexString(), entityType: 'product', entityName: 'Portable Neck Massager', description: 'Research item converted to product', metadata: {}, createdAt: days(14) },
    { type: 'validation_completed', entityId: PRODUCT_IDS[15].toHexString(), entityType: 'product', entityName: 'Aromatherapy Diffuser', description: 'Product validated successfully', metadata: { result: 'Validated' }, createdAt: days(3) },
  ]
  await db.collection('activities').insertMany(activityDocs)

  return {
    products: productDocs.length,
    suppliers: supplierDocs.length,
    research: researchDocs.length,
    samples: sampleDocs.length,
  }
}
