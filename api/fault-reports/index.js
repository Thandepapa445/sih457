// Fault reports API endpoint for Vercel
// This is a simplified version that returns mock data for now

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Mock data for demonstration
  const mockFaultReports = [
    {
      id: "1",
      title: "Air Conditioning Malfunction",
      description: "AC unit in room 205 is not cooling properly",
      priority: "high",
      status: "pending",
      department: "maintenance",
      location: "Room 205",
      reportedBy: "John Doe",
      createdAt: new Date().toISOString(),
      attachments: []
    },
    {
      id: "2", 
      title: "Electrical Issue",
      description: "Power outlet not working in conference room",
      priority: "medium",
      status: "in-progress",
      department: "electrical",
      location: "Conference Room A",
      reportedBy: "Jane Smith",
      createdAt: new Date().toISOString(),
      attachments: []
    }
  ];

  if (req.method === 'GET') {
    res.status(200).json({
      data: mockFaultReports,
      total: mockFaultReports.length,
      page: 1,
      limit: 10
    });
  } else if (req.method === 'POST') {
    // Handle creating new fault report
    const newReport = {
      id: String(Date.now()),
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString(),
      attachments: []
    };
    
    res.status(201).json(newReport);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}