// Export utilities for different formats

export const exportToCSV = (data: any[], filename: string, headers: string[]) => {
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        if (typeof value === 'string' && value.includes('\n')) {
          return `"${value.replace(/"/g, '""').replace(/\n/g, '\\n')}"`;
        }
        return value;
      }).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportToJSON = (data: any[], filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportToExcel = async (data: any[], filename: string, headers: string[]) => {
  // Simple Excel export using CSV format that Excel can open
  // For more advanced Excel export, you would need a library like xlsx
  const csvContent = [
    '\ufeff' + headers.join(","), // Add BOM for proper UTF-8 handling in Excel
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const generatePDFContent = (data: any[], headers: string[], title: string) => {
  // Simple PDF content generation (basic text format)
  // For advanced PDF generation, you would need a library like jsPDF
  let content = `${title}\n\n`;
  content += headers.join(' | ') + '\n';
  content += '-'.repeat(headers.length * 15) + '\n';
  
  data.forEach(row => {
    content += headers.map(header => {
      const value = row[header] || '';
      return String(value).padEnd(12);
    }).join(' | ') + '\n';
  });
  
  return content;
};

export const exportToPDF = (data: any[], filename: string, headers: string[], title: string) => {
  const content = generatePDFContent(data, headers, title);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.txt`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const formatCurrency = (amount: number, currency: string = '₹') => {
  return `${currency}${amount.toLocaleString('en-IN')}`;
};

export const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-IN');
};

// Data transformation utilities
export const transformProjectSummary = (projects: any[], projectAnalytics: Record<string, any>) => {
  return projects.map(project => {
    const analytics = projectAnalytics[project.id];
    return {
      'Project Name': project.name,
      'Location': project.location,
      'Status': project.status,
      'Total Units': analytics?.overviewStats?.totalUnits || 0,
      'Booked Units': analytics?.overviewStats?.booked || 0,
      'Available Units': analytics?.overviewStats?.available || 0,
      'Revenue (₹ Cr)': analytics?.overviewStats?.revenue || 0,
      'Total Cost (₹)': analytics?.totalCost || 0,
      'Material Cost (₹)': analytics?.materialCost || 0,
      'Labour Cost (₹)': analytics?.labourCost || 0,
      'Other Cost (₹)': (analytics?.totalCost || 0) - (analytics?.materialCost || 0) - (analytics?.labourCost || 0),
      'Total Enquiries': analytics?.totalEnquiries || 0,
      'Converted Leads': analytics?.convertedLeads || 0,
      'Conversion Rate (%)': analytics?.conversionRate?.toFixed(1) || 0,
      'Budget (₹)': analytics?.budget || 0,
      'Budget Utilization (%)': analytics?.budget ? ((analytics?.totalCost || 0) / analytics?.budget * 100).toFixed(1) : 0,
      'Created Date': formatDate(project.createdAt),
      'Last Updated': formatDate(project.updatedAt)
    };
  });
};

export const transformFinancialData = (projects: any[], projectAnalytics: Record<string, any>) => {
  return projects.map(project => {
    const analytics = projectAnalytics[project.id];
    const totalCost = analytics?.totalCost || 0;
    const materialCost = analytics?.materialCost || 0;
    const labourCost = analytics?.labourCost || 0;
    const otherCost = totalCost - materialCost - labourCost;
    const revenue = parseFloat(analytics?.overviewStats?.revenue || 0) * 10000000; // Convert Cr to ₹
    const profitLoss = revenue - totalCost;
    const budget = analytics?.budget || 0;
    const budgetUtilization = budget ? (totalCost / budget * 100) : 0;

    return {
      'Project Name': project.name,
      'Location': project.location,
      'Total Cost (₹)': totalCost,
      'Material Cost (₹)': materialCost,
      'Labour Cost (₹)': labourCost,
      'Other Cost (₹)': otherCost,
      'Revenue (₹)': revenue,
      'Profit/Loss (₹)': profitLoss,
      'Profit/Loss Status': profitLoss >= 0 ? 'Profit' : 'Loss',
      'Budget (₹)': budget,
      'Budget Utilization (%)': budgetUtilization.toFixed(1),
      'ROI (%)': revenue ? ((profitLoss / revenue) * 100).toFixed(1) : 0,
      'Cost per Unit (₹)': analytics?.overviewStats?.totalUnits ? (totalCost / analytics?.overviewStats?.totalUnits).toFixed(0) : 0
    };
  });
};

export const transformLeadData = (leads: any[], projects: any[]) => {
  return leads.map(lead => ({
    'Lead ID': lead.id,
    'Name': lead.name,
    'Phone': lead.phone,
    'Email': lead.email,
    'Source': lead.source,
    'Budget (₹)': lead.budget || 0,
    'Requirement': lead.requirement || '',
    'Status': lead.status,
    'Project': projects.find(p => p.id === lead.projectId)?.name || 'N/A',
    'Created Date': formatDate(lead.createdAt),
    'Created Time': new Date(lead.createdAt).toLocaleTimeString('en-IN'),
    'Last Updated': formatDate(lead.updatedAt),
    'Days Since Creation': Math.floor((new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    'Priority': lead.budget && lead.budget > 10000000 ? 'High' : lead.budget && lead.budget > 5000000 ? 'Medium' : 'Low'
  }));
};

export const transformInventoryData = (projects: any[], projectAnalytics: Record<string, any>) => {
  return projects.map(project => {
    const analytics = projectAnalytics[project.id];
    const totalUnits = analytics?.overviewStats?.totalUnits || 0;
    const bookedUnits = analytics?.overviewStats?.booked || 0;
    const availableUnits = analytics?.overviewStats?.available || 0;
    const occupancyRate = totalUnits ? (bookedUnits / totalUnits * 100) : 0;

    return {
      'Project Name': project.name,
      'Location': project.location,
      'Status': project.status,
      'Total Units': totalUnits,
      'Plots': analytics?.unitOverview?.plots || 0,
      'Flats': analytics?.unitOverview?.flats || 0,
      'Villas': analytics?.unitOverview?.villas || 0,
      'Booked Units': bookedUnits,
      'Available Units': availableUnits,
      'Occupancy Rate (%)': occupancyRate.toFixed(1),
      'Occupancy Status': occupancyRate >= 80 ? 'High' : occupancyRate >= 50 ? 'Medium' : 'Low',
      'Total Revenue (₹ Cr)': analytics?.overviewStats?.revenue || 0,
      'Revenue per Unit (₹)': totalUnits ? (parseFloat(analytics?.overviewStats?.revenue || 0) * 10000000 / totalUnits).toFixed(0) : 0
    };
  });
};
