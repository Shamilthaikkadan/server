import { writeFile, readFile, broadcastNotification } from '../index.js';

export const addCustomer = (req, res) => {
  const { name, email, phone, magazine } = req.body;

  if (!name || !email || !phone) {
    return res
      .status(400)
      .json({ message: 'Customer Name, Email, and Phone Number are required.' });
  }

  readFile((err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading file' });
    }

    let customers;
    try {
      customers = JSON.parse(data || '[]');
    } catch (parseErr) {
      return res.status(500).json({ message: 'Error parsing file data' });
    }

    const isSubscriber = magazine && magazine.magazineName;
    const customerType = isSubscriber ? 'Subscriber' : 'Normal Customer';

    const newCustomer = {
      id: customers.length + 1,
      name,
      email,
      phone,
      magazine: isSubscriber ? {
        ...magazine,
        subscriptionStartDate: magazine.subscriptionStartDate || ''
      } : null,
      type: customerType
    };

    customers.push(newCustomer);

    writeFile(JSON.stringify(customers, null, 2), err => {
      if (err) {
        return res.status(500).json({ message: 'Error writing file' });
      }

      const notificationMessage = {
        type: 'Customer Created',
        customer: newCustomer,
        timestamp: new Date().toISOString()
      };
      broadcastNotification(notificationMessage);

      res
        .status(200)
        .json({ message: 'Customer added successfully', customer: newCustomer });
    });
  });
};

export const getCustomer = (req, res) => {
  const { name } = req.query;

  readFile((err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading file' });
    }

    let customers;
    try {
      customers = JSON.parse(data || '[]');
    } catch (parseErr) {
      return res.status(500).json({ message: 'Error parsing file data' });
    }

    let filteredCustomers = customers;

    if (name) {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    filteredCustomers = filteredCustomers.map(customer => {
      if (customer.magazine && customer.magazine.subscriptionStartDate) {
        const startDate = new Date(customer.magazine.subscriptionStartDate);
        const expiryDate = new Date(startDate);
        expiryDate.setFullYear(startDate.getFullYear() + 1);
        customer.magazine.expiryDate = expiryDate.toISOString().split('T')[0];
      }
      return customer;
    });
    res.status(200).json(filteredCustomers);
  });
};

export const customerDashboardData = (req, res) => {
  readFile((err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading file' });
    }

    let customers;
    try {
      customers = JSON.parse(data || '[]');
    } catch (parseErr) {
      return res.status(500).json({ message: 'Error parsing file data' });
    }

    const totalCustomers = customers.length;
    const totalMagazineSubscribers = customers.filter(customer => customer.magazine).length;

    res.status(200).json({
      totalCustomers,
      totalMagazineSubscribers,
    });
  });
};

export const magazineCustomerData = (req, res) => {
  readFile((err, customerData) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading customer file' });
    }

    let customers;
    try {
      customers = JSON.parse(customerData || '[]');
    } catch (parseErr) {
      return res.status(500).json({ message: 'Error parsing customer file data' });
    }

    const magazineCustomers = customers.filter(customer => customer.magazine);

    res.status(200).json({
      totalMagazines: magazineCustomers.length,
      magazineCustomers
    });
  });
};



export const graphData = (req, res) => {
  readFile((err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading file' });
    }

    let customers;
    try {
      customers = JSON.parse(data || '[]');
    } catch (parseErr) {
      return res.status(500).json({ message: 'Error parsing file data' });
    }

    const monthlyCounts = {};

    customers.forEach(customer => {
      if (customer.magazine && customer.magazine.subscriptionStartDate) {
        const startDate = new Date(customer.magazine.subscriptionStartDate);
        if (!isNaN(startDate.getTime())) { 
          const monthYear = `${startDate.getFullYear()}-${startDate.getMonth() + 1}`;

          monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
        }
      }
    });

    const allSubscriptionDates = customers
      .map(c => c.magazine?.subscriptionStartDate)
      .filter(date => date !== undefined)
      .map(date => new Date(date))
      .filter(date => !isNaN(date.getTime())); 

    if (allSubscriptionDates.length === 0) {
      return res.status(200).json([]); 
    }

    const startYear = new Date(Math.min(...allSubscriptionDates)).getFullYear();
    const endYear = new Date(Math.max(...allSubscriptionDates)).getFullYear();

    const result = [];

    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthYear = `${year}-${month}`;
        const count = monthlyCounts[monthYear] || 0;
        result.push({ month: monthYear, count });
      }
    }

    res.status(200).json(result);
  });
};






export const deleteCustomer = (req, res) => {
  const { id } = req.params;
  const customerId = parseInt(id, 10);

  if (isNaN(customerId)) {
    return res.status(400).json({ message: 'Invalid customer ID' });
  }

  readFile((err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading file' });
    }

    let customers;
    try {
      customers = JSON.parse(data || '[]');
    } catch (parseErr) {
      return res.status(500).json({ message: 'Error parsing file data' });
    }

    const customerIndex = customers.findIndex(customer => customer.id === customerId);

    if (customerIndex === -1) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const deletedCustomer = customers.splice(customerIndex, 1)[0];

    writeFile(JSON.stringify(customers, null, 2), err => {
      if (err) {
        return res.status(500).json({ message: 'Error writing file' });
      }

      const notificationMessage = {
        type: 'Customer Deleted',
        deletedCustomer,
        timestamp: new Date().toISOString()
      };
      broadcastNotification(notificationMessage);

      res.status(200).json({
        message: 'Customer deleted successfully',
        deletedCustomer
      });
    });
  });
};

export const editCustomer = (req, res) => {
  const { id } = req.params;
  const customerId = parseInt(id, 10);
  const { name, email, phone } = req.body;

  if (isNaN(customerId)) {
    return res.status(400).json({ message: 'Invalid customer ID' });
  }

  const updatedData = { name, email, phone };

  for (const key in updatedData) {
    if (updatedData[key] === undefined) {
      delete updatedData[key];
    }
  }

  if (Object.keys(updatedData).length === 0) {
    return res.status(400).json({ message: 'At least one field (name, email, phone) is required to update.' });
  }

  readFile((err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading file' });
    }

    let customers;
    try {
      customers = JSON.parse(data || '[]');
    } catch (parseErr) {
      return res.status(500).json({ message: 'Error parsing file data' });
    }

    const customerIndex = customers.findIndex(customer => customer.id === customerId);

    if (customerIndex === -1) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    customers[customerIndex] = { ...customers[customerIndex], ...updatedData };

    writeFile(JSON.stringify(customers, null, 2), err => {
      if (err) {
        return res.status(500).json({ message: 'Error writing file' });
      }

      const notificationMessage = {
        type: 'Customer Updated',
        customer: customers[customerIndex],
        timestamp: new Date().toISOString()
      };
      broadcastNotification(notificationMessage);

      res.status(200).json({
        message: 'Customer updated successfully',
        customer: customers[customerIndex],
      });
    });
  });
};

export const renewMagazine = (req, res) => {
  const { id } = req.params;
  const customerId = parseInt(id, 10);

  if (isNaN(customerId)) {
    return res.status(400).json({ message: 'Invalid customer ID' });
  }

  readFile((err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading file' });
    }

    let customers;
    try {
      customers = JSON.parse(data || '[]');
    } catch (parseErr) {
      return res.status(500).json({ message: 'Error parsing file data' });
    }

    const customerIndex = customers.findIndex(customer => customer.id === customerId);

    if (customerIndex === -1) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const customer = customers[customerIndex];

    if (!customer.magazine || !customer.magazine.subscriptionStartDate) {
      return res.status(400).json({ message: 'Customer does not have a magazine subscription' });
    }

    const startDate = new Date(customer.magazine.subscriptionStartDate);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);

    customer.magazine.subscriptionStartDate = startDate.toISOString().split('T')[0];
    customer.magazine.expiryDate = endDate.toISOString().split('T')[0];

    writeFile(JSON.stringify(customers, null, 2), err => {
      if (err) {
        return res.status(500).json({ message: 'Error writing file' });
      }

      // const notificationMessage = {
      //   type: 'Magazine Renewed',
      //   customer: customers[customerIndex],
      //   timestamp: new Date().toISOString()
      // };
      // broadcastNotification(notificationMessage);

      res.status(200).json({
        message: 'Magazine subscription renewed successfully',
        customer: customers[customerIndex],
      });
    });
  });
};
