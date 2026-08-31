/**
 * e-Bhoomi Role-Based Navigation & Contextual Header Configuration
 */

export const ROLE_NAVIGATION_CONFIG = {
  FIELD_OFFICER: {
    appTitle: "FIELD / VILLAGE REVENUE PORTAL",
    contextLabel: "Assigned Village Jurisdiction Scope",
    baseRoute: "/officer",
    navItems: [
      { label: "Dashboard", path: "/officer/dashboard", icon: "LayoutDashboard" },
      { label: "New Digitization", path: "/officer/digitization/new", icon: "FilePlus" },
      { label: "My Records", path: "/officer/records", icon: "FileText" },
      { label: "Pending Review", path: "/officer/review", icon: "Clock" },
      { label: "Field Verification", path: "/officer/field-verification", icon: "MapPin" },
      { label: "Corrections", path: "/officer/corrections", icon: "Edit3" },
      { label: "Submitted Records", path: "/officer/submitted", icon: "CheckCircle" }
    ]
  },
  MRO: {
    appTitle: "MANDAL REVENUE ADMINISTRATION",
    contextLabel: "Mandal / Taluk Jurisdiction Scope",
    baseRoute: "/mro",
    navItems: [
      { label: "Dashboard", path: "/mro/dashboard", icon: "LayoutDashboard" },
      { label: "Field Officers", path: "/mro/field-officers", icon: "Users" },
      { label: "Villages", path: "/mro/villages", icon: "Building" },
      { label: "Digitization", path: "/officer/digitization/new", icon: "FilePlus" },
      { label: "Pending Approvals", path: "/mro/approvals", icon: "FileCheck" },
      { label: "Corrections", path: "/mro/corrections", icon: "Edit3" },
      { label: "Field Verification", path: "/mro/field-verification", icon: "MapPin" },
      { label: "Reports", path: "/mro/reports", icon: "BarChart3" },
      { label: "Audit", path: "/mro/audit", icon: "History" }
    ]
  },
  RDO: {
    appTitle: "REVENUE DIVISION ADMINISTRATION",
    contextLabel: "Revenue Division Jurisdiction Scope",
    baseRoute: "/rdo",
    navItems: [
      { label: "Dashboard", path: "/rdo/dashboard", icon: "LayoutDashboard" },
      { label: "Mandals / Taluks", path: "/admin/subdistricts", icon: "Layers" },
      { label: "MRO / Tahsildars", path: "/rdo/mros", icon: "Users" },
      { label: "Field Officers", path: "/rdo/field-officers", icon: "Users" },
      { label: "Pending Cases", path: "/rdo/cases", icon: "FileCheck" },
      { label: "Reports", path: "/rdo/reports", icon: "BarChart3" },
      { label: "Audit", path: "/rdo/audit", icon: "History" }
    ]
  },
  DISTRICT: {
    appTitle: "DISTRICT LAND RECORD ADMINISTRATION",
    contextLabel: "District Jurisdiction Scope",
    baseRoute: "/district",
    navItems: [
      { label: "Dashboard", path: "/district/dashboard", icon: "LayoutDashboard" },
      { label: "Revenue Divisions", path: "/admin/revenue-divisions", icon: "Layers" },
      { label: "MRO / Tahsildars", path: "/district/mros", icon: "Users" },
      { label: "Field Officers", path: "/district/field-officers", icon: "Users" },
      { label: "District Records", path: "/district/records", icon: "FileText" },
      { label: "Reports", path: "/district/reports", icon: "BarChart3" },
      { label: "Audit", path: "/district/audit", icon: "History" }
    ]
  },
  STATE: {
    appTitle: "STATE LAND RECORD ADMINISTRATION",
    contextLabel: "State-wide System Jurisdiction Scope",
    baseRoute: "/state",
    navItems: [
      { label: "Dashboard", path: "/state/dashboard", icon: "LayoutDashboard" },
      { label: "Districts", path: "/state/districts", icon: "MapPin" },
      { label: "Revenue Divisions", path: "/state/rdo", icon: "Layers" },
      { label: "MRO / Tahsildars", path: "/state/mros", icon: "Users" },
      { label: "Field Officers", path: "/state/field-officers", icon: "Users" },
      { label: "Administrative Data", path: "/state/administrative-data", icon: "Database" },
      { label: "Notifications", path: "/state/notifications", icon: "Bell" },
      { label: "Reports", path: "/state/reports", icon: "BarChart3" },
      { label: "Audit", path: "/state/audit", icon: "History" },
      { label: "Settings", path: "/state/settings", icon: "Settings" }
    ]
  },
  SYSTEM_ADMIN: {
    appTitle: "SYSTEM ADMINISTRATION",
    contextLabel: "Administrative Control Hub",
    baseRoute: "/admin",
    navItems: [
      { label: "Dashboard", path: "/admin/dashboard", icon: "LayoutDashboard" },
      { label: "Master Data", path: "/admin/master-data", icon: "Database" },
      { label: "Districts", path: "/admin/districts", icon: "MapPin" },
      { label: "Revenue Divisions", path: "/admin/revenue-divisions", icon: "Layers" },
      { label: "Mandals / Taluks", path: "/admin/subdistricts", icon: "Building" },
      { label: "Villages", path: "/admin/villages", icon: "MapPin" },
      { label: "Officer Directory", path: "/admin/officers", icon: "Users" },
      { label: "Create Officer", path: "/admin/officers/create", icon: "UserPlus" },
      { label: "Roles & Permissions", path: "/admin/roles", icon: "Shield" },
      { label: "Notifications", path: "/admin/notifications", icon: "Bell" },
      { label: "Audit", path: "/admin/audit", icon: "History" },
      { label: "Security", path: "/admin/security", icon: "Lock" },
      { label: "Settings", path: "/admin/settings", icon: "Settings" }
    ]
  }
};
