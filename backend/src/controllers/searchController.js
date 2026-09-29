const { PHC, Medicine, Inventory, Alert, ResourceTransfer } = require('../models');

// Escape regular expression special characters to avoid injection errors
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Static Application Navigation Pages with role clearance definitions
 */
const SYSTEM_PAGES = [
  {
    title: 'Operations Dashboard',
    type: 'PAGE',
    category: 'Pages',
    subtitle: 'Real-time telemetry, bed load & health metrics',
    route: '/dashboard',
    keywords: ['dashboard', 'home', 'overview', 'telemetry', 'operations', 'beds', 'kpis'],
    allowedRoles: ['admin', 'health_worker', 'viewer']
  },
  {
    title: 'PHC Map & Geospatial Grid',
    type: 'PAGE',
    category: 'Pages',
    subtitle: 'Interactive GIS facility map & triage status',
    route: '/phc-map',
    keywords: ['phc', 'map', 'gis', 'facilities', 'centres', 'geospatial', 'locations'],
    allowedRoles: ['admin', 'health_worker', 'viewer']
  },
  {
    title: 'Medicine & Supply Inventory',
    type: 'PAGE',
    category: 'Pages',
    subtitle: 'Pharmaceutical stock, burn rate velocity & replenishment',
    route: '/inventory',
    keywords: ['inventory', 'medicines', 'stock', 'pharmacy', 'drugs', 'supplies', 'burn rate'],
    allowedRoles: ['admin', 'health_worker', 'viewer']
  },
  {
    title: 'Critical Resources & Bed Management',
    type: 'PAGE',
    category: 'Pages',
    subtitle: 'ICU capacity, ventilators, oxygen reserves & bed registry',
    route: '/resources',
    keywords: ['resources', 'beds', 'icu', 'ventilators', 'oxygen', 'capacity', 'staff'],
    allowedRoles: ['admin', 'health_worker', 'viewer']
  },
  {
    title: 'AI Demand Forecast & Outbreak Prediction',
    type: 'PAGE',
    category: 'Pages',
    subtitle: '7-day and 30-day machine learning epidemiological forecasts',
    route: '/forecast',
    keywords: ['forecast', 'ai', 'prediction', 'neural', 'demand', 'epidemiology', 'surge'],
    allowedRoles: ['admin', 'health_worker', 'viewer']
  },
  {
    title: 'Inter-Facility Resource Redistribution',
    type: 'PAGE',
    category: 'Pages',
    subtitle: 'Automated surplus rebalancing & transit fleet logistics',
    route: '/redistribution',
    keywords: ['redistribution', 'transfer', 'dispatch', 'logistics', 'rebalance', 'transit'],
    allowedRoles: ['admin', 'health_worker', 'viewer']
  },
  {
    title: 'Emergency Surge Command Center',
    type: 'PAGE',
    category: 'Pages',
    subtitle: 'Critical surge simulation, rapid triage diversion & alert protocols',
    route: '/emergency',
    keywords: ['emergency', 'surge', 'outbreak', 'alert', 'crisis', 'triage', 'critical', 'lockdown'],
    allowedRoles: ['admin', 'health_worker', 'viewer']
  },
  {
    title: 'Federated AI Multi-State Network',
    type: 'PAGE',
    category: 'Pages',
    subtitle: 'Privacy-preserving FedAvg model aggregation (MP, RJ, GJ)',
    route: '/federated-ai',
    keywords: ['federated', 'fedavg', 'aggregation', 'ai', 'model', 'privacy', 'machine learning'],
    allowedRoles: ['admin', 'health_worker', 'viewer']
  },
  {
    title: 'Clinician Account Registry & Clearances',
    type: 'PAGE',
    category: 'Pages',
    subtitle: 'User access levels, role promotions & system audit logs',
    route: '/admin/users',
    keywords: ['users', 'accounts', 'clinicians', 'roles', 'clearances', 'audit', 'permissions', 'admin'],
    allowedRoles: ['admin']
  },
  {
    title: 'Clinician Profile & Clearances',
    type: 'PAGE',
    category: 'Pages',
    subtitle: 'Active duty status, credentials & security badge',
    route: '/profile',
    keywords: ['profile', 'account', 'duty', 'doctor', 'clearance', 'credentials'],
    allowedRoles: ['admin', 'health_worker', 'viewer']
  },
  {
    title: 'System & Platform Settings',
    type: 'PAGE',
    category: 'Pages',
    subtitle: 'API integration endpoints, telemetry thresholds & preferences',
    route: '/settings',
    keywords: ['settings', 'config', 'api', 'preferences', 'system'],
    allowedRoles: ['admin', 'health_worker', 'viewer']
  }
];

/**
 * @desc    Global Live Autocomplete & Search Endpoint
 * @route   GET /api/search?q=...
 * @access  Private / Authenticated
 */
const globalSearch = async (req, res) => {
  try {
    const rawQuery = req.query.q || '';
    const query = rawQuery.trim();

    if (!query || query.length < 1) {
      return res.status(200).json({
        success: true,
        query: '',
        count: 0,
        data: {
          pages: [],
          phcs: [],
          medicines: [],
          inventory: [],
          alerts: [],
          transfers: []
        },
        results: []
      });
    }

    const safeRegex = new RegExp(escapeRegex(query), 'i');
    const userRole = req.user?.role || 'viewer';

    // 1. Search Matching System Pages based on Role
    const matchingPages = SYSTEM_PAGES.filter(p => {
      if (!p.allowedRoles.includes(userRole)) return false;
      const titleMatch = safeRegex.test(p.title);
      const keywordMatch = p.keywords.some(k => safeRegex.test(k));
      return titleMatch || keywordMatch;
    }).map(p => ({
      id: `page-${p.route}`,
      title: p.title,
      type: 'PAGE',
      category: 'Pages',
      subtitle: p.subtitle,
      route: p.route,
      score: p.title.toLowerCase().startsWith(query.toLowerCase()) ? 100 : 50
    }));

    // 2. Parallel Database Searches
    const [phcResults, medicineResults, inventoryResults, alertResults, transferResults] = await Promise.all([
      // PHCs: name, district, state, phcId
      PHC.find({
        $or: [
          { name: safeRegex },
          { district: safeRegex },
          { state: safeRegex },
          { phcId: safeRegex }
        ]
      }).limit(6).lean(),

      // Medicines: name, category, genericName
      Medicine.find({
        $or: [
          { name: safeRegex },
          { category: safeRegex },
          { genericName: safeRegex }
        ]
      }).limit(6).lean(),

      // Inventory: query populated medicines and phcs
      Inventory.find()
        .populate('phcId', 'name district state')
        .populate('medicineId', 'name category unit')
        .limit(30)
        .lean(),

      // Alerts: title, facilityName, medicineName, message
      Alert.find({
        $or: [
          { title: safeRegex },
          { facilityName: safeRegex },
          { medicineName: safeRegex },
          { message: safeRegex },
          { severity: safeRegex }
        ]
      }).limit(6).lean(),

      // Transfers: resourceName, reason, priority
      ResourceTransfer.find({
        $or: [
          { reason: safeRegex },
          { priority: safeRegex },
          { status: safeRegex }
        ]
      })
        .populate('sourcePhcId', 'name district')
        .populate('destinationPhcId', 'name district')
        .populate('medicineId', 'name')
        .limit(6)
        .lean()
    ]);

    // Format PHC Results
    const formattedPHCs = phcResults.map(p => {
      const isExact = p.name.toLowerCase() === query.toLowerCase();
      const isPrefix = p.name.toLowerCase().startsWith(query.toLowerCase());
      return {
        id: p._id.toString(),
        title: p.name,
        type: 'PHC',
        category: 'PHCs',
        subtitle: `${p.district}, ${p.state} • ${p.totalBeds} Beds • ${p.status || 'Active'}`,
        badge: p.status || 'Online',
        route: `/phc-map?search=${encodeURIComponent(p.name)}`,
        score: isExact ? 100 : isPrefix ? 80 : 40
      };
    });

    // Format Medicine Results
    const formattedMedicines = medicineResults.map(m => {
      const isExact = m.name.toLowerCase() === query.toLowerCase();
      const isPrefix = m.name.toLowerCase().startsWith(query.toLowerCase());
      return {
        id: m._id.toString(),
        title: m.name,
        type: 'MEDICINE',
        category: 'Medicines',
        subtitle: `${m.category} • Target Stock: ${m.reorderThreshold * 2} ${m.unit}`,
        badge: m.category,
        route: `/inventory?search=${encodeURIComponent(m.name)}`,
        score: isExact ? 100 : isPrefix ? 80 : 40
      };
    });

    // Filter and Format Inventory Matches
    const matchingInventories = inventoryResults
      .filter(inv => {
        if (!inv.medicineId || !inv.phcId) return false;
        return (
          safeRegex.test(inv.medicineId.name) ||
          safeRegex.test(inv.phcId.name) ||
          safeRegex.test(inv.phcId.district) ||
          safeRegex.test(inv.stockStatus) ||
          safeRegex.test(inv.riskLevel)
        );
      })
      .slice(0, 5)
      .map(inv => ({
        id: inv._id.toString(),
        title: `${inv.medicineId.name} @ ${inv.phcId.name}`,
        type: 'INVENTORY',
        category: 'Inventory',
        subtitle: `Stock: ${inv.currentStock} ${inv.medicineId.unit} • Runway: ${inv.daysRemaining} days • ${inv.phcId.district}`,
        badge: inv.riskLevel || inv.stockStatus,
        route: `/inventory?search=${encodeURIComponent(inv.medicineId.name)}`,
        score: inv.medicineId.name.toLowerCase().startsWith(query.toLowerCase()) ? 75 : 35
      }));

    // Format Alert Results
    const formattedAlerts = alertResults.map(a => ({
      id: a._id.toString(),
      title: a.title,
      type: 'ALERT',
      category: 'Alerts',
      subtitle: `${a.facilityName} • ${a.severity} Severity • ${a.message.slice(0, 60)}...`,
      badge: a.severity,
      route: `/emergency`,
      score: a.title.toLowerCase().startsWith(query.toLowerCase()) ? 90 : 45
    }));

    // Format Transfer Results
    const formattedTransfers = transferResults.map(t => {
      const medName = t.medicineId?.name || 'Critical Supply';
      const source = t.sourcePhcId?.name || 'Origin PHC';
      const dest = t.destinationPhcId?.name || 'Destination PHC';
      return {
        id: t._id.toString(),
        title: `Redistribution: ${medName}`,
        type: 'TRANSFER',
        category: 'Transfers',
        subtitle: `${source} → ${dest} • ${t.recommendedQuantity || 0} Units (${t.priority} Priority)`,
        badge: t.status,
        route: `/redistribution?search=${encodeURIComponent(medName)}`,
        score: 40
      };
    });

    // Merge and rank overall top suggestions
    const allResults = [
      ...matchingPages,
      ...formattedPHCs,
      ...formattedMedicines,
      ...matchingInventories,
      ...formattedAlerts,
      ...formattedTransfers
    ].sort((a, b) => b.score - a.score);

    // Grouping by category
    res.status(200).json({
      success: true,
      query,
      count: allResults.length,
      data: {
        pages: matchingPages,
        phcs: formattedPHCs,
        medicines: formattedMedicines,
        inventory: matchingInventories,
        alerts: formattedAlerts,
        transfers: formattedTransfers
      },
      results: allResults.slice(0, 10) // Top 10 unified suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Global search execution error: ' + error.message
    });
  }
};

module.exports = {
  globalSearch
};
