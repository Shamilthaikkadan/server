import { readUserFile, writeUserFile } from '../index.js';

export const getProfile = (req, res) => {
  readUserFile((err, data) => {
    if (err) {
      // console.error('Error reading file:', err);
      return res.status(500).json({ message: 'Error reading file.' });
    }

    let profileData;
    try {
      profileData = JSON.parse(data);
    } catch (parseErr) {
      // console.error('Error parsing file data:', parseErr);
      return res.status(500).json({ message: 'Error parsing file data.' });
    }

    if (profileData.length === 0) {
      return res.status(404).json({ message: 'No profiles found.' });
    }

    return res.status(200).json(profileData[0]);
  });
};

export const updateProfile = (req, res) => {
  const { name, email, phone } = req.body;

  const updatedData = { name, email, phone };
  
  for (const key in updatedData) {
    if (updatedData[key] === undefined) {
      delete updatedData[key];
    }
  }

  if (Object.keys(updatedData).length === 0) {
    return res.status(400).json({ message: 'At least one field (name, email, phone) is required to update.' });
  }

  readUserFile((err, data) => {
    if (err) {
      // console.error('Error reading file:', err);
      return res.status(500).json({ message: 'Error reading file.' });
    }

    let profileData;
    try {
      profileData = JSON.parse(data);
    } catch (parseErr) {
      console.error('Error parsing file data:', parseErr);
      return res.status(500).json({ message: 'Error parsing file data.' });
    }


    if (profileData.length === 0) {
      return res.status(404).json({ message: 'No profiles found.' });
    }

    profileData[0].username = name;

    writeUserFile(JSON.stringify(profileData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error writing file:', writeErr);
        return res.status(500).json({ message: 'Error writing file.' });
      }

      return res.status(200).json({
        message: 'Username updated successfully.',
        profile: profileData[0],
      });
    });
  });
};
